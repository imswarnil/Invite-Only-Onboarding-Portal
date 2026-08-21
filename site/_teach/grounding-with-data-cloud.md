---
section: data-cloud
order: 10
title: "Why Data Cloud, and what it unifies"
summary: "One applicant, three record types — Data Cloud is what makes that 'one thing' to an AI."
---

# Why Data Cloud, and what it unifies

By the time an applicant is mid-pipeline in this project, "the applicant" is really spread across
several places: an `Invite_Request__c` record, one or more `Crawler_Finding__c` children, and
eventually `Usage_Snapshot__c` records after approval. Plain SOQL can join these easily enough for
a page layout or a report. **Data Cloud** solves a different, harder problem: giving the AI layer
one unified view of "this applicant" without every prompt and agent having to know the object
model's internal joins.

## The core idea: unify before you reason

Data Cloud ingests data from multiple sources (Salesforce objects, and in a larger deployment,
external systems too) through **Data Streams**, maps it into a shared **Data Model** (so
"applicant" means the same thing regardless of source), and can compute **Calculated Insights**
(rollups and metrics) across that unified view. Prompt Builder and Agentforce can then ground a
response in that single unified profile instead of the AI having to independently traverse
relationships every time.

## Why not just query the objects directly

For a project this size, direct SOQL through the standard object model works fine, and that's
what the earlier sections actually built. Data Cloud earns its keep at a different scale: many
source systems, high-volume events, or a need to reconcile the "same" entity that shows up
slightly differently across systems (a Contact record and a Marketing app's lead, for instance).
Learning it here is about understanding the _concept_ — a grounding layer between raw data and AI
— even in a project small enough not to strictly require it yet.

## How it connects back to everything earlier

Data Cloud doesn't replace the object model, the permissions, or the AI tools from earlier
sections — it sits between the object model and the AI layer as an optional unification step. The
dependency order holds: model the data well (Data Modeling), secure it correctly (Security &
Permissions), and only then does unifying it in Data Cloud produce anything trustworthy for
Prompt Builder or Agentforce to reason over.

**Key takeaway:** Data Cloud's job is turning "several related records" into "one grounded
profile" for the AI layer — valuable once your data lives in more than one place or one system,
and worth understanding conceptually even before a project is big enough to need it.
