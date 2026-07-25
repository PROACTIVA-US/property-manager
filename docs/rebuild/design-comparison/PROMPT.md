# Quiet Ledger UI Comparison Prompt

You are participating in a blind UI implementation comparison. Create one production-quality React screen for a private, single-property management workspace called **House**.

## Product and user

The screen is the property manager's **Today** view. It should let the manager answer, within a few seconds:

1. What needs my attention?
2. Who is waiting on me?
3. What changed recently?
4. What is the property's current operational and financial state?

This is not a multi-property SaaS dashboard. It is a calm shared record for one real home, used by a property manager, owner, and tenant household.

## Approved direction: Quiet Ledger

- warm, editorial, trustworthy, and residential;
- parchment/off-white canvas, deep ink typography, muted evergreen for healthy state, restrained terracotta for attention;
- property photography and a chronological ledger provide identity;
- light mode only for this comparison;
- no purple gradients, glassmorphism, generic KPI-card wall, excessive borders, or decorative charts;
- use whitespace purposefully, but keep the important work in the first 900px of height;
- body copy is at least 14px and normal body text is 16px;
- all controls require visible labels or accessible names and strong focus states;
- minimum 44px touch targets on mobile;
- responsive at 390×844 and 1360×900.

## Required information architecture

Desktop navigation: Today, Work, People, Money, Property, Inbox. Include a compact Admin/Settings affordance and the manager identity.

Mobile navigation: a concise bottom navigation or task switcher that does not reserve desktop-sidebar width.

## Required content

Use exactly this synthetic content. Do not add fake unread totals, balances, properties, people, or alerts.

Property:

- Cedar House
- North Seattle · Single-family home
- Healthy
- Lease through Aug 2027
- Hero image: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85`

Attention queue:

1. Deck repair estimate — Waiting on owner approval — $1,850 — sent 2h ago
2. Kitchen faucet leak — Schedule with tenant — availability received 34m ago
3. July rent — Record bank transfer — $2,650 expected Jul 1

Recent activity:

1. Tenant added availability to Kitchen faucet leak — 34m ago
2. Alder & Pine uploaded Deck estimate.pdf — 2h ago
3. Spring roof inspection marked complete — Yesterday

Financial snapshot:

- July rent: $2,650 expected
- Open work estimates: $1,850
- 2026 maintenance: $3,240

Next scheduled event:

- HVAC service
- Thu, Jul 23 · 10:00–12:00
- North Sound Heating

Primary action: New work order

## Implementation constraints

- Return one React TypeScript component named `KimiConcept` and one companion CSS file.
- The component must have no props and no data fetching.
- You may import icons only from `lucide-react`.
- Prefix every CSS class with `km-` so the concept is isolated.
- Do not use Tailwind classes, inline style objects, emoji, external JavaScript, or new packages.
- Use semantic HTML and add accessible labels to icon-only controls.
- Keep the component and CSS together under 650 lines.
- Output only these exact wrappers, with no Markdown fences or explanation:

```text
<KIMI_TSX>
...component...
</KIMI_TSX>
<KIMI_CSS>
...styles...
</KIMI_CSS>
```
