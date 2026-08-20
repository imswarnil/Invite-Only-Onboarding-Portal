# 2026-08-20 — New records were missing most of their fields

**The problem.** Both `Invite_Request__c` record types (Company, Individual) had full,
35-field page layouts built and deployed. Creating a new record still showed only a handful of
fields — looked like the layouts themselves were broken or incomplete.

**Options considered.**

- Rebuild the layouts from scratch, assuming the field placements were wrong.
- Check whether a Lightning Record Page (FlexiPage) with Dynamic Forms was overriding the layout
  with a partial field set — ruled out, no Invite_Request__c-specific FlexiPage existed.
- Check whether the record type → layout mapping was ever actually set.

**What I found.** The mapping lives on the **Profile** (`layoutAssignments`), not on the
`RecordType` or `Layout` metadata — and it had never been set, for either record type, since the
object was created. The layouts were complete; nothing told Salesforce to use them.

**The fix.** Added explicit `layoutAssignments` entries to the Admin profile, mapping each
record type to its layout. Verified against a fresh retrieve of the live profile first (not just
the local file) to make sure this wasn't a stale-copy problem — it wasn't; the org itself had
never had this set.

**Why it stayed hidden so long:** nothing in the RecordType or Layout XML hints that the
assignment lives elsewhere — you only find it by knowing to look at the Profile, or by noticing
the mismatch between "the layout has 35 fields" and "the New screen shows 6."

See [`/learn`](https://stripe.imswarnil.com/learn) for the fuller write-up, including the related
Quick Action / `platformActionList` work done the same day.
