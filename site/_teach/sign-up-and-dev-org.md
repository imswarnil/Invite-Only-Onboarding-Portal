---
section: getting-started
order: 1
title: "Sign up and stand up your org"
summary: "Get a free Salesforce org and turn on the AI features you'll need for everything after this."
---

# Sign up and stand up your org

You don't need a paid Salesforce license to follow this curriculum. A free **Developer Edition**
org (signup.salesforce.com) gives you a full, isolated Salesforce instance with the same admin
tools, the same metadata model, and — as of recent Developer Edition refreshes — access to
**Agentforce** and **Prompt Builder** for free, specifically so people can learn on it.

## Why not just use a production org

A Developer Edition org is disposable and yours alone. You will create custom objects, rewrite
permission sets, and delete test records dozens of times while learning — doing that in a
company's production org, or even a shared sandbox, would step on other people's work. Treat your
learning org as a lab, not a workspace.

## What "enabling Agentforce" actually means

Agentforce isn't a separate product you install — it's a layer of Setup pages, a new object model
(Agents, Topics, Actions), and a licensing flag that turns on inside your existing org. After
signup, the two things worth confirming in **Setup → Agentforce** before moving on:

- **Einstein / Agentforce is enabled** for the org (a toggle, not a purchase, on Developer
  Edition).
- You can open **Agent Builder** without a permissions error — if you can see the canvas, the
  license and setup are both in place.

## The mental model to hold onto

Everything in the sections after this one — objects, permissions, layouts, Prompt Builder,
Agentforce, Data Cloud — is metadata and configuration _inside this one org_. Nothing here talks
to a real payments company, a real bank, or the actual Stripe. It's a sandbox for learning what
those systems look like from the inside.

**Key takeaway:** a free Developer Edition org, checked into Agentforce being enabled, is the only
prerequisite for the rest of this course.
