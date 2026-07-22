# Quiet Ledger Comparison Run

Date: 2026-07-21

## Fairness controls

- Both concepts use the frozen prompt in `PROMPT.md`.
- Both target the same property-manager Today view.
- Both use the same synthetic property, work, activity, financial, and schedule facts.
- Both use the same image URL and existing `lucide-react` dependency.
- The comparison labels them Concept A and Concept B and hides authors by default.
- Each concept renders in its own iframe so desktop and mobile media queries receive identical viewport widths.
- No real property address, household identity, lease file, account data, or API credential was sent to Moonshot.

## Kimi run

- Provider: Moonshot AI Open Platform
- Model ID returned by live catalog and completion: `kimi-k3`
- Endpoint protocol: OpenAI-compatible Chat Completions
- Temperature: `0.6`, the only value accepted by K3 with thinking disabled
- Thinking: disabled for the UI implementation completion
- Prompt SHA-256: `1cb171bd6792f8cfffafd6fd396c777b5e665e580bfcc694c34afda5884bdaa1`
- Credential source: local `MOONSHOT_API_KEY`; never printed, copied, or committed
- Output preservation: TSX and CSS copied from the final response
- Integration-only change: removed the generated unused `React` import because this repository uses the automatic JSX runtime and rejects unused imports

Two exploratory calls using K3's default thinking behavior were discarded because they exhausted or approached their completion/time allowance before emitting final UI code. They did not influence either implementation.

## Authorship mapping

The mapping is intentionally absent from the visible default state but is available through the Reveal authors control:

- Concept A: ChatGPT / Codex
- Concept B: Kimi K3

## Evaluation rubric

Rate each concept from 1–5 without revealing authors:

1. First-glance clarity: can the manager identify what needs action?
2. Information hierarchy: does property context support rather than bury the queue?
3. Quiet Ledger fit: warm, residential, trustworthy, and editorial rather than generic SaaS.
4. Data density: enough operational detail without noise.
5. Mobile usefulness: no desktop sidebar, readable copy, and reachable actions.
6. Accessibility: legible contrast, semantic structure, labels, focus, and touch targets.
7. Distinctiveness: memorable enough to become the product's visual foundation.
