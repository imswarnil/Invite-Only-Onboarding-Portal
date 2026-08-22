---
section: "Data Cloud"
order: 8
title: "Where Data Cloud actually fits (and why it's not step one)"
summary: "Where Data Cloud actually fits, and the honest reason it isn't step one at this project's current size."
---

# Where Data Cloud actually fits (and why it's not step one)

Data Cloud is the last piece on the current roadmap, and deliberately so. By the time an applicant
is mid-pipeline, "the applicant" is really spread across an `Invite_Request__c` record, its
`Crawler_Finding__c` children, and — post-approval — `Usage_Snapshot__c` records. Plain SOQL joins
these fine for a page layout or a report. The open question was whether the AI layer needed
something more than that.

## The honest answer, for this project's current size: not yet

Data Cloud earns its keep unifying data across _many_ source systems, high-volume events, or
reconciling the same real-world entity showing up differently across systems. At this project's
scale — one Salesforce org, a handful of related objects — a well-modeled object graph (the thing
built back in the data-modeling phase) already gives Prompt Builder and Agentforce everything they
need to ground a response. Standing up Data Cloud now would have been solving a problem this
project doesn't have yet, just because the tool exists.

## What would change if this grew past one org

If a second data source showed up — say, a marketing tool's own record of the same lead, or a
support system's case history — that's the point Data Cloud stops being optional. Its job is
specifically turning "the same entity, described slightly differently by two systems" into one
unified profile via Data Streams and a shared Data Model, so a Prompt Template or Agentforce
Action can ground on "the applicant" instead of on "the applicant according to system A" and
separately "according to system B."

## Why write a lesson about the tool I _didn't_ use yet

Because "we don't need this yet, and here's specifically why" is a real design decision, not a gap
in the build. It's easy to read about Data Cloud, decide it sounds powerful, and bolt it onto a
project where it adds configuration overhead without adding any grounding a plain object graph
wasn't already providing. The moment a second real data source enters this pipeline, this is the
lesson that gets rewritten with what actually happened standing it up.

**Concepts you now own:** what Data Cloud unifies and why (Data Streams into one shared Data
Model), and — just as usefully — a concrete example of recognizing when a platform capability
solves a problem you don't have yet.
