---
section: "Automation"
order: 6
title: "Wiring n8n in as the crawler"
summary: 'Wiring n8n in as the crawler: the "hands" that fetch the open web so Salesforce''s "brain" has something to reason over.'
---

# Wiring n8n in as the crawler

With the object model, permissions, and a themed front end in place, the next real gap was
obvious: nothing in Salesforce could actually research an applicant. Salesforce AI reasons over
data it's given — it doesn't fetch the web. That's the job this phase handed to **n8n**.

## Brain vs. hands, made literal

The mental model from the very first lesson in this log finally became real infrastructure:
**n8n fetches** (scrapes the applicant's stated website, any public registry info) → **compresses**
that into a short structured summary → **writes it to Salesforce** as a `Crawler_Finding__c`
record. Salesforce never makes an outbound call to an arbitrary URL; n8n never reasons about the
content, it just fetches and shapes it.

## The part that took longest: authentication, not scraping

The scraping nodes themselves (HTTP Request → parse → summarize) were straightforward n8n
plumbing. The slower part was wiring n8n's write-back into Salesforce correctly: a **Connected
App** with OAuth, scoped tightly enough that a leaked n8n credential couldn't do more than create
`Crawler_Finding__c` records. Reusing the same broad admin-style credentials I'd used for metadata
deploys earlier would have worked technically, but defeated the point of scoping access — this
got its own narrower permission set, following the same "permission set over profile edit" habit
from the earlier data-model lesson.

## One design call: findings are Master-Detail, on purpose

`Crawler_Finding__c` was already Master-Detail to `Invite_Request__c` from the original data
model, and this phase is why: if an applicant record ever gets deleted (a test record cleanup, a
duplicate merge), the crawler findings should disappear with it rather than becoming orphaned rows
nothing else references. Getting the relationship type right in the modeling lesson meant zero
rework here.

**Concepts you now own:** keeping "touches the open web" isolated to exactly one system, scoping
a Connected App's permission set narrowly instead of reusing an admin credential, and how an
earlier data-modeling decision (Master-Detail) paid off once real automation started writing to
that object.
