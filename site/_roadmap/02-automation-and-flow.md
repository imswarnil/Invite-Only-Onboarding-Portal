---
order: 2
title: "Automation (Flow)"
area: "Foundation"
status: implemented
summary: "Stage routing and auto-provisioning are live, record-triggered Flows; the AI-triggered research step is the one piece still missing upstream of them."
---

Three record-triggered Flows do the routing and provisioning work:

- **`Score_Routes_Stage`** — `Fit_Score__c >= 75` routes to `In Review`, `< 45` routes to `Waitlisted`.
- **`Fixable_Finding_Routes_Stage`** — a fixable, open Crawler Finding moves its parent request to `Action Needed` automatically.
- **`Provision_On_Approval`** — `Decision__c = Approved` creates a `Provisioned_Account__c` linked back to the source request and moves `Stage__c` to `Onboarding`. Re-tested live by toggling real approved records through the flow, not just seeded data.

What's not built yet is the thing that would normally _write_ `Fit_Score__c` automatically — see **AI layer: Prompt Builder** and **n8n integration** below. Until that exists, a human (or a seed script) sets the score by hand to exercise this routing, which is a completely honest and already-testable substitute.
