# Invite Only Portal

A hands-on learning project: an invite-only onboarding back office modeled on Stripe India's
real application flow. A person applies → an AI + web-crawler researches and scores them → a
reviewer decides → approved businesses are onboarded/provisioned/supported → the invited cohort's
health is tracked over time (cancel vs upsell).

Built to learn Salesforce's AI stack (Prompt Builder, Flow, Agentforce, Data Cloud) end to end —
and to document the journey as a public learning site and a resume-ready case study.

**[stripe.imswarnil.com](https://stripe.imswarnil.com)** — project overview · **[/learn](https://stripe.imswarnil.com/learn)** — the build log, phase by phase · **[/roadmap](https://stripe.imswarnil.com/roadmap)** — what's implemented, in progress, and planned

**The mental model:** Salesforce AI reasons over data it is _given_; it does not fetch the web.
n8n fetches (scrapes) → hands clean text to Salesforce → Prompt Builder / Agentforce reason and
write results back. **Brain vs hands.**

## Tech stack

| Layer                    | Tech                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public site              | Jekyll (Ruby), GitHub Pages — homepage, `/learn`, `/roadmap` (case study/portfolio site, no live form)                                                                                                                                                                                                                                                                                                             |
| Public intake            | A Salesforce Experience Cloud (LWR) site with a Guest User profile and a 4-step Screen Flow — the public site used to also carry a `/invite` form that `fetch()`'d a Guest Apex REST endpoint directly, since removed to keep the Jekyll site a documentation/portfolio site rather than a live intake channel; the REST endpoint (`InviteRequestApi.cls`) still exists and is directly testable (see `doc.md` §2) |
| Reviewer UI              | Native Lightning Web Components — a full-width homepage, record editor, sidebar widgets, all Stripe-palette styled                                                                                                                                                                                                                                                                                                 |
| Data layer               | 4 custom objects (no standard Account/Contact) end to end, Field History Tracking on the fields that matter                                                                                                                                                                                                                                                                                                        |
| Automation               | Record-triggered Flow (stage routing, Provisioned Account creation on approval)                                                                                                                                                                                                                                                                                                                                    |
| Server-side logic        | One Apex class (`InviteHomeController`) for the aggregate queries LWC wire adapters can't do alone                                                                                                                                                                                                                                                                                                                 |
| AI (planned/in progress) | Prompt Builder, Agentforce, Data Cloud — see [`agentforce.md`](./agentforce.md)                                                                                                                                                                                                                                                                                                                                    |
| Crawling (planned)       | n8n — see [Integration architecture](#integration-architecture) below                                                                                                                                                                                                                                                                                                                                              |
| Docs site                | Markdown collection, frontmatter-driven TOC + pagination via Liquid                                                                                                                                                                                                                                                                                                                                                |
| Hosting/CI               | GitHub Pages, GitHub Actions                                                                                                                                                                                                                                                                                                                                                                                       |

## Data model

```mermaid
erDiagram
    Invite_Request__c ||--o{ Crawler_Finding__c : "Master-Detail"
    Invite_Request__c ||--o{ Provisioned_Account__c : "Invite_Request__c"
    Provisioned_Account__c ||--o{ Usage_Snapshot__c : "Provisioned_Account__c"

    Invite_Request__c {
        string RecordType "Company or Individual"
        picklist Stage__c "Received -> ... -> Won/Rejected"
        number Fit_Score__c "AI-written, 0-100"
        text Dossier__c "AI-written summary"
    }
    Crawler_Finding__c {
        picklist Severity__c
        checkbox Fixable__c
    }
    Provisioned_Account__c {
        autonumber Inlet_Id__c
        picklist Status__c
    }
    Usage_Snapshot__c {
        currency Volume_INR__c
        percent Dispute_Rate__c
    }
```

`Invite_Request__c` has two **record types** — `Company` and `Individual` — each with its own
page layout (Company sees a registration-number field, Individual sees a PAN field; same object,
different layout, driven by which record type is assigned). That layout-per-record-type mapping
lives on the **Profile** (`layoutAssignments`), not the record type itself — miss it, and Salesforce
silently falls back to a minimal default layout even though the real one exists. See
[`/learn`](https://stripe.imswarnil.com/learn) for the write-up of the day that bit us.

The pipeline is three purpose-built custom objects end to end — no standard Account/Contact
involved. Early builds provisioned a standard `Account` on approval, since a customer "is" an
Account in the standard sales model — but this dev org hosts other unrelated POCs that also touch
Account, and keeping this app's data 100% on its own objects turned out simpler than tagging and
filtering around shared standard-object data. `Provisioned_Account__c` now looks straight back up
to the `Invite_Request__c` it came from.

## Automation

Two record-triggered Flows do the work `instruction.md`'s Phase 4 specs, built as Flow rather than
an Apex trigger — that's both what the plan called for and current Salesforce guidance for
standard record automation:

- **`Score_Routes_Stage`** — `Fit_Score__c >= 75` routes to `In Review`, `< 45` routes to
  `Waitlisted`. Ready now; won't fire meaningfully until Phase 3's Prompt Builder actually writes
  a score, but testable by hand-editing the field today.
- **`Fixable_Finding_Routes_Stage`** — a Crawler Finding marked `Fixable` + `Open` moves its
  _parent_ Invite Request to `Action Needed` automatically.
- **`Provision_On_Approval`** — `Decision__c = Approved` creates a `Provisioned_Account__c` linked
  back to the `Invite_Request__c` it came from, and moves `Stage__c` to `Onboarding`. One click on
  the reviewer's Decision Bar is the entire "approve and provision" path — no standard Account
  object involved anywhere in it.

## Integration architecture (n8n)

n8n is the **only** thing in this project that fetches the open web — Salesforce AI reasons over
data it's given, it never crawls on its own. The planned flow (Phase 7, not yet built):

```mermaid
flowchart LR
    A["/invite form<br/>(Experience Cloud)"] -->|submits| B[Invite_Request__c<br/>Stage = Received]
    B -->|Run Research action| C[n8n webhook]
    C -->|scrape: blog count, pricing,<br/>registry checks, tech stack| D[CrawlSummary]
    D -->|hands clean text back| E["Prompt Builder<br/>(Stripe_Dossier_And_Score)"]
    E -->|writes Dossier, Fit Score,<br/>Legitimacy Verdict, findings| B
    B -->|Fit_Score__c changes| F[Score_Routes_Stage Flow]
```

A **Demo Mode** flag is planned before any live crawling gets wired up, so the whole app can be
demoed against ~12 seeded sample records with zero paid calls or live scraping.

## Structure

- `force-app/` — Salesforce metadata for this app only (plain names, no prefix), scoped via
  `manifest/package.xml` — see [`instruction.md`](./instruction.md) §16. This org hosts other
  POCs (Coral Cloud, etc.); never retrieve with wildcards.
- `site/` — the public Jekyll site (homepage, `/learn`, `/roadmap`). Deployed to
  GitHub Pages via `.github/workflows/pages.yml`.
- `learning/` — markdown lessons, the single source of truth copied into `site/_learning/` at
  build time. Frontmatter-driven section grouping, sidebar TOC, and prev/next pagination.
- `case-study/` — resume-ready writeup + a dated running log of problems solved as they happened.
- `docs/media/` — screenshots/gifs referenced by lessons and the case study.
- `integration/` — n8n workflow exports and Prompt Builder template text, once built.
- `scripts/apex/` — Apex one-offs, including `seed-demo.apex` (demo Invite Requests from India,
  two of which "succeed" end-to-end through `Provision_On_Approval`).

Full build plan, phase by phase: [`instruction.md`](./instruction.md). Salesforce AI plan
(Prompt Builder + Agentforce, concepts and setup steps): [`agentforce.md`](./agentforce.md).

**The public intake form** (applying for an invite) is a Salesforce Experience Cloud (LWR) site
with a Guest User profile and a multi-step Flow — not a page on the Jekyll site — specifically to
learn Salesforce's own public-site tooling as part of this project's "learn the platform" goal.
The reviewer's own screen is native Lightning Web Components, not any external app.

## Setup

See `instruction.md` §2 and §4 (Phase 0) for the full Salesforce tool list and bootstrap commands.
For the public site:

```bash
cd site
bundle install
cp ../learning/*.md _learning/   # sync lessons (CI does this automatically)
bundle exec jekyll serve         # http://localhost:4000
```

## Deploy

- The Jekyll site builds and publishes to GitHub Pages via `.github/workflows/pages.yml`, served
  at **stripe.imswarnil.com**.
- Salesforce metadata deploys manually for now (`sf project deploy start --source-dir force-app`)
  — no CI pipeline for the org side yet.

---

_Independent educational project. Not affiliated with, endorsed by, or connected to Stripe. Uses
public information about Stripe India's invite-only program to make the scenario realistic.
Hosted for learning; the applicant form is a styled demo, not Stripe's real form._
