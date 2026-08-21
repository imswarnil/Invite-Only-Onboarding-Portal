---
section: "AI Layer"
order: 7
title: "Turning the crawler's findings into a score, and a conversation"
---

# Turning the crawler's findings into a score, and a conversation

With n8n reliably writing `Crawler_Finding__c` records, the next question was: what actually
_reasons_ over them? Two different Salesforce AI tools ended up doing two different jobs here, and
picking the wrong one first cost a bit of time.

## First attempt: trying to make one tool do both jobs

The first instinct was to build a single Agentforce agent that both scored applicants _and_
chatted with reviewers. That fell apart almost immediately: scoring needs to happen automatically,
every time a new finding lands, with no human in the loop — and an Agentforce agent is fundamentally
a _conversation partner_, invoked by someone typing a message. Forcing a conversational tool to run
unattended on a schedule was fighting the tool's actual shape.

## The split that actually worked

- **Prompt Builder** now owns the scoring. A Prompt Template takes the `Invite_Request__c` record
  plus its related `Crawler_Finding__c` records as grounding, and produces a fit score and a short
  rationale. It's invoked from a Flow the moment a new finding is saved — no conversation, just
  "given this data, produce this output," which is exactly what a Prompt Template is for.
- **Agentforce** owns the reviewer-facing conversation. Its Topic is scoped to "answer questions
  about invite applicants"; its Actions can pull the same crawler findings a Prompt Template would
  use, so a reviewer can ask "why did this one score low?" and get an answer grounded in the same
  data, without me having to duplicate the scoring logic anywhere.

## The gotcha: an Action without a well-scoped Topic just... doesn't fire

The first Agentforce Action I wired up (a simple "get crawler findings for this record" query)
never triggered from real reviewer questions, even though it worked fine in the Action's own test
panel. The Topic's instructions were too generic ("help with invite requests") for the model to
reliably decide this Action was relevant. Narrowing the Topic's description to name the specific
kinds of questions it should handle — score explanations, finding lookups — fixed it immediately.
Agentforce's routing is only as good as how precisely the Topic describes what it's for.

**Concepts you now own:** why a scheduled, no-human-in-the-loop task belongs in Prompt Builder and
an open-ended conversation belongs in Agentforce, that both can ground on the exact same
underlying data without duplicating logic, and that a vague Topic description is the most common
reason an otherwise-correct Agentforce Action never gets invoked.
