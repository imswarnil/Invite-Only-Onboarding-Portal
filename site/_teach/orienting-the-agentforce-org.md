---
section: getting-started
order: 2
title: "Orient yourself: what Agentforce actually turns on"
summary: "Map a product idea onto Salesforce's real building blocks before configuring anything."
---

# Orient yourself: what Agentforce actually turns on

Before building anything, it helps to translate a product idea into the four or five Salesforce
concepts it actually maps to. This project's idea was: _"a person applies, an AI scores them, a
human decides, approved accounts get provisioned."_ Here's how that turned into a building list.

## The translation table

| Product idea                               | Salesforce concept                                                 |
| ------------------------------------------ | ------------------------------------------------------------------ |
| "An application"                           | A custom object (`Invite_Request__c`)                              |
| "AI researches and scores them"            | An external crawler (n8n) + a Prompt Builder template              |
| "A reviewer decides"                       | Standard Salesforce record UI: page layout, related lists, actions |
| "Approved businesses get provisioned"      | A Flow, triggered on a status change                               |
| "Track how the cohort performs"            | Related child objects + reports/dashboards                         |
| "A conversational assistant for reviewers" | An Agentforce Agent with Topics and Actions                        |

## Why this step matters

Skipping straight to "build the object" without this translation is how projects end up with
objects that don't match how the business actually thinks, or automation bolted on after the
fact. Spending twenty minutes mapping the idea to concepts first is the cheapest hour in the whole
project.

## Agent Builder vs. everything else

One distinction worth internalizing early: **Agent Builder** (where Agentforce agents live) is
separate from **Flow Builder** (where multi-step automation lives) and separate again from
**Prompt Builder** (where single-shot, grounded AI prompts live). They can call into each other —
an Agent's Action can invoke a Flow, a Flow can call a Prompt Template — but they are three
different tools solving three different problems. Later sections revisit each one on its own.

**Key takeaway:** write the plain-English idea down first, then translate row by row into objects,
automation, UI, and AI — in that order. The AI layer is the last thing to design, not the first.
