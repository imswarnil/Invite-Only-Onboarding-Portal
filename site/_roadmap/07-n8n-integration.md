---
order: 7
title: "n8n integration (the crawler)"
area: "Automation"
status: planned
summary: "The web-scraping 'hands' behind the AI score — spec'd in detail, not yet self-hosted or wired up."
---

Salesforce's AI stack reasons over data it's _given_; it doesn't fetch the web. That's n8n's one job in this design, and its only job — Salesforce never makes an outbound call to an arbitrary URL, and n8n never reasons about the content it fetches. The planned workflow: a reviewer (or a future automatic trigger) fires a "Run Research" action, n8n scrapes the applicant's stated website and public registry data, compresses it into a short structured summary, and hands it to the `Dossier_And_Score` prompt template.

A **Demo Mode** flag is planned _before_ any live crawling gets wired up, so the whole app can be demoed against seeded sample records with zero paid API calls or live scraping — deliberately sequenced first so credits/rate limits are never a risk while the rest of the app is being shown off.
