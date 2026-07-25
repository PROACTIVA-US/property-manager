# Property Manager Rebuild Audit

Status: audit complete; visual direction and implementation approval pending
Date: 2026-07-21
Scope: the current root application and the recovered historical application in `PropertyManager/`

## Executive conclusion

The repository contains two snapshots of the same product lineage, not two cleanly separated products:

- The root is the newer production-oriented application. It added hardened Supabase authentication, an admin role, and tokenized client approvals.
- `PropertyManager/` is the recovered historical application. It preserves the older demo role switcher, Google OAuth, and the abandoned TeachAssist/House hub experiment.
- The nested placement makes the repository look like one app containing another. Both packages have the same package name, nearly identical source trees, their own lockfiles, and overlapping Vite configurations.

The product cannot be repaired by restyling screens. Its main failure is that navigation, authorization, persistence, and the domain model disagree. The correct course is a clean application shell and data model, with the two existing apps retained only as behavioral evidence until migration is complete.

## Method

This audit included:

- source inventory of routes, pages, components, libraries, migrations, tests, and package manifests;
- live desktop and mobile browser review across all three user roles;
- 41 captured route/viewport states with console, overflow, document-height, and unlabeled-control checks;
- comparison of the current and recovered packages;
- production Supabase inventory performed earlier in the recovery session;
- current dependency vulnerability scans and test runs;
- market-pattern review of AppFolio, Buildium, DoorLoop, and Zillow Rental Manager.

No production data was changed as part of this audit.

## Repository anatomy

| Area | Current root | Recovered `PropertyManager/` |
| --- | --- | --- |
| Purpose | Newer deployment candidate | Historical source snapshot |
| UI pages | 24 | 27 |
| Components | 84 | 88 |
| Library modules | 29 | 29 |
| Test files | 9 | 8 |
| Authentication | Email/password, Supabase profile roles | Email/password, Google OAuth, demo role switcher |
| Roles | owner, tenant, pm, admin | owner, tenant, pm |
| Extra product | Client approval and admin | TeachAssist and House/Teach hub |
| Router base | `/property` | `/` |
| Persistence | Supabase plus extensive browser storage | Supabase plus extensive browser storage and demo data |

The recovered package belongs in an archive, not inside the active application tree. Until its archival pull request is merged, it should remain untouched as a reference snapshot.

## Critical findings

### 1. There is no single source of truth

The current application spreads business data across:

- Supabase tables and Storage;
- browser `localStorage`;
- IndexedDB migration scaffolding;
- hard-coded defaults and mock fixtures;
- unreachable demo-mode branches.

Several entities exist in more than one system. Expenses use the same browser-storage key in both `Expenses.tsx` and `Maintenance.tsx`. Messages, projects, documents, and vendors have async Supabase paths plus synchronous demo/local paths. Tenant payment, lease, maintenance, and message data are initialized from mock records. Gallery images are stored as base64 in the browser. Settings contain property, owner, tenant, mortgage, tax, utility, and account records that overlap database entities.

Consequence: logging in from another browser, device, account, or deployment can appear to “lose” data even when the old browser still has it.

### 2. Routes, navigation, and role policy disagree

Examples in the current root app:

- `/properties` renders the dashboard instead of a property view.
- `/expenses` renders the maintenance page.
- `/payments` and `/lease` render `TenantPortal` without the route parameter it requires, so both redirect or fail to show their intended section.
- owner, PM, and tenant route access includes pages that their navigation hides.
- settings render the generic owner information form in the shared Account tab, including for a tenant.
- the admin dashboard falls through a separate dashboard implementation and navigation policy.
- catch-all routes display “Coming Soon” inside the authenticated shell instead of returning a real not-found state.

Consequence: the interface exposes the implementation history rather than a coherent job-based product.

### 3. Real, mock, and stale data are indistinguishable

The code includes known-real stakeholder and property defaults alongside a generic sample address, fake balances, sample notices, generated issues, placeholder lease links, fake unread counts, and mock messages. The production database inventory contained no property, tenant, document, project, or expense records at the time of inspection.

Consequence: users cannot tell whether a number or record is authoritative. This is unacceptable for rent, lease, ownership, or financial decisions.

### 4. The product model is duplicated

An operational item can be represented as an issue, maintenance task, project, project phase, approval request, tenant responsibility, inspection, notification, vendor job, or expense. These types are not connected by one reliable lifecycle. The client-approval feature can create a project, but the broader UI presents issues and maintenance as parallel systems.

Consequence: work can be missed, double-entered, or shown with conflicting status.

### 5. The old portal experiment is still contaminating the product

The recovered app includes a House/Teach switcher, `/teach`, teacher profile migrations, and contact-submission tables. The root removed the teaching pages but retained the teacher migrations. This explains the remembered Vercel hub, but it is not part of the property product.

Consequence: deployment, database schema, and identity boundaries remain harder to reason about.

### 6. Privacy-sensitive information is embedded in client defaults

Household, owner, property, mortgage, utility, tax, and account fields are stored in browser-accessible settings and source defaults. Browser storage is per-origin, not a secure shared database, and source defaults can ship in the public JavaScript bundle.

Consequence: the rebuild must keep real property and household records in protected database rows, never committed fixtures.

## Live UX audit

### Shared problems

- Typography is too small and low contrast for an operational app.
- Dark panels, bright white panels, purple accents, pale-blue 3D canvas, and generic cards have no shared visual language.
- Pages alternate between enormous empty areas and extreme interaction density.
- Primary actions and current status are rarely obvious.
- Placeholder features look equally authoritative as real features.
- Desktop navigation is squeezed into mobile rather than redesigned for mobile tasks.
- Error and empty states do not explain recovery actions or data provenance.

### Sign-in and public approval

- The current sign-in modal floats over an almost-empty protected layout and is cramped on mobile.
- Public sign-up is offered despite the product being a private household workspace.
- The invalid approval page is almost entirely empty and gives no manager contact, request reference, or clear way to request a new link.
- Root production emitted a missing PWA icon/manifest error because `/icons/icon.svg` ignores the `/property` base path.

### Property manager view

- The dashboard contains only a few generic cards and wastes most of the viewport.
- The sidebar repeats product naming and uses small, low-contrast labels.
- Issues, maintenance, projects, and expenses overlap conceptually.
- Maintenance/expenses reached more than 100 interactive controls in one sampled state.
- Rent charts were empty or visually negligible.
- Tenant, lease, vendor, and settings screens are long flat forms with weak hierarchy.
- The mobile dashboard preserves a desktop sidebar, leaving a narrow content sliver.

### Owner view

- The owner layout removes the sidebar but does not replace it with complete navigation.
- The remembered House/Teach switcher appears in the historical version even though it is a separate product concern.
- The owner home view is three navigation cards rather than an investment/status summary.
- Financials are sparse and do not tell a decision story.
- Accounts contain many unlabeled icon buttons and deeply stacked forms.
- Documents and gallery switch to bright white surfaces inside a dark product.
- The 3D view is a large empty canvas and raised an uncaught promise error in the recovered app.

### Tenant view

- The dashboard duplicates navigation cards already present in the sidebar.
- Mobile is materially broken by the desktop sidebar and clipped/narrow content.
- Payments and Lease routes do not reliably open their named sections.
- The maintenance route can show a dense property checklist intended for owner/PM work rather than a focused request flow.
- Tenant settings show an owner-shaped Account form.
- Actual household names can appear beside a generic sample property and mock financial status.

### Accessibility observations

- Sampled screens contained unlabeled interactive elements, including 15 on the owner Accounts screen.
- Icon-only buttons rely on title text instead of consistent accessible names.
- Low-contrast gray text and very small labels reduce readability.
- Dense tables/forms lack a consistent keyboard and error-summary pattern.
- No horizontal overflow appeared in sampled desktop states, but the mobile information architecture was still unusable.

## Engineering and security audit

### Current root

- `npm test -- --run`: 9 files passed, 203 tests passed.
- `npm run build`: passed; production bundle emitted a mixed static/dynamic import warning for notifications.
- `npx eslint src`: passed.
- repo-wide `npm run lint`: failed because ESLint traverses the nested recovered package and reports its errors as though they belong to the active app. This is another concrete consequence of nesting two packages.
- `npm audit`: 0 known vulnerabilities at audit time.
- The client bundle directly includes an Anthropic SDK path; secrets must never be browser-exposed.
- Supabase RLS exists on original tables, but the data model cannot express a two-person tenant household or flexible property memberships cleanly.
- Role defaults can fall back to tenant when a profile is absent, while sign-up remains available.
- The app uses a public client for a mixture of direct table operations and RPCs without one repository/service boundary.

### Recovered snapshot

- The isolated test command failed before collecting tests because the nested runner resolved the setup module to the parent root. Two same-named Vite/Vitest projects nested together are not a stable test boundary.
- `npm run build`: passed with the same notifications chunking warning.
- `npx eslint src`: failed with 9 errors: six explicit `any` violations and three synchronous state updates inside effects.
- `npm audit`: 14 known vulnerabilities: 1 low, 2 moderate, 9 high, and 2 critical at audit time.
- The recovered code should not be deployed or dependency-upgraded in place; it is reference material.

### Database and storage

- The schema has useful foundations: profiles, properties, tenants, vendors, projects, expenses, documents, messages, notifications, and protected approval RPCs.
- It lacks a first-class membership model that maps a person or household to a property with a scoped role.
- Tenant household members are flattened into one tenant record rather than membership plus lease parties.
- Payment ledger and rent obligations are not represented as authoritative database entities.
- Storage usage is inconsistent; some files use Supabase while other files/photos are browser-only.
- Obsolete teacher tables live in the same migration stream.

## Product-pattern research

Current property-management products converge on job-specific portals backed by one shared property record:

- AppFolio separates resident, owner, and vendor portals. Residents can pay, see payment history, download leases, and submit photo-backed maintenance requests; owners receive financial and property reporting.
- Buildium's Resident Center centralizes payments, recurring pay, maintenance, documents, and updates.
- DoorLoop's owner portal provides property-scoped financials, reports, maintenance, files, and requests without exposing unrelated owners or bank operations.
- Zillow Rental Manager continues to emphasize connected listing, tenant screening, lease, and payment workflows rather than a generic dashboard.

References:

- <https://www.appfolio.com/property-manager/communication-service>
- <https://www.buildium.com/features/resident-center/>
- <https://support.doorloop.com/en/articles/8392701-introduction-to-the-owner-portal>
- <https://support.doorloop.com/en/articles/8317597-how-to-use-the-owner-portal>
- <https://www.zillow.com/rentals-network/3-new-upgrades-you-can-use-this-summer/>

## Keep, combine, defer, retire

### Keep and rebuild

- role-specific home views;
- property overview and photo gallery;
- documents and lease access;
- messages and notifications;
- maintenance request, triage, estimate, approval, and completion;
- expense/rent ledger and owner financial summary;
- vendor contacts;
- secure tokenized external approvals;
- mortgage and keep-versus-sell calculators, clearly labeled as scenario tools.

### Combine

- issue + maintenance task + project into one work-order lifecycle;
- project messages + general messages into conversations linked to a record;
- gallery + project attachments + document uploads into one storage/attachment service;
- rent + payments + expenses into one ledger domain;
- tenant responsibilities into scheduled work or lease obligations.

### Defer

- AI assistant until all answers can cite authoritative records;
- live Zillow valuation integration until an approved data source exists;
- vendor estimate automation;
- advanced inspection templates;
- multi-property portfolio reporting beyond the schema foundation.

### Retire from the property product

- TeachAssist pages, tables, and portal switcher;
- demo role switcher and public demo data;
- browser-stored business records;
- 3D model library/viewer;
- fake notifications, payments, issues, balances, and messages;
- duplicate `/expenses`, `/properties`, `/payments`, and `/lease` route implementations;
- public self-service sign-up.

## Decision

Build one new application in the repository root. Preserve both existing implementations under version control as reference until the new acceptance suite passes. Do not migrate their UI component tree. Migrate only validated capabilities and recoverable source records through explicit import scripts.
