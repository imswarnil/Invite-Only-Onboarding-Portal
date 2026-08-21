---
section: automation-n8n
order: 8
title: "Connecting n8n to Salesforce: brain vs. hands"
summary: "Why an external automation tool owns the open web, and Salesforce never does."
---

# Connecting n8n to Salesforce: brain vs. hands

Salesforce's AI tools (Prompt Builder, Agentforce) reason extremely well over data they are
**given** — they do not browse the internet, and they shouldn't be made to. That's the entire
reason **n8n** sits in front of Salesforce in this project: n8n is the "hands" that fetch the web;
Salesforce is the "brain" that reasons over what those hands hand it.

## The shape of the flow

```
Trigger (new Invite_Request__c)
   │  n8n calls the Salesforce REST API to fetch the new record
   ▼
HTTP Request nodes — scrape the applicant's stated website, any public registry data
   ▼
A summarization step — compress raw HTML into a short, structured "finding"
   ▼
n8n writes the finding back to Salesforce as a Crawler_Finding__c record
   ▼
Prompt Builder / Agentforce reason over that finding — never over raw HTML
```

Salesforce only ever receives clean, structured text. It never fetches a URL itself.

## Why this split, specifically

- **Prompts stay small and reliable.** Feeding an LLM raw HTML wastes context and invites the
  model to "reason" about markup instead of content. A crawler doing the compression first means
  every prompt downstream is short and consistent.
- **The dangerous part is isolated.** Scraping arbitrary URLs carries real operational risk
  (rate limits, malformed pages, hostile content). Keeping that entirely in n8n means a bad
  scrape can't corrupt Salesforce data directly — it only ever produces a `Crawler_Finding__c`
  record through a controlled write.
- **Each tool does the thing it's actually good at.** n8n is a general-purpose workflow/HTTP tool;
  Salesforce is a system of record with strong data model and permission primitives. Neither is
  trying to be the other.

## The wiring, at a glance

Authentication from n8n into Salesforce is a **Connected App** (OAuth) or a **Named Credential**
on the Salesforce side — never hard-coded session IDs. n8n's HTTP Request node calls Salesforce's
REST API (`/services/data/vXX.0/sobjects/Crawler_Finding__c`) to create the finding record once
scraping finishes; the trigger side can be as simple as a scheduled poll of new
`Invite_Request__c` records, or a Platform Event if you want it closer to real-time.

**Key takeaway:** decide which system "touches the open web" once, up front, and keep that
boundary hard. Everything downstream — prompts, agents, reviewer UI — gets simpler when there's
exactly one place raw, untrusted web content is allowed to exist.
