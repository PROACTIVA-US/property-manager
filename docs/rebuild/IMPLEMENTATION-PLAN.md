# Rebuild Implementation Plan

Status: active; Direction A (Quiet Ledger) approved 2026-07-24

## Delivery principle

Build vertical slices against the new schema. Do not reproduce every old page and then connect data later. A slice is complete only when the UI, database policy, server command, audit event, responsive states, and tests all agree.

## Phase 0 — Preserve and baseline

- merge/archive the recovered historical source independently;
- export production database schema/data and Storage inventory;
- build a one-time browser-data inventory/export tool for operator review;
- create a record-classification worksheet: authoritative, confirmed, mock, duplicate, obsolete;
- freeze feature work in both legacy apps;
- record production domains, Vercel projects, Supabase project, and environment ownership.

Exit gate: recoverable data and deployment topology are documented; no unique source depends on one working directory.

## Phase 1 — New foundation

- scaffold Next.js App Router in the active root;
- implement selected visual theme and semantic tokens;
- add Supabase server/client session helpers;
- create new membership/household schema and policy tests;
- add route/capability manifest;
- build invite-only sign-in, recovery, no-membership, and forbidden states;
- add CI for typecheck, lint, unit, RLS, accessibility, and Playwright smoke tests.

Exit gate: invited test users for manager, owner, and tenant reach distinct empty homes; all negative role tests pass.

## Phase 2 — Property, people, and files

- property overview and role-safe house record header;
- profiles, memberships, household, and lease parties;
- private Storage and attachment service;
- categorized photo gallery;
- lease/document upload, visibility, and signed download;
- operator-reviewed import of confirmed property, household, lease, photos, and documents.

Exit gate: each role sees only its allowed property/people/files; recovered records reconcile to the signed-off import report.

## Phase 3 — Maintenance/work vertical slice

- work-order schema, events, transitions, assignments, milestones, and schedules;
- tenant mobile request with evidence upload;
- PM Today queue, triage, assignment, and scheduling;
- owner/tenant status views;
- linked conversation and notifications;
- recurring preventive task conversion where still relevant.

Exit gate: tenant report reaches PM, PM acts, relevant users track it, and completion history is immutable.

## Phase 4 — Approval vertical slice

- in-app approval requests;
- secure external approval links with hash, expiry, revocation, and idempotency;
- evidence/estimate presentation;
- approval-driven work transition;
- invalid/used/expired recovery states;
- audit and end-to-end replay tests.

Exit gate: simultaneous/repeated decisions cannot duplicate state or work; public link exposes no unrelated data.

## Phase 5 — Money vertical slice

- rent charges, payments, allocations, adjustments, and tenant ledger;
- expenses, vendors, receipts, and work links;
- owner current-month/year-to-date financial view;
- reconciled exports;
- import preview and audit log;
- scenario calculator separated from actuals.

Exit gate: all displayed totals are generated from reconciled entries and pass invariant tests.

## Phase 6 — Communication and operational polish

- inbox across property/work/lease contexts;
- participant read cursors and real notifications;
- PM saved queues and compact density;
- owner exceptions and decision summary;
- tenant offline/retry polish;
- empty, error, permission, stale, and recovery states everywhere.

Exit gate: no fake counters or browser-only product records; full route crawl passes at desktop and mobile widths.

## Phase 7 — Cutover

- production import dry run and reconciliation;
- stakeholder acceptance for manager, owner, and tenant workflows;
- attach `house.wildvine.net` to the new Vercel deployment;
- run production smoke suite;
- keep legacy deployment read-only during rollback window;
- remove obsolete TeachAssist, 3D, demo, browser-data, and duplicate route code from active build;
- document rollback and support procedures.

Exit gate: acceptance criteria in the PRD pass in production and the operator signs off on data reconciliation.

## Suggested pull-request sequence

1. `docs: audit and rebuild contract`
2. `chore: scaffold clean app and quality gates`
3. `feat: memberships and invite-only auth`
4. `feat: property people and secure files`
5. `feat: unified work orders`
6. `feat: atomic owner approvals`
7. `feat: reconciled rent and expense ledger`
8. `feat: inbox notifications and role polish`
9. `chore: migrate data and cut over production`

Each PR must stay independently deployable to a preview environment and must not point preview code at production data.

## Verification matrix

| Layer | Required verification |
| --- | --- |
| Domain | Unit tests for transitions, calculations, and invariants |
| Database | Migration replay, constraint tests, positive/negative RLS tests |
| Server | Auth/membership tests, validation, idempotency, redacted errors |
| Components | Interaction, keyboard, loading/empty/error/disabled states |
| Workflows | Playwright for each PRD core workflow and each role |
| Visual | Screenshots at 360/768/1280/1440; no overflow or console errors |
| Accessibility | Automated scan plus keyboard/screen-reader spot checks |
| Security | dependency audit, secret scan, authorization abuse cases |
| Data | import counts, hashes, totals, and operator reconciliation |
| Deployment | preview smoke, production smoke, domain and redirect checks |

## Explicit stop conditions

Pause cutover if any of the following is true:

- the source of real lease, document, financial, or household data is unresolved;
- a role can access another role's private records;
- approval decisions are not atomic/idempotent;
- financial totals do not reconcile;
- production and preview share writable data;
- the selected visual direction has not been approved;
- mobile tenant maintenance or lease access fails acceptance.
