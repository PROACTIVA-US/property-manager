# Design Decision: Quiet Ledger

Status: accepted
Decision date: 2026-07-24

## Decision

Use Concept A, **Quiet Ledger**, as the visual foundation for the House rebuild.

The selected direction uses warm parchment surfaces, a deep evergreen navigation
rail, editorial headings, restrained status colors, property photography, compact
action queues, and a chronological house ledger.

## Evidence

- Concept A and Concept B were produced from the same frozen prompt and synthetic
  data.
- Both were evaluated at matching desktop and mobile viewport sizes.
- Authorship was hidden during evaluation and revealed only after the comparison
  was available.
- The operator selected Concept A.

The comparison prompt and run controls remain preserved in
`design-comparison/PROMPT.md` and `design-comparison/RUN-METADATA.md`.

## Implementation consequence

- All new shared components and role-specific homes follow the Quiet Ledger token,
  hierarchy, typography, navigation, and accessibility contracts in
  `UI-STANDARD.md`.
- The old applications remain recovery references only. Their visual systems must
  not be copied into the rebuild.
- The public `/property/rebuild` route is the canonical visual foundation preview
  while invite-only authentication and authoritative property data are built.
- Synthetic comparison content must not be promoted into production data.
- Concept B remains in the design-lab archive only as experiment provenance.
