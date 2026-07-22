# Product Requirements Document: House

Status: proposed for approval
Product: private property workspace
Primary deployment: `house.wildvine.net`

## Product premise

House is the trusted shared record for one rental property and the people responsible for it. It gives the property manager, owner, and tenant household different views of the same facts without forcing them into a generic enterprise property-management interface.

The product promise is simple:

> Everyone can see what matters to them, every request has an owner and next step, and no authoritative record lives only in one browser.

The initial property and real stakeholder details are operator-provided production data. They must be loaded through secure database administration, not committed as source fixtures.

## Goals

1. Restore one reliable place for the property, household, lease, photos, documents, maintenance, communication, and financial history.
2. Make role boundaries obvious and enforce them in both UI and database policy.
3. Turn tenant reports and PM observations into a single trackable work lifecycle.
4. Give the owner a concise investment/status view without operational clutter.
5. Give tenants a fast mobile path to pay-history, lease, messages, and maintenance.
6. Give the property manager a mobile-capable operations console with no duplicate entry.
7. Preserve a clear audit trail for financial and approval decisions.

## Non-goals for version 1

- a marketplace or public listing product;
- a replacement for payment processing or accounting software;
- storing bank, utility, or vendor website passwords;
- autonomous AI decisions;
- Zillow scraping;
- 3D modeling;
- TeachAssist or any cross-product portal;
- multi-company SaaS billing or broad portfolio analytics.

## Users and jobs

### Property manager/admin

Needs to know what requires attention today, who is waiting, what is approved, what is scheduled, and whether documents and money are accounted for.

Top jobs:

- triage a new maintenance request;
- add evidence, estimate, vendor, schedule, and cost;
- request and record owner approval;
- update tenants and owner in one conversation;
- record rent, expenses, and documents;
- invite/revoke users and control access.

### Owner

Needs confidence that the property, lease, money, and work are under control without reading every operational detail.

Top jobs:

- see current property status and exceptions;
- review cash flow and recent ledger activity;
- approve or decline material work with evidence;
- access statements, lease, receipts, and property photos;
- message the property manager.

### Tenant household

Needs an easy mobile home for the lease and the few recurring interactions with the property manager.

Top jobs:

- see rent status and payment history;
- open the current lease;
- report a problem with photos and availability;
- follow status and appointment details;
- message the property manager;
- see assigned tenant obligations without owner financial data.

## Information architecture

### Property manager navigation

1. Today
2. Work
3. People
4. Money
5. Property
6. Inbox
7. Admin

### Owner navigation

1. Overview
2. Work & approvals
3. Financials
4. Property & documents
5. Inbox

### Tenant navigation

1. Home
2. Maintenance
3. Payments
4. Lease
5. Messages

Desktop uses a compact rail plus page header. Mobile uses a five-item bottom bar for tenant/owner and a concise drawer or task switcher for PM/admin. A user never selects a role manually; the current property membership determines the view.

## Core workflows

### 1. Invite and sign in

1. Admin creates or selects a person and sends a property-scoped invitation.
2. Recipient signs in by magic link or sets a password.
3. The system loads memberships and opens the appropriate home.
4. Password recovery is available without exposing whether unrelated accounts exist.
5. Public self-sign-up is disabled.

Acceptance criteria:

- an uninvited email cannot enter the workspace;
- a user with no active membership sees a clear access-contact state;
- role and property access come from database membership, not local state;
- the last active property may be remembered only as a harmless preference.

### 2. Tenant reports maintenance

1. Tenant selects category, urgency, description, entry permission, and availability.
2. Tenant attaches one or more photos/videos.
3. Submission creates one work order, one activity entry, and one conversation.
4. PM receives a real notification and triages it.
5. Tenant sees status changes and appointment information on the same record.

Acceptance criteria:

- draft survives a temporary connection failure;
- uploads show progress and can be retried;
- emergencies show the emergency contact instruction before submission;
- the tenant never sees owner-only cost, mortgage, or private vendor data.

### 3. PM triages and completes work

1. PM reviews report/evidence and sets responsibility, priority, and next step.
2. PM may assign a vendor, request an estimate, or perform the work directly.
3. If approval is required, PM sends an in-app or tokenized approval.
4. Approval transition is atomic and cannot be double-processed.
5. PM schedules work, adds costs/receipts, and uploads completion evidence.
6. PM closes the work order; relevant parties receive a final update.

Acceptance criteria:

- every open order has an assignee or an explicit unassigned warning;
- state changes are validated server-side and added to the activity log;
- work cannot be marked complete without a completion note;
- estimated and actual costs remain separate;
- approved external links expire and store only a token hash.

### 4. Owner reviews an approval

1. Owner opens the approval from the app or protected single-use link.
2. The screen shows the question, evidence, estimate, consequence, and expiry.
3. Owner approves or declines after a confirmation step.
4. Decision, actor/link, timestamp, and optional comment enter the audit log.

Acceptance criteria:

- a used, revoked, or expired link explains the state and recovery route;
- no unrelated property or private profile data is exposed by the link;
- repeat submissions return the recorded result without duplicating work;
- approval immediately advances or stops the related work order.

### 5. Review money

1. PM records rent charges, payments, adjustments, expenses, and receipts.
2. Owner sees current-month cash flow, year-to-date totals, exceptions, and drill-down.
3. Tenant sees only household charges, payments, balance, and receipt references.
4. Scenario calculators use explicit editable assumptions separate from actual ledger values.

Acceptance criteria:

- every ledger entry has date, type, amount, source, creator, and correction history;
- no destructive edit removes financial history; corrections use reversal/adjustment;
- calculated totals reconcile to ledger entries;
- exports match the filtered view and include generated-at metadata.

### 6. Access property records

1. Authorized user opens the property overview.
2. Role-safe summary, photos, lease, documents, contacts, and recent activity appear.
3. Private files are served through expiring signed URLs.

Acceptance criteria:

- every attachment has property, uploader, category, visibility, and checksum/metadata;
- tenants can access their executed lease and shared property documents;
- owner-only financial/tax files cannot be queried by a tenant, even by URL.

## Functional requirements by module

### Today / Overview

- role-specific summary, not a generic card collection;
- at most five prioritized items requiring action;
- current rent/lease/work exceptions;
- recent meaningful activity;
- zero fake counters or seeded alerts in production.

### Work

- filterable work-order list and status board;
- detail page with summary, activity, evidence, assignments, schedule, cost, and conversation;
- recurring preventive schedules;
- saved views for waiting on me, overdue, awaiting approval, and scheduled;
- server-validated transitions.

### People

- profiles, contact methods, emergency contacts, property memberships;
- tenant household and lease parties;
- vendor directory and assignment history;
- sensitive fields separated from commonly visible profile data.

### Money

- rent charge/payment ledger;
- expenses, categories, receipts, vendor/work links;
- owner summary and export;
- tenant-scoped ledger;
- mortgage and keep/sell scenario tools after core reconciliation passes.

### Property and documents

- canonical address and physical details;
- hero image and categorized gallery;
- lease and general documents;
- source/date for property-value observations;
- no account credentials.

### Inbox

- property conversations with explicit participants;
- optional link to work order, document, lease, or financial entry;
- unread state based on participant read cursor;
- attachment support and safe file access.

### Admin

- invitations, memberships, deactivation, and audit trail;
- data import preview and validation;
- integration/deployment health;
- no direct editing of another user's authentication password.

## Data integrity requirements

- Postgres is authoritative for all business data.
- `localStorage` is limited to theme, dismissed coaching, and last harmless UI preference.
- Production has no automatic sample-data initialization.
- Every table with user data has RLS and policy tests.
- Every cross-role record includes `property_id` directly or through a required parent.
- Financial and approval histories are append-only or correction-based.
- Files use private buckets and signed URLs unless deliberately public.
- All timestamps are stored in UTC and displayed in the property timezone.

## Quality requirements

- WCAG 2.2 AA contrast and keyboard operation for all primary workflows;
- 44px minimum touch targets on mobile;
- tenant maintenance submission usable at 360px width;
- meaningful first content within 2 seconds on a typical broadband connection;
- optimistic UI only where failure can be visibly reconciled;
- route-level loading, empty, error, and permission states;
- no uncaught console errors in acceptance flows;
- automated role-policy integration tests plus end-to-end tests for the six core workflows.

## Success measures

- 100% of production business records come from Postgres/Storage;
- 0 route/nav mismatches in automated coverage;
- 0 cross-role RLS leaks in policy tests;
- tenant can submit a complete request in under 90 seconds on mobile;
- PM can identify all waiting/overdue work in under 15 seconds;
- owner can find the current lease or an approval in under 20 seconds;
- all money totals reconcile in automated tests;
- no critical/high production dependency vulnerabilities at release.

## Open product decisions

1. Confirm whether Google OAuth is desired in addition to magic link/password.
2. Confirm whether version 1 records payments manually or imports from an existing processor.
3. Confirm who besides the owner may see mortgage/tax scenario inputs.
4. Confirm whether the historical app should remain in-repo under `legacy/` after the archive PR is merged or exist only in Git history.
