---
section: process-ui
order: 5
title: "Action bars, quick actions, and the layout-assignment gotcha"
summary: "The single most expensive lesson in this project: layout assignment lives on the Profile."
---

# Action bars, quick actions, and the layout-assignment gotcha

Two problems that look like "the layout is broken" are usually something else entirely. Both cost
real time here; neither was where intuition said to look first.

## The action bar is opt-in metadata, not automatic

The row of buttons at the top of a Lightning record (Edit, Delete, plus anything custom) isn't
automatic once you go looking for it — it's a `platformActionList` with
`actionListContext: Record` living on the page **layout**. Leave it undefined and Salesforce fills
it with a noisy default: every Chatter action, Log a Call, New Task, New Event, plus the standard
buttons. Define the list explicitly and only those items show. The fastest way to learn the
correct action name strings (`Edit`, `Delete`, `ChangeOwnerOne`, `Clone`, `Share` are all
`StandardButton`; anything custom is `QuickAction`) is retrieving a real, working layout — like a
standard Account layout — from your own org and reading its XML directly, rather than guessing
from documentation that doesn't spell every string out.

## A scoped Quick Action needs a target field to exist first

An object-scoped Create action (e.g., "New Opportunity" launched from `Invite_Request__c`) needs
a **`targetField`**: a lookup field on the _target_ object that points back to the record you
launched the action from. If that relationship doesn't exist yet, the deploy fails with a missing
required field error. The two honest options are: add the relationship field first (more
deliberate, links the created record back automatically), or make the action **global** instead
(no target field required, but the created record is standalone). Don't reach for global as a
default — reach for it when you've decided the link-back isn't worth modeling yet.

## The layout-assignment gotcha

This is the expensive one. A fully-built, 35-field page layout can still show only a handful of
fields on new records — and the layout itself is completely fine. **Which layout a record type
uses, per profile, is a separate mapping**: `layoutAssignments` on the **Profile**, not anything
stored on the `RecordType` or the `Layout`. Skip that assignment and Salesforce doesn't error — it
silently falls back to a minimal default that looks, from the outside, exactly like "the layout is
missing fields."

**The debugging move that actually works:** if a layout looks incomplete on new records but is
complete when you open it directly in Setup, stop looking at the layout. Go check
`layoutAssignments` on the profile the user (or you) are testing with.

**Key takeaway:** action bars are opt-in layout metadata, scoped Create actions need a real
relationship field to target, and record-type-to-layout is a **profile** concern — always check
`layoutAssignments` before assuming a layout problem is _in_ the layout.
