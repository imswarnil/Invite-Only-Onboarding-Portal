---
order: 4
title: "AI layer: Prompt Builder"
area: "AI"
status: in-progress
summary: "One real, deployed prompt template writes a reviewer-ready brief today; the bigger scoring template that would auto-populate Fit Score still exists only on paper."
---

`Invite_Only_Brief` is a real, source-controlled `GenAiPromptTemplate` — grounds on one `Invite_Request__c` record and writes a short approve/waitlist/reject-oriented brief using only what the applicant typed on the form. Deployed clean on the first real attempt, confirmed by retrieving it back and diffing against what was deployed. It's live in Setup's **Try It** panel, deployed in `Draft` status on purpose (activating it runs Salesforce's own grounding/model validation, a one-time check that belongs in the UI). Nothing calls it automatically yet — wiring it to a "Generate Brief" button on the record page is the natural next step.

**Still conceptual:** `Dossier_And_Score`, the Flex template that would take the record plus a crawled-text summary and return strict JSON — dossier, 0–100 fit score, legitimacy verdict, findings — with the scoring weights (international-expansion signal weighted heaviest) already specified. This is the template `Score_Routes_Stage` (see Automation above) is actually waiting on.
