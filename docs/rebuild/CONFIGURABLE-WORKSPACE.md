# Configurable House workspace

## Product decision

House uses one workspace for viewing and editing. Administrators turn on **Edit
site** in the live interface instead of navigating to a second management
application.

Structured property records remain structured: property facts, people, lease,
financials, work orders, photos, documents, and access continue to use their
authoritative tables. The configurable layer controls how those records are
presented and allows administrators to add lightweight property-specific
content without a code change.

## Editing model

- Sidebar items can be reordered by dragging.
- Every page can be renamed, assigned an icon, hidden, and scoped to selected
  property roles.
- System pages can be hidden but not deleted.
- Administrators can add and remove custom pages.
- Core details on system pages can be shown or hidden.
- Custom fields can be added, reordered, edited, hidden, role-scoped, and
  removed.
- Custom field types are short text, long text, number, currency, date, link,
  and checkbox.
- “Remove” archives configurable content instead of destructively deleting
  authoritative property records.
- The audience preview dims navigation items hidden from the selected role and
  filters custom fields for that role.

## Security boundary

Only active property administrators can change workspace configuration.
Row-level security applies both page and field visibility to every other active
property role. A custom field is unreadable when its parent page is hidden,
even if the field itself was accidentally configured for a broader audience.

Passwords, login provisioning, roles, and access status remain under **Account
& settings → Access & security**. The service-role key used for account
administration remains server-side in the existing Supabase Edge Function.

## Data model

- `property_workspace_pages` stores system/custom page identity, label, icon,
  navigation order, audience, visibility, and hidden core-detail keys.
- `property_workspace_fields` stores flexible fields tied to one page and
  property, including type, value, order, audience, visibility, and archive
  state.
- New properties receive the six standard House pages automatically.

The configurable layer never replaces or duplicates the authoritative
property-domain tables.
