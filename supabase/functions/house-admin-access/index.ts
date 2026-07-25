import { createClient } from 'npm:@supabase/supabase-js@2.95.3';

const allowedOrigins = new Set([
  'https://house.wildvine.net',
  'https://property-manager-beige.vercel.app',
  'http://localhost:5180',
  'http://127.0.0.1:5180',
]);

const allowedRoles = new Set(['admin', 'manager', 'owner', 'tenant']);

function originIsAllowed(origin: string) {
  return (
    allowedOrigins.has(origin) ||
    /^https:\/\/property-manager-[a-z0-9-]+-proactiva\.vercel\.app$/.test(
      origin,
    )
  );
}

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': originIsAllowed(origin)
      ? origin
      : 'https://house.wildvine.net',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(
  request: Request,
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json',
    },
  });
}

function requiredString(
  body: Record<string, unknown>,
  key: string,
  maximumLength = 500,
) {
  const value = typeof body[key] === 'string' ? body[key].trim() : '';
  if (!value) throw new Error(`${key} is required.`);
  if (value.length > maximumLength) throw new Error(`${key} is too long.`);
  return value;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(request) });
  }
  if (request.method !== 'POST') {
    return json(request, { error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return json(request, { error: 'Server authentication is unavailable.' }, 500);
  }

  const authorization = request.headers.get('authorization') ?? '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  if (!token) return json(request, { error: 'Sign in is required.' }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user: caller },
    error: callerError,
  } = await admin.auth.getUser(token);
  if (callerError || !caller) {
    return json(request, { error: 'Your session is not valid.' }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(request, { error: 'A JSON request body is required.' }, 400);
  }

  let propertyId: string;
  try {
    propertyId = requiredString(body, 'propertyId', 100);
  } catch (error) {
    return json(
      request,
      { error: error instanceof Error ? error.message : 'Invalid property.' },
      400,
    );
  }

  const { data: callerMembership, error: membershipError } = await admin
    .from('property_memberships')
    .select('id')
    .eq('property_id', propertyId)
    .eq('profile_id', caller.id)
    .eq('role', 'admin')
    .eq('status', 'active')
    .maybeSingle();

  if (membershipError) {
    return json(request, { error: 'Access could not be verified.' }, 500);
  }
  if (!callerMembership) {
    return json(
      request,
      { error: 'Only an active property administrator can do that.' },
      403,
    );
  }

  try {
    if (body.action === 'set_password') {
      const profileId = requiredString(body, 'profileId', 100);
      const temporaryPassword = requiredString(
        body,
        'temporaryPassword',
        200,
      );
      if (temporaryPassword.length < 6) {
        return json(
          request,
          { error: 'Temporary passwords need at least 6 characters.' },
          400,
        );
      }

      const { data: targetMembership, error: targetError } = await admin
        .from('property_memberships')
        .select('id')
        .eq('property_id', propertyId)
        .eq('profile_id', profileId)
        .maybeSingle();
      if (targetError) throw targetError;
      if (!targetMembership) {
        return json(
          request,
          { error: 'That user does not belong to this property.' },
          404,
        );
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(
        profileId,
        { password: temporaryPassword },
      );
      if (updateError) throw updateError;
      return json(request, { success: true });
    }

    if (body.action === 'provision_user') {
      const email = requiredString(body, 'email', 320).toLowerCase();
      const displayName = requiredString(body, 'displayName', 160);
      const temporaryPassword = requiredString(
        body,
        'temporaryPassword',
        200,
      );
      const role = requiredString(body, 'role', 20);
      const householdId =
        typeof body.householdId === 'string' && body.householdId
          ? body.householdId
          : null;

      if (!email.includes('@')) {
        return json(request, { error: 'Enter a valid email address.' }, 400);
      }
      if (temporaryPassword.length < 6) {
        return json(
          request,
          { error: 'Temporary passwords need at least 6 characters.' },
          400,
        );
      }
      if (!allowedRoles.has(role)) {
        return json(request, { error: 'Choose a valid property role.' }, 400);
      }

      const { data: usersPage, error: usersError } =
        await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (usersError) throw usersError;
      const existingUser = usersPage.users.find(
        (user) => user.email?.toLowerCase() === email,
      );
      if (existingUser) {
        return json(
          request,
          {
            error:
              'That email already has an account. Open its existing access record instead.',
          },
          409,
        );
      }

      const { data: created, error: createError } =
        await admin.auth.admin.createUser({
          email,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: { display_name: displayName },
        });
      if (createError || !created.user) {
        throw createError ?? new Error('The account could not be created.');
      }

      const profileId = created.user.id;
      let createdPersonId: string | null = null;
      try {
        const { data: existingPerson, error: personLookupError } = await admin
          .from('people')
          .select('id')
          .ilike('email', email)
          .maybeSingle();
        if (personLookupError) throw personLookupError;

        let personId = existingPerson?.id ?? null;
        if (!personId) {
          const { data: person, error: personError } = await admin
            .from('people')
            .insert({
              display_name: displayName,
              email,
              source_provenance: {
                source_kind: 'house_application',
                classification: 'authoritative',
              },
              verified_at: new Date().toISOString(),
            })
            .select('id')
            .single();
          if (personError) throw personError;
          personId = person.id;
          createdPersonId = person.id;
        }

        const { data: existingProfile, error: profileLookupError } = await admin
          .from('profiles')
          .select('id')
          .eq('id', profileId);
        if (profileLookupError) throw profileLookupError;

        const profileValues = {
          id: profileId,
          email,
          display_name: displayName,
          role: 'tenant' as const,
          person_id: personId,
        };
        const profileQuery = existingProfile?.length
          ? admin
              .from('profiles')
              .update({
                display_name: displayName,
                person_id: personId,
              })
              .eq('id', profileId)
          : admin.from('profiles').insert(profileValues);
        const { error: profileError } = await profileQuery;
        if (profileError) throw profileError;

        const { error: propertyMembershipError } = await admin
          .from('property_memberships')
          .insert({
            property_id: propertyId,
            profile_id: profileId,
            role,
            status: 'active',
            invited_by: caller.id,
            invited_at: new Date().toISOString(),
            activated_at: new Date().toISOString(),
          });
        if (propertyMembershipError) throw propertyMembershipError;

        if (role === 'tenant' && householdId) {
          const { data: household, error: householdError } = await admin
            .from('households')
            .select('id')
            .eq('id', householdId)
            .eq('property_id', propertyId)
            .maybeSingle();
          if (householdError) throw householdError;
          if (!household) {
            throw new Error('The selected household does not belong to House.');
          }
          const { error: householdMemberError } = await admin
            .from('household_members')
            .upsert(
              {
                household_id: householdId,
                person_id: personId,
                profile_id: profileId,
                relationship: 'tenant',
              },
              { onConflict: 'household_id,person_id' },
            );
          if (householdMemberError) throw householdMemberError;
        }

        return json(request, {
          success: true,
          profileId,
          email,
          role,
        });
      } catch (error) {
        if (createdPersonId) {
          await admin.from('people').delete().eq('id', createdPersonId);
        }
        await admin.auth.admin.deleteUser(profileId);
        throw error;
      }
    }

    return json(request, { error: 'Unknown admin action.' }, 400);
  } catch (error) {
    console.error('house-admin-access error', error);
    return json(
      request,
      {
        error:
          error instanceof Error
            ? error.message
            : 'The admin action could not be completed.',
      },
      500,
    );
  }
});
