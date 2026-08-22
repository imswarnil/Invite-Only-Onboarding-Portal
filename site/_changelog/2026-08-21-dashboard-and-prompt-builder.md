---
date: 2026-08-21
title: "27-widget dashboard, first Prompt Builder template, and nav cleanup"
summary: "27 LWC widgets, the first deployed Prompt Builder template, and the Roadmap section shipped."
---

- Grew the LWC dashboard to 27 widgets: renewal countdown, month-over-month usage delta, compliance checklist, legitimacy badge, top-performing accounts, pipeline aging, and more — all backed by real queries, no placeholders.
- `Invite_Only_Brief` — the first real, deployed `GenAiPromptTemplate` — grounds on one Invite Request and writes a reviewer-ready brief; confirmed via retrieve-and-diff after deploy.
- `InviteRequestApi.cls` — a Guest-accessible Apex REST endpoint — briefly powered a live apply form on this site; that form has since been removed so the public site stays a documentation/portfolio site rather than a live intake channel (see the Public Site roadmap item).
- Restored the top navbar as the site's one persistent chrome (a mid-refactor attempt to move to a sidebar-only nav had left one page with no navigation at all), and added this Roadmap section.
