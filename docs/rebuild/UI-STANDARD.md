# House UI Standard

Status: foundation approved by audit; aesthetic direction pending operator selection

## Design objective

House should feel like a calm, trustworthy home record—not a generic SaaS dashboard and not an enterprise property-management suite. It must make evidence, next action, ownership, and record provenance more prominent than decoration.

## Candidate directions

### A. Quiet Ledger — recommended

A warm, editorial workspace: parchment/off-white surfaces, deep ink typography, muted evergreen for healthy state, and restrained terracotta for attention. Property photography and a clear chronological activity ledger give it identity.

Signature element: a “house record” header that combines the property image, current status, next important date, and latest verified update.

Best for: trust, owner clarity, documents, financial review, and a product centered on one real home.

Tradeoff: PM high-density views need disciplined compact variants so they do not become overly spacious.

### B. Field Console

A practical operations product: charcoal/navy shell, warm gray work surfaces, safety amber for waiting items, and crisp blue for actions. Dense tables and split views prioritize PM throughput; owner and tenant surfaces remain simplified.

Signature element: a persistent “waiting on” lane that groups work by the person or event blocking progress.

Best for: heavy PM use and rapid operational scanning.

Tradeoff: risks repeating the current dark-tool feeling and underserving the emotional/household context.

### C. Home Journal

A photographic, human-centered record: warm neutral background, large house imagery, date-based stories, soft green/blue accents, and conversational copy. Work and money appear as events in the home's history.

Signature element: a unified home timeline with documents, messages, repairs, inspections, and milestones.

Best for: tenant/owner friendliness and long-term property memory.

Tradeoff: complex PM work and reconciliation need secondary operational views.

## Non-negotiable foundations

These rules apply to any selected direction.

### Hierarchy

- One page title and one visually dominant primary action at most.
- The first viewport answers: where am I, what changed, what needs me, what happens next.
- Cards represent meaningful records or decisions, not arbitrary layout boxes.
- Labels describe user meaning, not internal entity names.
- Authoritative values show source/as-of context where ambiguity is possible.

### Navigation

- Role-specific navigation follows the PRD and is generated from one route manifest.
- Routes, visible navigation, breadcrumbs, permissions, and tests use that same manifest.
- Desktop rail labels are at least 14px with clear active state.
- Mobile tenant/owner navigation is a five-item bottom bar with safe-area support.
- Mobile PM navigation never leaves a desktop sidebar consuming the content width.
- No role switcher appears in production.

### Typography

- Body text: 16px default, 14px minimum for secondary labels.
- Line height: at least 1.45 for body copy.
- Numeric values use tabular figures.
- Avoid all-caps except short status/eyebrow labels with letter spacing.
- Use no more than two font families and four purposeful weights.

### Color and status

- Color never carries meaning alone; pair it with text and/or icon.
- Meet WCAG 2.2 AA contrast in default, hover, focus, disabled, and selected states.
- Reserve red for destructive/error conditions, amber for waiting/risk, green for completed/healthy, and blue/brand for action.
- Do not use purple gradients as a default product identity.
- Light mode is primary. A dark preference may follow after all core screens pass contrast review.

### Spacing and density

- Use a 4px base scale with primary intervals of 8, 12, 16, 24, 32, and 48.
- Default content width is 1200–1320px; reading/form width is 640–760px.
- Forms use sections and progressive disclosure instead of one long card.
- Operational tables offer comfortable and compact density, preserving 44px touch rows on mobile.
- Empty space supports hierarchy but never hides the next action below a blank viewport.

### Components

- Buttons: primary, secondary, quiet, and destructive only.
- Icon-only controls require an accessible name and visible tooltip.
- Status badges use a controlled vocabulary from the domain model.
- Destructive actions require confirmation that names the record and consequence.
- Forms show inline errors plus a focused summary for multi-field failure.
- Uploads show file name, type, size, progress, failure, retry, and removal.
- Tables transform into purpose-built mobile cards or lists; they do not simply shrink.
- Every data view implements loading, empty, error, permission, and stale/offline states.

### Motion

- Motion explains navigation, ordering, or state change; it is not ambient decoration.
- Standard transition duration is 120–200ms.
- Respect `prefers-reduced-motion`.
- Avoid one-second card reordering and scale-on-hover effects on critical decisions.

### Accessibility

- Full keyboard access and visible focus ring on all actions.
- Logical landmarks, heading order, and page titles.
- Minimum 44×44px touch target for primary mobile interactions.
- Errors announced with appropriate live regions without repeated noise.
- Dialog focus is trapped and restored.
- Images require meaningful alt text or empty alt when decorative.
- Charts include tabular/text equivalents.

### Content

- Use plain verbs: Report a problem, Request approval, Record payment, Add receipt.
- State who is waiting on whom.
- Distinguish “recorded,” “estimated,” “calculated,” and “synced.”
- Never manufacture activity, urgency, balances, or unread counts.
- Error messages give a safe recovery action and request reference where available.

## Token contract

The chosen direction must implement semantic tokens, not one-off Tailwind colors:

```css
--surface-canvas
--surface-panel
--surface-raised
--text-primary
--text-secondary
--text-inverse
--border-subtle
--border-strong
--action-primary
--action-primary-hover
--status-info
--status-success
--status-warning
--status-danger
--focus-ring
--shadow-panel
--radius-control
--radius-panel
```

Components may use only semantic tokens for product colors. Raw palette values belong in the theme definition.

## Enforcement

The implementation must include:

- ESLint rules/custom check preventing raw hex/RGB colors outside theme files;
- a single typed route/capability manifest;
- Storybook or an equivalent component harness for all component states;
- automated accessibility checks on shared components and core pages;
- Playwright screenshots at 360, 768, 1280, and 1440 widths;
- a route crawl that fails on console errors, horizontal overflow, unlabeled icon buttons, or missing state fixtures;
- PR checklist requiring desktop/mobile screenshots and role/data provenance notes.

No visual implementation begins until A, B, or C is selected.
