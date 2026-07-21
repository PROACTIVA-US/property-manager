# Original PropertyManager recovery snapshot

This directory preserves the PropertyManager application that was recognized as the original `house.wildvine.net` experience on July 20, 2026.

## Provenance

- Historical source commit: `c59a00a255aae0cca8e952f4ac1d519f91e6b04c`
- Commit date: February 19, 2026
- Commit subject: `fix: root route should redirect to /home, not show teacher profile`
- Recovery reason: this is the last known build before commit `ef1fd81` removed demo mode, the three-role switcher, and the combined House/Teach portal.
- Original product requirements supplied by Dan are preserved at `docs/ORIGINAL_PRD.md`.

## Recognized behavior

- Three distinct views: Owner, Property Manager, and Tenant
- Owner: Shanie Holman
- Tenants: Gregg Marshall and Miranti Marshall
- Property: 14102 129th Ave NE, Kirkland, WA 98034
- Financial calculator, lease screens, maintenance tracking, documents, gallery, Zillow integration, vendors, projects, and messaging
- `Try demo mode` on the login screen provides access without a password

## Run locally

```bash
cd PropertyManager
npm ci
```

The app requires these public browser configuration variables even when using demo mode:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Then run:

```bash
npm run dev
```

Open the displayed local URL, expand **Try demo mode**, and choose a role.

## Data recovery status

The source and built-in defaults are preserved here. Historical uploaded property photos and the signed lease were not committed to Git. The production Supabase project had no property, tenant, document, project, or expense records when inspected on July 20, 2026, and its relevant storage buckets were empty. Browser storage remnants did preserve settings and sample app state, but no `pm_property_gallery` or `propertymanager_documents` payload was found.

Do not treat this directory as the active production application without first reviewing authentication, dependency vulnerabilities, database migrations, and data persistence.
