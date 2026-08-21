---
section: "Foundations"
order: 4
title: "Trimming the record's action bar, and the layout-assignment gotcha"
---

# Trimming the record's action bar, and the layout-assignment gotcha

Two problems showed up back to back on the same record page: the action buttons were cluttered
with things nobody needed, and — much worse — creating a new record silently hid most of its
fields. Neither was where I expected to look.

## The record's action bar is its own metadata, and it's opt-in

The row of buttons at the top of a Lightning record (Edit, Delete, Change Owner, plus anything
custom) isn't automatic once you go looking for it — it's a `platformActionList` with
`actionListContext: Record` on the page **layout**. Leave it out entirely, like this object
started out, and Salesforce fills it with a sensible-but-noisy default: every Chatter compose
action (post, poll, link), Log a Call, New Task, New Event, plus the standard buttons. Define the
list explicitly and only those items show:

```xml
<platformActionList>
    <actionListContext>Record</actionListContext>
    <platformActionListItems>
        <actionName>Edit</actionName>
        <actionType>StandardButton</actionType>
        <sortOrder>0</sortOrder>
    </platformActionListItems>
    <platformActionListItems>
        <actionName>New_Opportunity</actionName>
        <actionType>QuickAction</actionType>
        <sortOrder>1</sortOrder>
    </platformActionListItems>
    <!-- ...New_Case, Delete, ChangeOwnerOne -->
</platformActionList>
```

The reference I trusted here wasn't the docs (they don't spell out the standard action name
strings) — it was retrieving a **real Account layout** from the org and reading its
`platformActionList` directly. `Edit`, `Delete`, `ChangeOwnerOne`, `Clone`, `Share` are all
`StandardButton`; anything custom is `QuickAction`.

## Why "New Opportunity" couldn't just be a normal Quick Action

The obvious move — a Create-type Quick Action scoped to `Invite_Request__c`, named
`Invite_Request__c.New_Opportunity` — fails deploy with `Required fields are missing:
[TargetField]`. An object-scoped Create action needs a **`targetField`**: the lookup field on the
_target_ object (Opportunity) that points back to the record you launched the action from. That
field doesn't exist — `Invite_Request__c` has no such relationship to Opportunity or Case.

The fix was to make the action **global** instead (drop the `Invite_Request__c.` prefix from the
filename and fullName). Global actions don't need a `targetField` — the tradeoff is the created
Opportunity/Case is standalone, not auto-linked back to the invite request. Good enough for now;
a real link would mean adding an actual lookup field, a bigger and more deliberate change than
"I want a shortcut button here."

## The layout-assignment gotcha (the expensive one)

Both record types — `Company` and `Individual` — had full, 35-field page layouts, carefully built.
New records still showed only a handful of fields. The layouts were fine. The problem was one
level up: **which layout a record type actually uses, per profile, is a separate mapping** —
`layoutAssignments` on the **Profile**, not anything on the `RecordType` or the `Layout` itself:

```xml
<layoutAssignments>
    <layout>Invite_Request__c-Invite Request Company Layout</layout>
    <recordType>Invite_Request__c.Company</recordType>
</layoutAssignments>
```

Without it, Salesforce doesn't error — it just quietly falls back to some minimal default, which
looks exactly like "the layout is missing fields" from the outside even though the layout is
complete. It's a one-way trip to confusion: nothing in the RecordType or Layout metadata hints
that the wiring lives elsewhere. Confirmed by retrieving the live `Profile:Admin` fresh (in case
the local copy was just stale) and finding the section absent there too — this had never been set,
not once, since the object was created.

**Concepts you now own:** `platformActionList` vs the Chatter-feed `quickActionList` (two
different sections, easy to conflate), why a scoped Create action needs a `targetField` and when
a global action is the honest alternative, and that record-type → layout is a **profile**
concern — always check `layoutAssignments` before assuming a layout problem is _in_ the layout.
