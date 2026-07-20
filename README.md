# Property Manager

A React, TypeScript, and Supabase application for property operations, issues, vendors, documents, financials, and projects.

The app is served below `/property/`. Vercel redirects the domain root there and rewrites client-side routes to the Vite entry point.

## Local development

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:5180/property/`.

Required browser configuration:

- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: public Supabase anon/client key.
- `VITE_ALLOWED_EMAILS`: optional comma-separated sign-in allowlist.

Never store a provider secret in a `VITE_*` variable. Vite embeds those values in the public browser bundle. The AI project generator stays in mock mode unless it is moved behind a server-side proxy.

## Database

Migrations live in `supabase/migrations`. Link the intended project and review the pending list before applying changes:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase migration list --linked
supabase db push --linked
```

The client-approval migration adds:

- a private `approval_requests` table;
- a public image bucket with staff-only uploads;
- hashed, expiring, one-time approval tokens;
- public lookup and decision functions with limited return fields;
- atomic approved-request conversion into the existing Projects Kanban.

## Client approval workflow

1. An owner, property manager, or admin opens **Issues & Approvals**.
2. **Request approval** accepts a decision question, context, and stitched composite image.
3. The app creates a 30-day client portal link. Only the token hash is retained by the database.
4. The client reviews the evidence and confirms Approve or Decline.
5. Approval atomically creates a high-priority project in the `approved` Kanban stage. Reusing the link is rejected.

## Quality checks

```bash
npm run build
npm run lint
npm test
npm audit --audit-level=low
```

## Deployment

Create or link a Vercel project, add the required `VITE_SUPABASE_*` environment variables for Production and Preview, then deploy. The canonical entry point is `/property/`; `/` redirects there automatically.
