# Capability Coverage Matrix

Legend:

- **DB**: Supabase/Postgres is the authoritative path.
- **Mixed**: Supabase and browser/demo paths coexist.
- **Local**: browser storage or hard-coded data only.
- **Shell**: visible UI without a complete trustworthy workflow.

## Current capability inventory

| Domain | Existing capability | Current state | Main problem | Rebuild disposition |
| --- | --- | --- | --- | --- |
| Identity | Email/password sign-in | DB | Modal over protected shell; weak recovery | Rebuild as dedicated sign-in/recovery flow |
| Identity | Google OAuth | Recovered only | Disappeared between snapshots | Optional after invite flow is stable |
| Identity | Public sign-up | DB | Wrong model for a private household workspace | Remove; invite-only |
| Identity | Demo role switcher | Recovered only/local | Makes mock data look real | Remove from production; dev fixtures only |
| Identity | Admin role editor | DB | Role is global, not property-scoped | Replace with property memberships |
| Property | Property details | Mixed | DB table plus local settings/defaults | One property record in DB |
| Property | Photo gallery | Local | Base64 browser storage | Supabase Storage plus attachment rows |
| Property | 3D model viewer/library | Local/shell | Placeholder, error-prone, no core job | Retire |
| People | Owner profile | Mixed | Auth profile plus local owner/business form | Profile plus scoped membership |
| People | Property manager profile | Mixed | Local settings duplicate profile | Profile plus scoped membership |
| People | Tenant record | Mixed | One flattened tenant plus mock household data | Household, lease parties, memberships |
| People | Vendor directory | Mixed | DB vendors plus local estimates/job history | DB vendors linked to work orders |
| Lease | Lease terms | Local/mixed | Local defaults and placeholder document link | DB lease plus private signed document |
| Lease | Tenant responsibilities | Local | Separate approval model and schedule | Lease obligations/scheduled work |
| Rent | Amount due/current balance | Local/mock | Fake balance and dates | Rent charge/payment ledger |
| Rent | Payment history | Local/mock | No authoritative transaction record | Ledger entries with provenance |
| Rent | CSV import | Local | Browser-only and weak validation | Admin import with preview/audit log |
| Finance | Property cash flow | Local calculations | Inputs come from local settings | DB-backed owner scenario view |
| Finance | Mortgage calculator | Local calculations | Useful but mixed with authoritative values | Keep as labeled scenario tool |
| Finance | Keep-versus-sell | Local calculations | Can appear definitive | Keep with inputs, assumptions, disclaimer |
| Finance | Expenses | Local despite DB table | Duplicated in two pages under one key | One expense ledger in DB |
| Finance | Utilities/accounts | Local | Sensitive account details in browser | Provider metadata only; no stored passwords |
| Work | Issues | Local | Rich workflow disconnected from DB projects | Merge into work orders |
| Work | Maintenance checklist | Local | Hundreds of controls; separate lifecycle | Scheduled preventive work |
| Work | Tenant maintenance request | Local/mock | Not connected to PM work system | Entry point into work orders |
| Work | Projects/phases | Mixed | DB path plus unreachable demo branch | Work-order parent with optional milestones |
| Work | Approval requests | DB/RPC | Strongest recent feature; isolated from rest | Keep pattern and integrate with work orders |
| Work | Inspections | Local | Embedded inside message helper | DB inspection attached to work order/property |
| Work | Bills of materials | Local | Separate island | Defer; attachment/estimate in phase 2 |
| Communication | General threads/messages | Mixed | DB and local versions diverge | One conversation model |
| Communication | Project messages | DB | Duplicates general messages | Link conversation to work order |
| Communication | Read receipts | Mixed | Fake badges and polling | DB participant read cursor/realtime |
| Communication | Notifications | Mixed/local | Sample notices can appear real | Event-derived DB notifications |
| Documents | Upload/list/delete | Mixed | DB/storage plus browser fallback | DB metadata and Storage only |
| Documents | Search/tag/project link | Mixed | Sync and async implementations coexist | One typed attachment service |
| Documents | Lease download | Shell | Placeholder anchor | Signed URL with authorization |
| External approval | Create tokenized request | DB/RPC | Separate from canonical work lifecycle | Integrate; retain token hashing and expiry |
| External approval | Approve/decline once | DB/RPC | Error recovery is weak | Keep atomic single-use decision |
| External approval | Composite evidence image | DB/Storage | Useful but narrowly implemented | General evidence attachment set |
| Automation | AI project generator | Mock/client path | Browser SDK/secret risk and hallucinated data | Defer; server-only and cited if restored |
| Automation | AI assistant | Shell/mock | Not grounded in authoritative records | Defer |
| External data | Zillow estimate | Local placeholder | No reliable integration | Manual value + source URL + date |
| Export | PDF/Excel | Shell/TODO | Buttons imply unavailable output | Build only after core ledger |
| Settings | Appearance/theme | Local | Appropriate local preference | Keep locally |
| Settings | Owner/property/tax/mortgage | Local | Sensitive business data in client storage | Split into authorized DB modules |
| Cross-product | House/Teach hub | Recovered only | Separate product coupled to property app | Retire from this repo |

## Target role access

The new application uses a shared data model but different role-specific surfaces.

| Capability | Property manager/admin | Owner | Tenant household |
| --- | --- | --- | --- |
| Property summary and approved photos | Manage | View | View resident-safe subset |
| Household/lease parties | Manage | View essentials | View own household |
| Full lease document | Manage | View | View |
| Rent charges/payments | Record/correct | View summary | View own ledger |
| Expenses and receipts | Manage | View | No access |
| Mortgage/tax/private ownership inputs | No access unless explicitly delegated | Manage | No access |
| Maintenance request | Create/manage | Create/view/approve | Create/view own |
| Work-order estimates and assignments | Manage | View/approve when requested | Status only when relevant |
| Vendors | Manage | View assigned vendor | View appointment contact when relevant |
| Messages | All property conversations in scope | Own conversations | Own conversations |
| Documents | Manage and share | Authorized property docs | Lease and tenant-shared docs |
| External approval link | Create/revoke | Decide | Decide only when explicitly addressed |
| Membership/users | Manage | No | No |

## Canonical work lifecycle

All repairs, issues, scheduled tasks, and projects become one `work_order` model:

`reported → triaged → estimating → awaiting_approval → approved → scheduled → in_progress → completed → closed`

Alternate terminal states are `declined`, `cancelled`, and `not_responsible`. A small task can skip estimating and approval. A larger job can add milestones without changing entity type.

Every state transition is written to an append-only activity log. Attachments, expenses, conversations, assignments, and approvals reference the same work-order ID.
