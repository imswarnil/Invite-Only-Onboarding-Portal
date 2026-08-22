---
order: 1
title: "Data model & security"
area: "Foundation"
status: implemented
summary: "Four purpose-built custom objects, role-based permission sets, and a public Guest User — no standard Account/Contact anywhere in the pipeline."
---

`Invite_Request__c` (Company/Individual record types, ~63 custom fields across the object graph), `Crawler_Finding__c`, `Provisioned_Account__c`, and `Usage_Snapshot__c` carry the whole pipeline end to end. Early builds provisioned a standard `Account` on approval; that was later removed entirely so this app's data never mixes with the org's other unrelated demos.

Four role-scoped **permission sets** (`Admin_PS`, `Reviewer_PS`, `CSM_PS`, `TSE_PS`) replace profile edits, so a Reviewer can decide Stage/Decision but never overwrite an AI-written field, and a CSM can run a provisioned account without re-deciding the application it came from. A narrow **Guest User** profile can create `Invite_Request__c` records and nothing else.

**One manual step left:** `Account.Invite_Only_Customer` record type can't be deactivated via metadata API (Salesforce blocks removing "the last active record type for a profile") — needs a one-time click in Setup to reassign the default first.
