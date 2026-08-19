# Invite Only Portal

A hands-on learning project: an invite-only onboarding back office modeled on Stripe India's
real application flow. A person applies → an AI + web-crawler researches and scores them → a
reviewer decides → approved businesses are onboarded/provisioned/supported → the invited cohort's
health is tracked over time (cancel vs upsell).

Built to learn Salesforce's AI stack (Prompt Builder, Flow, Agentforce, Data Cloud) end to end,
plus a full React front end — and to document the journey as a public learning site and a
resume-ready case study.

**The mental model:** Salesforce AI reasons over data it is *given*; it does not fetch the web.
n8n fetches (scrapes) → hands clean text to Salesforce → Prompt Builder / Agentforce reason and
write results back. **Brain vs hands.**

## Structure

- `force-app/` — Salesforce metadata for this app only (`Stripe_` prefix), scoped via
  `manifest/package.xml` — see [`instruction.md`](./instruction.md) §16. This org hosts other
  POCs; never retrieve with wildcards.
- `web/` — full React 19 + Vite app: marketing homepage, `/invite` form, applicant portal, and
  the `/learn` learning site. Deployed to GitHub Pages.
- `learning/` — markdown lessons behind `/learn`, one per phase.
- `case-study/` — resume-ready writeup + a dated running log of problems solved.
- `docs/media/` — screenshots/gifs referenced by lessons and the case study.
- `integration/` — n8n workflow exports and Prompt Builder template text.
- `scripts/` — seed/deploy/retrieve helper scripts.

Full build plan, phase by phase: [`instruction.md`](./instruction.md).

## Setup

See `instruction.md` §2 and §4 (Phase 0) for the full tool list and bootstrap commands. Quick
reference:

```bash
sf org login web --alias iop-dev --set-default
sf org display --target-org iop-dev
cd web && pnpm install && pnpm dev
```

## Deploy

- Salesforce metadata deploys via `.github/workflows/salesforce.yml` on push to `force-app/**`.
- The React app builds and publishes to GitHub Pages via `.github/workflows/pages.yml`, served at
  **stripe.imswarnil.com**.

---

*Independent educational project. Not affiliated with, endorsed by, or connected to Stripe. Uses
public information about Stripe India's invite-only program to make the scenario realistic.
Hosted for learning; `/invite` is a styled demo, not Stripe's real form.*
