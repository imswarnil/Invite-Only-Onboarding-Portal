# To-Do / Work Log

A running checklist of what's built vs. what still needs a manual click in Setup.
Check things off as you verify them in the org.

## Invite Request page: switched to a true full-width, no-header template

- [x] You switched `Invite_Request_Record_Page1`'s template in App Builder from
  `flexipage:recordHomeTemplateDesktop` (header + main + sidebar) to
  `flexipage:recordHomeSingleColNoHeaderTemplateDesktop` (single column, no header region at
  all) — genuinely the "our own, full width" page this project had been approximating with CSS
  tricks around the old template's fixed regions. Mirrored the same template + region structure
  onto the twin `Invite_Request_Record_Page` so they stay identical.
- [x] Since that template has no header region, there's no more platform record banner (name,
  Follow, standard action buttons) at all. Recovered the essentials by folding a small custom
  identity header into `inviteRequestWorkspace` itself: applicant name + record name + Type/
  Stage/Decision badges, plus a "back to list" link (standard action buttons like Delete/Clone
  have no entry point anymore — acceptable given `inviteRequestEditor`/`quickActionPanel` already
  cover create/edit/decide, but worth knowing if you ever want Delete back).
- [x] Also moved `stageProgressBar` from being a separate item sitting above the workspace into
  the workspace itself (right under the new identity header) — one cohesive component owns the
  whole page's visual flow now instead of two independent pieces stacked by the FlexiPage.

## Overview tab + homepage expansion

- [x] Renamed: `CustomTab` label "Home" -> "Overview" (its actual live label had drifted to
  "Home" without ever being retrieved into source -- local file said "A", a stale leftover);
  FlexiPage `masterLabel` "Invite Only Home App Page" -> "Invite Only Overview" (the internal
  Setup-facing name, shown in the App Builder page list).
- [x] `inviteTrendChart` — **new.** Chart.js line chart of Invite Request volume, with a
  Last 7/30/90 days range toggle and a Day/Week/Month group-by toggle, both independent and
  combinable. Backed by a new `InviteHomeController.getTrendData(rangeKey, groupBy)` that
  pre-seeds every bucket in the visible range to 0 so empty periods show as gaps, not missing
  data — bucketed on offset-from-range-start rather than calendar week/month boundaries, which
  sidesteps Apex's lack of a simple day-of-week accessor entirely.
- [x] `welcomeBanner` — **new.** "Good morning/afternoon/evening, {Name}" + today's date, wired
  to the logged-in user via `@salesforce/user/Id`.
- [x] `myOwnedInvites` — **new.** Invite Requests where `OwnerId` = the running user. Usually
  empty for most users since Guest submissions default to owned by the Guest User, not a human
  — the widget says so plainly rather than looking broken.
- [x] `inviteDataTable` — **new.** `lightning-datatable` over `getInviteTableRows`, sortable on
  every column (client-side, via `onsort`), plus a text search and a Stage picklist filter
  (client-side over an already-fetched 100-row page — no server round-trip per keystroke).
- [x] `indiaRegionMap` — **new.** "Region chart... show spots" — a stylized dot-map: real Chart.js
  can't do geography without a heavier mapping plugin, so this is a lightweight custom SVG-free
  card with `<div>` dots absolutely positioned at hardcoded, approximate (not real GeoJSON)
  state coordinates, sized by `Invite_Request__c` count from `getStateBreakdown()`. Correct
  relative north/south/east/west arrangement; not pixel-accurate geography.
- [x] Chose to keep extending the existing hand-rolled `chartJs` static-resource pattern
  (already proven working for `stageFunnel`/`applicantTypeSplit`) rather than adopting the
  linked Salesforce Labs `LightningWebChartJS` package — same end result (Chart.js in LWC)
  without installing a third-party unlocked package.
- [x] Homepage bento grid re-arranged: welcome banner (full width) -> CTA + 4 stats -> trend
  chart (full width) -> funnel/split/provisioned -> region map + owned invites -> top
  performers/ready-to-provision -> full data table (full width) -> recent/aging.
- [ ] Tab icon-only nav: not possible -- Lightning Experience's app nav bar always renders the
  tab's text label next to its icon; there's no "icon-only, no text" mode for that bar. The tab
  does still carry an icon+color via its `motif`, which shows in places like the App Launcher.

## Data model

- [x] `Invite_Request__c` (Company / Individual record types, ~37 fields, 2 layouts)
- [x] `Crawler_Finding__c` (master-detail to Invite_Request__c)
- [x] `Provisioned_Account__c` (now linked to `Invite_Request__c` via `Invite_Request__c` lookup — no Account involved)
- [x] `Usage_Snapshot__c` (lookup to `Provisioned_Account__c`)
- [x] Removed `Account.Record_POC__c`, `Invite_Request__c.Converted_Account__c`, `Provisioned_Account__c.Account__c` — Account is fully out of this app's data flow
- [ ] **Manual step:** `Account.Invite_Only_Customer` record type could not be deactivated via API ("last active record type for a profile"). To fully remove it: Setup → Object Manager → Account → Record Types → set a different default record type for System Administrator → then deactivate/delete `Invite_Only_Customer`.

## Automation

- [x] `Score_Routes_Stage` — Fit_Score routes to In Review / Waitlisted
- [x] `Fixable_Finding_Routes_Stage` — fixable Crawler Finding → Action Needed
- [x] `Provision_On_Approval` — Decision = Approved creates `Provisioned_Account__c` directly, moves Stage to Onboarding. Re-tested live (not just seeded) by toggling all 4 approved demo records through the real flow.

## Permissions

- [x] `Admin_PS` / `Reviewer_PS` / `CSM_PS` / `TSE_PS` — role-scoped, genuinely different access per role
- [x] `Admin_PS` cleaned of all Account references; granted FLS on `Provisioned_Account__c.Invite_Request__c`
- [x] `Admin_PS` granted "Manage Public List Views" (`EditPublicFilters`) + "Create and Customize List Views" (`CreateCustomizeFilters`) — this is the actual fix for "can't view all list views"
- [x] Guest ("invite Profile") — Create-only on `Invite_Request__c`, `recordTypeVisibilities` for Company/Individual, class access to `InviteRequestApi`

## Layouts & Record Pages

- [x] `Invite_Request__c` Company + Individual layouts (Converted_Account__c field removed)
- [x] `Provisioned_Account__c` layout (new) — now includes a "Commercial" section (Plan Tier, Risk Level, Contract Value, Go Live/Renewal dates)
- [x] `Usage_Snapshot__c` layout (new) — now includes a "Risk & Net Revenue" section (Chargeback Count, Refund Rate, Net Revenue); confirmed every one of the object's 8 custom fields is on the layout
- [x] **Fixed:** Page Layout Assignment for `Provisioned_Account__c`/`Usage_Snapshot__c`/both `Invite_Request__c` layouts, deployed as a minimal, additive `layoutAssignments`-only block on the `Admin` (System Administrator) profile — turned out this WAS settable via metadata after all, as long as the deployed profile file only specifies the one section being changed (dry-run validated first).
- [ ] **Manual step:** Classic-layout `relatedLists` (Provisioned Accounts on Invite Request, Usage Snapshots on Provisioned Account) hit "Cannot find related list" via metadata deploy — same wall hit earlier with Crawler Findings. Add via Setup → Object Manager → [object] → Page Layouts → drag the related list on manually. The Lightning Record Pages' Related tab shows these automatically regardless, so this only matters for the classic layout view.
- [x] `Provisioned_Account_Record_Page` / `Usage_Snapshot_Record_Page` — new Lightning Record Pages with header + sidebar widgets, deployed
- [ ] **Manual step:** Activate `Provisioned_Account_Record_Page` and `Usage_Snapshot_Record_Page` as each object's org-default Lightning Record Page (App Builder → Activation → Assign as Org Default). FlexiPage default-page assignment isn't a metadata-settable field — same limitation hit earlier getting `Invite_Request_Record_Page1` active.

## Invite Timeline — was genuinely broken, now fixed

- [x] **Root cause found:** `Invite_Request__c` had `enableHistory=true` at the object level, but every individual field's `trackHistory` flag was `false` — so Field History Tracking was recording *nothing*, on any field, ever. `inviteTimeline`'s empty state wasn't a bug in the widget, there was just no data to show.
- [x] Turned on `trackHistory` for the 5 fields the timeline actually reads (`Stage__c`, `Sub_Status__c`, `Decision__c`, `Fit_Score__c`, `Legitimacy_Verdict__c`), verified live by changing a real record's `Sub_Status__c` and confirming an `Invite_Request__History` row appeared.
- [x] Cleaned up the widget's display: raw API names (`Sub_Status__c`) now render as friendly labels ("Sub Status"), and the automatic "created" history entry shows as "Record Created" instead of "None → None".
- [x] Seeded a couple of extra tracked changes on the in-flight demo records so the timeline has more than one entry to look at.

## LWCs — 32 unique, working widgets

Dashboard / home (`Invite_Only_Home_App_Page`), now a bento grid:
- [x] `homeHeader`, `statTile` (now supports an icon), `recentInvitesList`, `provisionedAccountsSummary`, `inviteHomepage` (composes all of the above into the bento layout)
- [x] `stageFunnel`, `applicantTypeSplit` — rebuilt on **Chart.js** (external charting library, loaded from a `chartJs` static resource via `lightning/platformResourceLoader`) as a real bar chart and doughnut chart, replacing the old CSS-width-bar versions.
- [x] `pipelineAgingList` — requests stuck in Action Needed/In Review, oldest first.
- [x] `topPerformingAccounts` — Provisioned Accounts ranked by total usage volume.
- [x] `readyToProvisionList` — Invite Requests sitting In Review/Decision Pending, highest Fit Score first — literally "ready to be provisioned."
- [x] Bento CTA tile — "View pipeline" (navigates to the list) and "+ New invite request" (opens an in-page modal quick-create with `lightning-record-edit-form`, no navigating away).

`Invite_Request__c` record page — redesigned, then corrected once based on feedback (header
carries `stageProgressBar` only, `force:highlightsPanel` removed; main region is now
`inviteRequestWorkspace`, one fully custom full-width component; the FlexiPage's own sidebar
region now holds nothing but the standard Activity tab):
- [x] `inviteRequestWorkspace` — **new, then reshaped.** First pass was 3 even-ish columns
  (editor / timeline / quick actions) with the other informational widgets left in Salesforce's
  own sidebar region. Corrected to: a main column (`inviteRequestEditor`) + a narrow 320px
  sidebar-styled column stacking `quickActionPanel` above `inviteTimeline` — not three equal
  columns — plus a full-width row below for the rest (`scoreGauge`, `legitimacyBadge`,
  `daysInStageTile`, `relatedProvisionedAccountCard`, `complianceChecklist`, `findingsList`),
  moved in from Salesforce's sidebar region so the whole record page is one self-contained,
  full-width composition instead of being split across FlexiPage regions.
- [x] `inviteRequestEditor` — tabs moved from a horizontal row along the top to a **vertical rail
  down the left** (200px, icon + label stacked), with the tab content filling the rest of the
  width to its right. Also fixed a stale `Converted_Account__c` field reference left over from
  the Account removal (would have thrown at runtime). All 5 tab panels (Contact/Business/
  Research & Scoring/Pipeline/Notes) stay mounted in the DOM, CSS-hidden when inactive — not
  `template if:true`, which would drop their `lightning-input-field`s and silently lose edits on
  a tab you'd switched away from. Save sits pinned at the top of the nav rail, always visible.
  Styled with Stripe tokens (`#635bff` accent, `#0a2540` ink, 8px radii) pushed into
  `lightning-input-field`/`lightning-button`'s exposed SLDS style hooks (`--slds-c-input-*`,
  `--slds-c-button-*`) — those custom properties cross the shadow boundary even though regular
  CSS selectors can't reach in.
- [x] `quickActionPanel` — replaces `decisionBar` (deleted). Same Approve/Waitlist/Reject →
  `Decision__c` logic, as icon-in-a-box tiles (green check / amber warning / red close), active
  decision highlighted. Also deleted `quickNotesWidget` — its one field, `Notes__c`, now lives in
  the editor's Notes tab.
- [ ] If the quick action tiles still don't show up after this: hard-refresh / clear the Lightning
  cache first — both `Invite_Request_Record_Page` and its twin `Invite_Request_Record_Page1` carry
  the identical structure (confirmed via `sf org list metadata`, no stray third page exists), so
  it isn't a matter of the "wrong" page being active. If still missing after a refresh, that
  would point at the FlexiPage-activation gap already flagged below, not the component itself.
- [x] Also fixed while in here: the Guest (`invite Profile`) profile still had a `fieldPermissions` entry for `Invite_Request__c.Converted_Account__c`, a field deleted earlier this session — cleaned up so a future redeploy of that profile doesn't fail against a nonexistent field.

`Provisioned_Account__c` record page sidebar:
- [x] `usageSnapshotSummary`, `productsLiveChecklist`, `usageTrendSparkline`
- [x] `renewalCountdown` — **new.** Days until `Renewal_Date__c`, color-banded (healthy/soon/overdue).

`Usage_Snapshot__c` record page sidebar:
- [x] `disputeRateGauge`
- [x] `monthOverMonthDelta` — **new.** % change in Volume_INR__c vs. the prior month's snapshot for the same account, backed by a new `getMonthOverMonthDelta` Apex method.

Standalone / used elsewhere:
- [x] `accountInviteSummary` — removed (Account is gone); logic reincarnated as `usageSnapshotSummary`

## Prompt Builder

- [x] `Invite_Only_Brief` — first real, deployed `GenAiPromptTemplate` in this repo (`force-app/main/default/genAiPromptTemplates/`). Grounds on one `Invite_Request__c`, writes a 4-part approve/waitlist/reject-oriented brief from only the applicant's own form inputs. Deployed clean on the first real attempt; round-tripped via retrieve to confirm. Deployed as `Draft` on purpose — see `agentforce.md` §2a for why activation stays a manual Setup step.
- [x] Deleted the abandoned `Invite_Only_New_Request_Brief` stub (a default `rephraseText` template with no real content) it superseded.
- [ ] Not wired to anything yet — no button/Flow/LWC calls it. Natural next step: a "Generate Brief" action on the Invite Request record page.
- [ ] `Dossier_And_Score` (the bigger, JSON-contract template that would actually write `Fit_Score__c`/`Legitimacy_Verdict__c`/findings) is still conceptual only — see `agentforce.md` §2b.

**Total: 32** widgets, all backed by real wired data (no placeholders) -- see "Overview tab +
homepage expansion" above for the 5 added this round (`inviteTrendChart`, `welcomeBanner`,
`myOwnedInvites`, `inviteDataTable`, `indiaRegionMap`).

## Public site (stripe.imswarnil.com)

- [x] Jekyll rebuild, Stripe design system styling, SVG illustrations, TOC, pagination, GitHub star button
- [x] Restored the top navbar as the site's persistent chrome (a mid-refactor attempt to move to a sidebar-only nav had left `/invite` with no navigation at all); added a `/roadmap` link to nav + footer
- [x] `InviteRequestApi.cls` — fixed the Secure-Guest-User-Record-Access bug (was re-querying a record right after inserting it, which Guest Users can never do); reverted the temporary debug error message back to a safe generic one. Originally built to back a `/invite` form on the public Jekyll site (verified end-to-end: exact JSON payload, `HTTP 201`, record created) — still deployed and directly testable (`doc.md` §2), but no longer called from the public site (see below).
- [x] **Removed (2026-08-21):** the `/invite` live apply form from the public Jekyll site. Public intake is now Experience-Cloud-only (`Apply_For_Invite` Flow) — the original README design intent — and the Jekyll site is a documentation/portfolio site, not a live intake channel.
- [x] **Added (2026-08-21):** `/roadmap` — a markdown-collection-driven status board (implemented / in progress / planned) plus a changelog, aimed at recruiters skimming the project's scope and the GTM-engineer-transition story.
- [ ] CORS whitelist for `https://stripe.imswarnil.com` (`force-app/main/default/corsWhitelistOrigins/`) was added for the now-removed `/invite` form's cross-origin `fetch()` call; no longer needed by the public site, left in place since it's harmless and Salesforce-side (not touched as part of this front-end change).

## Docs

- [x] `README.md` — ER diagram and Automation section updated to the Account-free 3-object pipeline
- [x] `agentforce.md` — Prompt Builder + Agentforce guidance (not deployed metadata, by design — explicitly deferred)
- [ ] Not done: git co-author trailer removal from history — blocked for me by the sandbox classifier (history rewrites); commands were handed to you to run directly

## Known pre-existing, unrelated-to-us test failures

Running `RunLocalTests` in this org shows 2 failures that are **not** from this project — pre-installed sample-app code (`ExperienceControllerTest` compile fail, `SampleDataTest.generateData_works` assertion mismatch). Every test in `InviteRequestApiTest` and `InviteHomeControllerTest` passes.
