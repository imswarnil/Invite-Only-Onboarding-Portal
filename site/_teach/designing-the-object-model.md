---
section: data-modeling
order: 3
title: "Designing the object model"
summary: "Custom objects, record types, and when a relationship should be Master-Detail vs Lookup."
---

# Designing the object model

Every downstream section — permissions, layouts, AI, automation — depends on the shape you choose
here. This project's core object is `Invite_Request__c`, and the decisions behind it generalize
to most "application → review → provision" style builds.

## One object, two record types

`Invite_Request__c` handles both **Company** and **Individual** applicants using a single object
with two **record types**, rather than two separate objects. Each record type gets its own page
layout (Company sees a registration-number field, Individual sees a PAN field), while all the
shared fields, permissions, and automation live in one place. Reach for two objects only when the
entities genuinely don't share most of their fields or behavior — here, they shared enough that
one object with layouts doing the differentiation was the simpler design.

## Master-Detail vs. Lookup: pick based on the deletion story, not convenience

- **Master-Detail** (`Crawler_Finding__c` → `Invite_Request__c`): a finding cannot exist without
  its parent request, and it should vanish if the parent does. Master-Detail cascades deletes and
  is a prerequisite for roll-up summary fields (e.g., a future "open findings count" on the
  request).
- **Lookup** (`Provisioned_Account__c`, `Usage_Snapshot__c` → `Invite_Request__c`): these represent
  what happens _after_ approval and can reasonably outlive or be reassigned independent of the
  original request. Lookup is the right default whenever the child record has its own lifecycle.

The question to ask for every relationship: **if the parent is deleted, should the child die with
it?** Yes → Master-Detail. No, or "it's complicated" → Lookup.

## Dependent picklists: one field can constrain another

`Stage__c` drives the pipeline; `Sub_Status__c` is a **dependent picklist** on it — its valid
values change based on which `Stage__c` is selected. This is a `controllingField` +
`valueSettings` relationship defined in the dependent field's own metadata, not a separate
validation rule or piece of automation. Use it whenever a picklist's valid options are really a
subset that depends on another field, instead of writing a validation rule to enforce the same
thing after the fact.

**Key takeaway:** record types for "same data, different shape by segment," Master-Detail vs.
Lookup decided by the deletion story, and dependent picklists for one field constraining another
declaratively.
