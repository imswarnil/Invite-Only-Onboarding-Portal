---
order: 3
title: "Reviewer & CSM UI (Lightning Web Components)"
area: "Front end"
status: implemented
summary: "27 native LWC widgets: a bento-grid dashboard with Chart.js charts, a 3-column reviewer workspace, and a separate set of widgets for CSMs/TSEs."
---

The homepage (`Invite_Only_Home_App_Page`) is a bento grid backed entirely by real, wired data — no placeholders: a CTA tile, stat tiles, two Chart.js charts (stage funnel, applicant-type split), and lists for pipeline aging, top-performing accounts, and "ready to provision."

The `Invite_Request__c` record page centers on `inviteRequestWorkspace`, a 3-column composer: `inviteRequestEditor` (every field, grouped into icon tabs, a sticky always-visible Save bar) on the left, `inviteTimeline` in the center, and `quickActionPanel` (Approve/Waitlist/Reject) on the right — plus a `stageProgressBar` stepper in the header and a sidebar (`scoreGauge`, `findingsList`, `legitimacyBadge`, `complianceChecklist`, `daysInStageTile`, `relatedProvisionedAccountCard`). `Provisioned_Account__c` and `Usage_Snapshot__c` get their own CSM/TSE-facing widgets (renewal countdown, usage trend sparkline, month-over-month delta, dispute-rate gauge).

Real bugs were found and fixed along the way, not just features added: the invite timeline showed nothing because Field History Tracking wasn't actually turned on for any field despite the object having it enabled; a findings-list widget was calling the wire adapter with SOQL subquery syntax instead of a plain relationship name; an early version of the record editor still referenced a field that had already been deleted elsewhere in the same cleanup.
