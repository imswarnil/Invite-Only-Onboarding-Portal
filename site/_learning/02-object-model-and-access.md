---
section: "Foundations"
order: 3
title: "The data model, and the permissions gotchas that came with it"
---

# The data model, and the permissions gotchas that came with it

Phase 1 built the object model by hand in Setup, then again by metadata deploy for speed. The
interesting lessons weren't the fields themselves — they were the three permission surprises that
showed up once real data started flowing through.

## The shape

- **`Invite_Request__c`** — the application. `Company` and `Individual` record types, each with
  its own page layout (Company sees a registration-number field, Individual sees a PAN field —
  same object, different layout, driven by which record type is assigned).
- **`Crawler_Finding__c`** — Master-Detail child (deletes cascade with the parent, and it's what
  makes a future roll-up summary like "open findings count" possible).
- **`Provisioned_Account__c`**, **`Usage_Snapshot__c`** — Lookup children, for the post-approval
  side of the pipeline (Phase 4+).
- **`Stage__c`** drives the pipeline; **`Sub_Status__c`** is a _dependent_ picklist on it (its
  valid values change depending on which `Stage__c` is selected) — that's a `controllingField` +
  `valueSettings` relationship in the field's own metadata, not a separate setting somewhere else.

## Gotcha #1: deploying metadata grants nobody access — not even System Administrator

Creating a custom object/field through **Setup's point-and-click UI** quietly grants the admin
profile visibility as a side effect of the wizard. Creating the exact same object/field via the
**Metadata API** (which is what a `sf project deploy start` does) skips that convenience entirely
— the object exists, but zero profiles or permission sets can see it until you say so explicitly.

The fix was a dedicated **Permission Set** (`Admin_PS`) rather than hand-editing the giant
System Administrator profile: full Create/Read/Edit/Delete/View All/Modify All on the four
objects, edit access on every field, tab visibility, and record-type visibility. This is also
just... correct practice — Salesforce's own guidance is "prefer permission sets over editing
profiles," which `instruction.md`'s Phase 2 already called for.

## Gotcha #2: some fields refuse to take explicit permissions at all

Two categories of field can't have a `fieldPermissions` entry written for them, and the deploy
tells you so directly if you try:

- **Required fields** (`required: true` on the field) — their accessibility is implied by the
  object's own edit permission; explicit is-it-readable/editable entries are redundant and
  rejected.
- **Master-Detail relationship fields** — access follows the parent object's permissions
  automatically; you can't set field-level security on the relationship field itself.

## Gotcha #3: "Create" always implies "Read" — which matters a lot for a public Guest User

This is the one worth sitting with. When wiring the Experience Cloud site's Guest User profile
(anonymous visitors submitting the apply form), the goal was **create-only** — a stranger should
be able to submit an application, never browse or read anyone else's. Salesforce's permission
model won't allow that split: **you cannot grant Create without also granting Read** on the same
object. It's a hard platform rule, not a preference.

So why is this safe for a public form? Because Salesforce separately enforces **Secure Guest
User Record Access** — a mandatory, non-optional platform behavior since 2021 — which prevents a
Guest User from reading back records it creates via the standard UI/API, _regardless_ of the
object permission bits being technically "on." The permission grant and the actual runtime
behavior are two different layers; the field says Read is allowed, the platform still blocks a
stranger from listing every other applicant's data. As defense-in-depth on top of that mandatory
protection, `Invite_Request__c`'s org-wide sharing default is also `Private` — belt, suspenders,
and a second belt.

## The form itself: from one long screen to an Experience Cloud site

The first version of the `Apply_For_Invite` flow was one screen with ~21 fields — technically
correct, unpleasant to fill in. It's now four short screens (Who You Are → Your Business →
Revenue & Expansion → Anything Else) plus a confirmation, each just a `Screen` element with a
`connector` to the next — Flow gives you Back/Next between screens for free, no extra code. It's
embedded on a Digital Experience (Experience Cloud) site rather than the originally-planned plain
React form, specifically to learn Salesforce's own public-site tooling as part of this project's
"learn the platform" goal, alongside the React app you're reading this in.

**Concepts you now own:** the UI-wizard-vs-Metadata-API access gap, why required/Master-Detail
fields reject explicit FLS, the Create-implies-Read platform rule and why Secure Guest User
Record Access is what actually makes it safe, permission sets over profile edits, dependent
picklists via `controllingField`, and multi-screen Flow as a "multiform" builder.
