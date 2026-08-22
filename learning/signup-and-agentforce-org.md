---
section: "Getting Started"
order: 1
title: "Signing up and standing up the Agentforce org"
summary: "Day zero: why a Developer Edition org beat a trial or sandbox, and the one setup step that would have blocked everything later."
---

# Signing up and standing up the Agentforce org

Before any of the object-model or permissions lessons that follow, there had to be an org to build
in. This is the "day zero" entry: what signing up actually looked like, and the one setup step
that would have quietly blocked everything later if it had been skipped.

## Developer Edition, not a sandbox

A free Developer Edition org (via `signup.salesforce.com`) turned out to be the right call over a
trial or a sandbox: it's permanent (no expiry countdown to work around), fully isolated (nothing
here can touch anyone's production data), and — as of the current Developer Edition — ships with
Agentforce and Prompt Builder already licensable for free. That last point mattered: an older
trial org I tried first didn't have the option surfaced in Setup at all, and switching to a fresh
Developer Edition signup fixed it immediately.

## Confirming Agentforce was actually on

"Enabled" isn't a single button — it's a combination of a license flag and being able to actually
open the tool. The check that mattered: **Setup → Agentforce → Agents**, then confirming **Agent
Builder** opens without a permissions error. The first attempt hit a blank/error state; turning on
the Einstein Generative AI features under Setup first, then reloading Agent Builder, resolved it.

## What I mapped out before touching Setup again

Before creating a single object, I wrote down the plain-English idea (invite request → AI score →
human review → provisioning) and translated each piece to a Salesforce concept: custom object,
external crawler + Prompt Builder, standard record UI, a Flow, and — eventually — an Agentforce
agent for reviewers. That translation is what the next lesson (the object model) is built from.

**Concepts you now own:** Developer Edition vs. sandbox vs. trial for a learning project, that
"Agentforce enabled" means checking Agent Builder actually opens (not just a checkbox somewhere),
and translating a product idea into Salesforce concepts before configuring anything.
