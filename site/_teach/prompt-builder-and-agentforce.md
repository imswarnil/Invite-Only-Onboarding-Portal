---
section: ai-layer
order: 9
title: "Scoring with Prompt Builder, conversing with Agentforce"
summary: "Two different AI tools for two different jobs — and how to tell which one you need."
---

# Scoring with Prompt Builder, conversing with Agentforce

Both tools sit on the same underlying models, and it's easy to reach for the wrong one. The
distinction that matters in practice: **Prompt Builder** answers one grounded question at a time;
**Agentforce** carries on a multi-turn conversation and can take multi-step action.

## Prompt Builder: grounded, single-shot, deterministic-ish

A **Prompt Template** is built around merge fields pulled straight from a record — in this
project, a template takes an `Invite_Request__c` plus its related `Crawler_Finding__c` records and
produces a risk/fit score with a short justification. It runs once per invocation (a button click,
a Flow step, a trigger), returns text, and that text gets written back to a field. There's no
memory between calls and no back-and-forth — it's closer to a very well-informed formula than a
conversation partner.

**Use it when:** the task is "given this record's data, produce this one piece of output" —
scoring, summarizing, drafting a field value.

## Agentforce: multi-turn, tool-using, conversational

An **Agent** is built from **Topics** (the areas it's allowed to help with) and **Actions**
(specific things it can _do_ — call a Flow, run an Apex method, query a record). Unlike a Prompt
Template, an agent holds conversational context across turns and decides, per user message, which
Topic and Action apply. In this project, the reviewer-facing agent can answer "why did this
applicant score low?" by pulling the same crawler findings a Prompt Template would use — but it
can also take the next step and, e.g., draft a rejection email, because that's wired up as an
Action.

**Use it when:** the task is "have a conversation and take variable next steps" — not a fixed,
single output.

## They compose

An Agentforce Action can call a Flow, and that Flow can invoke a Prompt Template — so the two
tools aren't competitors, they're layers. A common shape: Agentforce handles the conversation and
decides _what_ needs doing; a Prompt Template (invoked as a step underneath) handles a specific
"reason over this data and produce text" task within that larger flow.

## Both are only as good as what n8n and the object model hand them

Neither tool fetches the web (see the previous section) and neither can reason over data it can't
see (see the permissions section). A slick Agent Action wired to a Flow that queries a field the
running user can't read will fail quietly or return nothing useful — the AI layer sits on top of
everything else in this curriculum, not underneath it.

**Key takeaway:** one grounded question, one answer → Prompt Builder. An ongoing conversation that
takes actions → Agentforce. Both depend entirely on clean data being available and readable
underneath them.
