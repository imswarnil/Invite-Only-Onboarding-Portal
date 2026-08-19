---
section: "Overview"
order: 0
title: "What we're building"
---

# What we're building

A back office for an invite-only onboarding program: a person applies (mimicking Stripe India's
real form) → an AI + web-crawler researches and scores them → a reviewer decides → approved
businesses are onboarded/provisioned/supported → we track how the invited cohort performs
(cancel vs upsell).

Along the way this project covers Salesforce's AI stack (Prompt Builder, Flow, Agentforce, Data
Cloud) and a full React front end, built phase by phase and documented as it goes.

**The mental model:** Salesforce AI reasons over data it is *given*; it does not fetch the web.
n8n fetches (scrapes) → hands clean text to Salesforce → Prompt Builder / Agentforce reason and
write results back. Brain vs hands.

See `instruction.md` in the repo root for the full phase-by-phase plan.
