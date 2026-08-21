---
section: security-permissions
order: 4
title: "Permission sets, FLS, and the Guest User trap"
summary: "Three permission surprises that only show up once real data — and real strangers — touch your objects."
---

# Permission sets, FLS, and the Guest User trap

Salesforce's permission model is powerful and, in three specific spots, deeply counter-intuitive.
Each of these cost real debugging time; each has a one-sentence fix once you know it.

## 1. Deploying metadata grants nobody access — not even admins

Creating a custom object through **Setup's point-and-click UI** quietly grants the System
Administrator profile visibility as a side effect of the wizard. Creating the _exact same_ object
via the **Metadata API** (a `sf project deploy start`, or any CI/CD pipeline) skips that
convenience entirely — the object exists, but zero profiles or permission sets can see it until
you say so explicitly.

**The fix:** build a dedicated **Permission Set** for admin access rather than hand-editing the
System Administrator profile. This is also just correct practice — Salesforce's own guidance is
"prefer permission sets over profile edits" — and it means your access model is version-controlled
metadata, not a click you have to remember you made.

## 2. Some fields refuse explicit permissions entirely

Two field types will reject a `fieldPermissions` entry outright, and the deploy error tells you
so directly:

- **Required fields** — accessibility is implied by the object's own edit permission; an explicit
  entry is redundant.
- **Master-Detail relationship fields** — access follows the parent object automatically; you
  can't set field-level security on the relationship field itself.

If a deploy complains about a field you didn't expect, check whether it's required or a
Master-Detail field before assuming your permission set XML is malformed.

## 3. "Create" always implies "Read" — the one that matters for public forms

This is the rule worth sitting with longest. For a public application form (a stranger submitting
data via a Guest User), the intuitive goal is **create-only**: let anyone submit, let nobody
browse. Salesforce's permission model **will not allow that split** — you cannot grant Create
without also granting Read on the same object. It's a hard platform rule, not a configuration
choice.

So how is a public form ever safe? Because Salesforce separately enforces **Secure Guest User
Record Access** — a mandatory platform behavior since 2021 — which prevents a Guest User from
reading back records it creates via the standard UI/API, _regardless_ of the object permission
bits being technically "on." The permission grant and the actual runtime behavior are two
different layers. As defense-in-depth on top of that mandatory protection, set the object's
org-wide sharing default to **Private** too — belt, suspenders, and a second belt.

**Key takeaway:** permission sets over profile edits, check required/Master-Detail before
debugging a rejected FLS entry, and trust Secure Guest User Record Access (plus a Private sharing
default) — not the permission bits alone — to keep a public Create-only form actually safe.
