# Rebuild Architecture

Status: proposed
Decision: one Next.js application, one Supabase project, one authoritative data path

## Why change the application architecture

The current Vite client performs authentication, data access, mock fallback, calculations, uploads, AI calls, and routing in the browser. That made it easy for local-only features to masquerade as shared product features. The rebuild needs an explicit server boundary for invitations, approvals, imports, exports, and privileged transitions.

Next.js App Router is the recommended application layer because it supports nested role-aware layouts, server rendering, route-level loading/error states, and Route Handlers for the approval/API workflows already requested. Supabase remains the database, authentication, and file platform. Vercel remains the deployment platform.

Primary references:

- Next.js App Router: <https://nextjs.org/docs/app>
- Next.js Route Handlers: <https://nextjs.org/docs/app/glossary#route-handler>
- Supabase server-side authentication: <https://supabase.com/docs/guides/auth/server-side>
- Supabase RLS: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Supabase data security: <https://supabase.com/docs/guides/database/secure-data>

## Repository layout

```text
app/
  (public)/
    sign-in/
    approval/[token]/
  (workspace)/
    layout.tsx
    today/
    work/
    people/
    money/
    property/
    inbox/
    admin/
  api/
    approvals/
    imports/
    exports/
components/
  ui/
  shell/
  work/
  money/
  property/
lib/
  auth/
  data/
  domain/
  validation/
supabase/
  migrations/
  tests/
tests/
  e2e/
legacy/
  README.md
```

The recovered app must not remain a nested installable package in the active source tree. If retained after archival, it belongs under `legacy/` without `node_modules`, deployment config, or active CI discovery.

## Runtime boundaries

### Browser

- renders interactive UI;
- holds harmless UI preferences;
- uploads directly to a scoped signed upload target when appropriate;
- never receives service-role credentials or third-party AI secrets;
- never invents production sample records.

### Next.js server

- verifies sessions and memberships;
- handles invite administration, protected exports/imports, external approvals, and privileged transitions;
- issues signed file URLs;
- owns all secret-key integrations;
- returns typed domain errors rather than database details.

### Supabase/Postgres

- authoritative business state;
- RLS defense in depth for every exposed table;
- database constraints for state, amount, membership, and ownership invariants;
- transactional functions for approval decisions and financial corrections;
- audit/event records for sensitive transitions.

### Supabase Storage

- private `property-files` bucket for documents, receipts, lease files, and work evidence;
- deterministic path prefix: `{property_id}/{domain}/{record_id}/{file_id}`;
- metadata row created in the same application workflow;
- signed read URLs scoped by membership and visibility.

## Core data model

### Identity and access

- `profiles`: identity-facing name and contact metadata.
- `properties`: canonical property record.
- `property_memberships`: `property_id`, `profile_id`, `role`, status, invitation metadata.
- `households`: tenant household grouping.
- `household_members`: household/profile relationship.

Roles are property-scoped: `admin`, `manager`, `owner`, `tenant`. A global `platform_admin` claim is reserved for emergency administration and is not used for normal product navigation.

### Lease and property

- `leases`: property, household, term, rent, deposit, status.
- `lease_parties`: people and signature/party role.
- `property_documents`: metadata, visibility, storage path, category.
- `property_photos`: attachment metadata, order, caption, visibility.
- `property_value_observations`: value, as-of date, source label, source URL, notes.

### Work

- `work_orders`: canonical issue/task/project record.
- `work_order_events`: append-only state/activity timeline.
- `work_order_assignments`: manager/vendor assignments.
- `work_order_milestones`: optional phases for larger jobs.
- `work_order_attachments`: evidence and estimate documents.
- `work_order_approvals`: addressee, question, threshold, result, decision metadata.
- `approval_links`: hash, expiry, use/revoke metadata; raw token is never stored.
- `maintenance_schedules`: recurring preventive work definitions.

### Communication

- `conversations`: property plus optional related entity.
- `conversation_participants`: profile and read cursor.
- `messages`: sender, body, event type, timestamps.
- `message_attachments`: private attachment references.
- `notifications`: derived delivery record, never sample data.

### Money

- `ledger_entries`: rent charge, payment, expense, adjustment, refund, deposit movement.
- `ledger_allocations`: links payments/adjustments to charges.
- `expense_details`: vendor, category, work order, receipt.
- `financial_scenarios`: owner-private calculator inputs and named snapshots.

Financial history is corrected by reversing/adjusting entries, not overwriting or deleting posted entries.

## Authorization model

Every request resolves:

1. authenticated profile;
2. active property membership;
3. role capability;
4. record visibility or participant relationship.

UI guards improve experience but are never the security boundary. RLS policies repeat the property membership check. Tenant policies additionally require the current household/lease relationship. Owner-private tables use owner membership and explicit column/table separation rather than hiding fields only in UI.

Policy tests must assert both positive and negative cases for every role.

## Authentication

- invite-only access;
- magic link and password recovery in version 1;
- optional Google OAuth after invite matching is implemented;
- server-readable cookie session using the supported Supabase SSR client pattern;
- no public role choice;
- no password storage or password viewing by admins.

## Approval security

The existing hardened RPC concept is retained:

1. generate at least 32 cryptographically random bytes;
2. store only a SHA-256 hash;
3. attach link to one approval and one intended action;
4. enforce expiry and revocation;
5. make decision transaction atomic and idempotent;
6. write the decision and work-order transition to the audit log;
7. return generic public errors without record enumeration.

The public URL should be `/approval/{token}` rather than a token query parameter so analytics and logs can be configured to redact the segment consistently. Referrer policy must prevent token leakage.

## Data access convention

Pages and components never call Supabase ad hoc. They use typed server queries/commands in `lib/data` and domain transitions in `lib/domain`.

- Queries return presentation-ready view models.
- Commands validate with a shared schema and return typed results.
- Only domain services may change work-order state or post ledger corrections.
- Generated database types are checked into source after each migration.
- No sync/async duplicate API pairs and no demo fallback branches.

## Migration strategy

1. Export production Supabase schema/data and Storage inventory before destructive changes.
2. Export any recoverable browser data from the original browser profile using a one-time read-only tool.
3. Classify every record as authoritative, operator-confirmed, mock, duplicate, or obsolete.
4. Create the new schema alongside legacy tables.
5. Import only operator-confirmed records with source provenance.
6. Run reconciliation reports for people, lease, documents, work, and money.
7. Cut the application to new tables only after acceptance.
8. Retain legacy exports encrypted and access-controlled for a defined rollback period.

No automatic migration should treat local defaults as real data.

## Deployment

- Vercel project connects to the GitHub repository and deploys the new root app.
- `house.wildvine.net` is the canonical production domain.
- preview deployments use a separate Supabase branch/project and synthetic fixtures.
- production environment variables are set through the Vercel/Supabase integration or encrypted Vercel variables, never committed.
- database migrations run as a gated production step, not from arbitrary page loads.
- smoke checks cover sign-in, each role home, signed file access, maintenance submission, and approval decision.

## Observability and recovery

- structured server logs with request IDs and token/PII redaction;
- error tracking for server and client exceptions;
- audit log for membership, approval, work-state, document, and financial mutations;
- daily database backup plus separate Storage backup/export plan;
- health screen for integration status without exposing secrets;
- documented rollback for app deployment and forward-fix migration policy.
