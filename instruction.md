# instruction.md — Invite Only Onboarding Portal

> **Project / repo / folder:** `Invite-Only-Onboarding-Portal`
> **Brand shown in UI:** *Invite Only Portal*
> **Use case:** Stripe-India invite-only onboarding (a **learning POC**).
> **Org:** `go-to-market-ai-dev-ed` (Developer Edition; Agentforce + Data Cloud enabled). *This org hosts other apps too — we sync **only this app's** metadata.*
> **Metadata namespace:** everything custom is prefixed **`Stripe_`**.
> **Front-end:** **full React** (React 19 + Vite) — the public site, the `/invite` form, **and** the markdown-based learning site — all one app, hosted on **GitHub Pages** at **stripe.imswarnil.com**.
> **Scraping:** **n8n** (the hands). **Reasoning:** Salesforce AI — Prompt Builder + Agentforce (the brain).
> **Independent educational project — not affiliated with, endorsed by, or connected to Stripe.** This disclaimer appears on every hosted page.

Claude Code: I'm starting from an **empty folder**. Walk me through this **phase by phase**, teaching as you go. I want to do a lot **by hand in the Salesforce UI to learn**, then pull it into git. For each phase: **Learn → Do (manually first) → Automate → Document (screenshot + note) → Commit.** Never run paid calls (n8n crawl / external LLM) without a button + Demo Mode. Print "Concepts you now own" after each phase.

---

## Table of contents
1. What we're building (and the one mental model)
2. Tools to install (with commands)
3. Repo structure (git holds everything)
4. Phase 0 — Bootstrap: git + GitHub + Salesforce auth + SFDX project
5. Phase 1 — Object data model, record types, **page layouts & how they integrate**
6. Phase 2 — Security (permission sets, roles, queues)
7. Phase 3 — Prompt Builder (dossier + score)
8. Phase 4 — Flow + AI (research, route, remediate, provision)
9. Phase 5 — Agentforce (two agents)
10. Phase 6 — Data Cloud (grounding + health)
11. Phase 7 — n8n scraping (hands) + Demo Mode
12. Phase 8 — Full React app: homepage, `/invite`, portal, **learning site**
13. Phase 9 — CI/CD: sync sandbox ↔ GitHub, deploy Pages to stripe.imswarnil.com
14. The learning site (React + markdown, TOC + pagination)
15. The case study (resume-ready) + running log
16. Scoping: pull ONLY this app from the org
17. Command cheat-sheet (`sf` + `git`)
18. AI capability map · glossary · disclaimer

---

## 1. What we're building (and the one mental model)

A back office for an invite-only onboarding program: a person applies (mimicking Stripe India's real form) → an AI + web-crawler researches and scores them → a reviewer decides → approved businesses are onboarded/provisioned/supported → we track how the invited cohort performs (cancel vs upsell). You'll **learn Salesforce's AI stack** (Prompt Builder, Flow, Agentforce, Data Cloud) and **full React** by shipping it, and **document the whole journey** as a public learning site + a resume case study.

> **The mental model:** **Salesforce AI reasons over data it is *given*; it does not fetch the web.** n8n fetches (scrapes) → hands clean text to Salesforce → Prompt Builder / Agentforce reason and write results back. **Brain vs hands.**

---

## 2. Tools to install (you said you don't know what's needed — here's the full list)

Run these checks; install what's missing.

```bash
# 1. Node (for React) — need v20+
node -v            # if missing: install via nvm  →  nvm install 20 && nvm use 20
corepack enable    # enables pnpm
pnpm -v

# 2. Git + GitHub CLI
git --version
gh --version       # GitHub CLI — install from https://cli.github.com ; then: gh auth login

# 3. Salesforce CLI (the new `sf`)
npm install --global @salesforce/cli
sf --version
sf plugins install @salesforce/plugin-packaging  # optional

# 4. Docker (to self-host n8n free) — later, only for Phase 7
docker --version

# 5. VS Code extensions (install from the Extensions panel)
#    - Salesforce Extension Pack
#    - ESLint, Prettier
```

**Concepts you now own:** the toolchain split — `sf` (Salesforce), `node/pnpm` (React), `git/gh` (source + hosting), `docker` (n8n). Each owns one layer.

---

## 3. Repo structure (git holds everything — code, learning, case study, media)

```
Invite-Only-Onboarding-Portal/
├─ instruction.md                 ← this file
├─ README.md                      ← what it is + disclaimer + deploy steps
├─ LICENSE  .gitignore  .forceignore
├─ sfdx-project.json
├─ manifest/package.xml           ← scoped to Stripe_* ONLY (Section 16)
├─ force-app/main/default/        ← Salesforce metadata for THIS app only
│   ├─ objects/  recordTypes/  layouts/  flexipages/
│   ├─ flows/  approvalProcesses/  quickActions/
│   ├─ permissionsets/  roles/  queues/
│   ├─ lwc/  genAiPromptTemplates/  bots/
│   └─ applications/  tabs/  reports/  dashboards/
├─ web/                           ← FULL React app (Vite + React 19 + TS)
│   ├─ src/routes/  Home.tsx  Invite.tsx  Portal.tsx  Learn.tsx
│   ├─ src/learn/   LessonLayout.tsx  Toc.tsx  Pager.tsx
│   └─ vite.config.ts  index.html
├─ learning/                      ← markdown lessons (content) w/ frontmatter
│   ├─ 00-overview.md  01-object-model.md  02-prompt-builder.md …
├─ case-study/                    ← resume-ready writeup + running log
│   ├─ README.md   persona.md
│   └─ log/  2025-01-15-remediation-loop.md …
├─ docs/media/                    ← screenshots, gifs, demo videos
├─ integration/  n8n/  prompts/
├─ scripts/  seed-demo.mjs  retrieve-app.sh  deploy-app.sh
├─ .github/workflows/  salesforce.yml  pages.yml
└─ CNAME                          ← stripe.imswarnil.com
```

One React app serves the marketing homepage, `/invite`, the applicant portal, **and** `/learn` (your lessons). The Salesforce metadata and your learning notes live in the **same repo**, so one `git push` ships both your project and your documentation.

---

## 4. Phase 0 — Bootstrap (do this first, exact commands)

**Learn.** A Salesforce "SFDX project" is just a folder of metadata `sf` knows how to deploy/retrieve. Git tracks it; GitHub hosts it; Actions deploy it.

```bash
# in the empty folder:
git init && git branch -M main

# create the SFDX project structure in-place
sf project generate --name Invite-Only-Onboarding-Portal --default-package-dir force-app --manifest
# (if it creates a subfolder, move its contents up — you want force-app/ at repo root)

# authorize your org (opens browser). alias it.
sf org login web --alias iop-dev --set-default
sf org display --target-org iop-dev        # confirm connection

# scaffold the React app
pnpm create vite@latest web -- --template react-ts
cd web && pnpm install && cd ..

# create the GitHub repo and push
gh repo create Invite-Only-Onboarding-Portal --public --source=. --remote=origin
git add . && git commit -m "chore: bootstrap SFDX + React"
git push -u origin main
```

**Do manually (to learn):** open the org, poke around Setup → App Manager, Object Manager. You'll build the first objects **by hand** in Phase 1, then retrieve them.
**Commit cadence:** after every phase, `git add -A && git commit -m "phaseN: …" && git push`.
**Concepts you now own:** SFDX project, org auth/aliases, `gh repo create`, monorepo of metadata + app + docs.

---

## 5. Phase 1 — Object data model + record types + **page layouts (and how they integrate)**

**Learn.** In Salesforce, the **object** defines *what data exists*; **record types** define *variants of the same object* (here Company vs Individual); **page layouts** (and modern **Dynamic Forms** on the Lightning record page) define *what the user sees and edits*. They integrate like this: **record type → page-layout assignment → the fields/sections shown → the LWC widgets + related lists around them.** Change the record type, and the layout (and even which automation runs) changes.

### 5.1 Custom objects (all `Stripe_`)
- **`Stripe_Invite_Request__c`** — the application. Record Types **`Company`**, **`Individual`**.
- **`Stripe_Crawler_Finding__c`** — child (Master-Detail → Invite Request): `Stripe_Title__c`, `Stripe_Detail__c`, `Stripe_Severity__c` (Info/Low/Medium/High), `Stripe_Fixable__c` (Checkbox), `Stripe_Status__c` (Open/Flagged/Resolved).
- **`Stripe_Provisioned_Account__c`** — child (Lookup → Account): `Stripe_External_Acct_Id__c`, `Stripe_Inlet_Id__c` (Auto Number `iop_acct_{0000}`), `Stripe_Publishable_Key__c`, `Stripe_Secret_Key_Masked__c`, `Stripe_Status__c` (Active/Paused/Cancelled), `Stripe_Products_Live__c` (Multi-select).
- **`Stripe_Usage_Snapshot__c`** — child (Lookup → Provisioned Account): `Stripe_Month__c`, `Stripe_Volume_INR__c`, `Stripe_Txn_Count__c`, `Stripe_Dispute_Rate__c`, `Stripe_Stripe_Revenue_INR__c`.

Reuse standard **Account / Contact / Opportunity / Case / User**.

### 5.2 Fields on `Stripe_Invite_Request__c`
Form fields: `Stripe_Applicant_Type__c` (Company/Individual → sets RecordType), `Stripe_Work_Email__c`, `Stripe_Country__c` (default India), `Stripe_Annual_Revenue_Band__c` (six INR bands), `Stripe_First_Name__c`, `Stripe_Last_Name__c`, `Stripe_Phone__c`, `Stripe_Phone_Verified__c`, `Stripe_Company_Website__c`, `Stripe_Job_Level__c`, `Stripe_Job_Function__c`, `Stripe_Has_Overseas_Entity__c`, `Stripe_Seeking_Overseas_Expansion__c`, `Stripe_Sells__c` (Services/Goods/Both), `Stripe_Notes__c`, `Stripe_Marketing_Consent__c`.
Research fields: `Stripe_Registered_Entity_Type__c` (Sole Prop/LLP/Pvt Ltd/None), `Stripe_Has_IEC__c`, `Stripe_MCA_CIN__c`, `Stripe_Blog_Count__c`, `Stripe_Content_Depth__c`.
AI-written: `Stripe_Dossier__c` (Rich Text), `Stripe_Fit_Score__c` (0–100), `Stripe_Score_Rationale__c`, `Stripe_Legitimacy_Verdict__c`, `Stripe_Expansion_Signal__c`, `Stripe_Persona__c`.
Workflow: `Stripe_Stage__c` (Received→AI Validation→Action Needed→In Review→Approved→Onboarding→Activated→Won; off-ramps Waitlisted/Rejected), `Stripe_Decision__c`, `Stripe_Converted_Account__c` (Lookup Account).

### 5.3 Page layouts & the Lightning record page — the integration
- **Two page layouts:** `Stripe_Invite_Request_Company` and `Stripe_Invite_Request_Individual`, **assigned by record type**. Company shows entity/IEC/website fields; Individual shows a "why individuals aren't eligible → register an entity" info section and hides company-only fields.
- **One Lightning record page (FlexiPage)** with **Dynamic Forms** so you place *fields*, not just the whole layout, and add **visibility rules**: e.g., provisioning fields visible only when `Stripe_Stage__c = Approved`; IEC fields visible only when `Stripe_Sells__c` includes Goods.
- **Path** component bound to `Stripe_Stage__c` (guided stages).
- **Sidebar (LWC widgets):** `Stripe_scoreGauge` (donut of Fit Score), `Stripe_findingsList` (crawler findings + "Flag to applicant" quick action). Add the **Agentforce** panel (Phase 5).
- **Related lists:** Crawler Findings, (post-convert) Opportunities, Cases, Provisioned Account.
- **Quick actions** on the page: *Run Research*, *Send Fix Request*, *Approve & Provision*, *Create Upsell*, *Assign TSE*.

**Do manually (to learn):** build ONE object + a few fields + both record types + the two layouts **in the org UI**, create one specimen record, then pull it into git:
```bash
sf project retrieve start --metadata "CustomObject:Stripe_Invite_Request__c" --target-org iop-dev
git add -A && git commit -m "phase1: invite request object + record types + layouts" && git push
```
**Concepts you now own:** object vs record type vs layout vs Dynamic Form; layout-by-record-type assignment; how the record page composes fields + LWCs + related lists; retrieving a single object.

---

## 6. Phase 2 — Security
Permission sets over profiles: `Stripe_Reviewer_PS`, `Stripe_CSM_PS`, `Stripe_TSE_PS`, `Stripe_Admin_PS`. Role hierarchy Director → Reviewer/CSM/TSE. Queue `Stripe_Review_Queue`. OWD **Private** on the request; open upward via hierarchy. Build in UI, then `sf project retrieve start -x manifest/package.xml`.
**Concepts you now own:** permission sets, role hierarchy = record visibility, OWD, queues.

---

## 7. Phase 3 — Prompt Builder (dossier + score)
Create Flex prompt template **`Stripe_Dossier_And_Score`** that takes the record + a `CrawlSummary` input and returns strict JSON (dossier, fit_score, criteria[], legitimacy, expansion_signal, persona, content_depth, findings[]). Weight **international-expansion 35**, legitimacy 25, revenue 15, content 10, contact 5, risk 10. **Rule:** Individual OR no registered entity → cap score ≤ 35 + finding "register an entity / form a US LLC via Stripe Atlas." Keep the prompt text in `integration/prompts/dossier_and_score.md`. Iterate in Prompt Builder's preview against your specimen.
**Concepts you now own:** prompt templates, merge fields, grounding, structured-JSON output.

---

## 8. Phase 4 — Flow + AI
Flows: **Intake** (record-trigger: stage=Received, set record type, queue — *no auto research*); **Run Research** (quick-action-invoked: call n8n → call the prompt template → parse JSON → write fields/findings → stage=AI Validation); **Route & Remediate** (record-trigger: fixable finding → Action Needed + fix email; score≥75 → In Review; <45 → Waitlisted); **Provision** (approval final action: create Account/Contact/Opportunity + Provisioned Account + mock keys + assign CSM/TSE; stage=Onboarding). Approval Process wraps the decision.
**Concepts you now own:** invoking prompts from Flow, JSON parsing, record-triggered vs invocable, approval processes, on-demand AI.

---

## 9. Phase 5 — Agentforce
**`Stripe_Invite_Concierge`** (internal): topics Assess/Explain, Communicate, Decide; actions map to the Flows/prompts above; instruction "recommend, don't auto-decide; always show rationale; never invent facts." **`Stripe_Applicant_Assistant`** (external, on `/invite`/portal): status, what-to-fix, eligibility — grounded on the applicant's record. Level up: give the agent a "crawl" action that calls n8n.
**Concepts you now own:** topics, actions, instructions, agent-as-tool-caller, employee vs service agents.

---

## 10. Phase 6 — Data Cloud
Ground agents/prompts on a **Data Library** of past decisions. Health engine: stream `Stripe_Usage_Snapshot__c` → **Calculated Insights** (3-mo trend) → **Segments** At-Risk / Upsell-Ready → trigger cancellation-review task or Upsell Opportunity.
**Concepts you now own:** unification, RAG grounding, insights, segments-as-triggers.

---

## 11. Phase 7 — n8n scraping (hands) + Demo Mode
Self-host n8n (`docker run -p 5678:5678 n8nio/n8n`). Workflow `stripe_invite_research`: webhook `{requestId, website}` → Firecrawl scrape (blog count/depth, USD pricing, address, policy pages, tech stack) → MX/registry checks → compress to one `CrawlSummary` → return to Salesforce. **Secrets in Named/External Credentials + n8n vault, never git.** **Demo Mode:** `Stripe_Demo_Mode__c` short-circuits to ~12 seeded sample records (`scripts/seed-demo.mjs`) so the whole app demos with zero live calls — build this *before* wiring live crawling.
**Concepts you now own:** external orchestration, crawl→summarize→ground, secrets management, demo-mode to protect credits.

---

## 12. Phase 8 — Full React app (homepage, `/invite`, portal, learning)

**Full React, honestly scoped.** React 19 + Vite is your **public** layer: marketing homepage, the Stripe-styled `/invite` form, the applicant portal, and the `/learn` learning site. **It integrates with Salesforce over the wire, not by rendering Salesforce pages:** the form POSTs to n8n (or Web-to-Lead) which creates `Stripe_Invite_Request__c`; the portal reads limited status via a small proxy/Connect endpoint. **The reviewer UI stays native Salesforce** (the page layouts + Dynamic Forms + LWC widgets + Agentforce from Phases 1/5) — you *can't* make the in-org reviewer screen "full React"; that layer is LWC. So: **React owns everything the customer/learner touches; Salesforce's own UI owns the reviewer.** If you ever want a bespoke React reviewer console, it would call Salesforce REST — but you'd lose native approvals/Agentforce, so keep the reviewer native.

Routes (one app):
- `/` homepage — project story, SLDS-ish neutral theme, indexed.
- `/invite` — multi-step form mirroring the real Stripe India fields, Stripe-styled (`#635BFF`, `#0A2540`, `#F6F9FC`), **noindex** (mimics Stripe's look). Footer disclaimer.
- `/portal` — status lookup + embedded `Stripe_Applicant_Assistant`.
- `/learn` — the markdown learning site (Section 14).

**Vibe-coding recipe** (hand to Claude Code): Vite + React 19 + TS, plain CSS tokens, `react-router`, a single `useReducer` for the form, `<StepEmail/> <StepRevenue/> <StepContact/> <StepReview/>`, submit → `POST VITE_INTAKE_WEBHOOK`, disclaimer footer everywhere. Small typed components; review every diff.
**Concepts you now own:** the React↔Salesforce integration boundary (API in, native UI for reviewer), env-based config, dual theming.

---

## 13. Phase 9 — CI/CD: sync sandbox ↔ GitHub + deploy Pages

**Learn.** Two pipelines: one deploys **Salesforce metadata** to your org on changes under `force-app/`; one builds the **React app** and publishes to **GitHub Pages** (→ stripe.imswarnil.com). Auth to Salesforce in CI uses a stored **SFDX auth URL** secret (never a password).

**Get the auth URL and store it as a GitHub secret:**
```bash
sf org display --target-org iop-dev --verbose --json   # copy "sfdxAuthUrl"
gh secret set SFDX_AUTH_URL --body "force://PASTE_THE_URL"
```

`.github/workflows/salesforce.yml` (sketch):
```yaml
name: Deploy Salesforce
on:
  push: { branches: [main], paths: ['force-app/**','manifest/**'] }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm i -g @salesforce/cli
      - run: echo "${{ secrets.SFDX_AUTH_URL }}" > auth.txt
      - run: sf org login sfdx-url --sfdx-url-file auth.txt --alias ci --set-default
      - run: sf project deploy start --source-dir force-app --test-level RunLocalTests
```

`.github/workflows/pages.yml` (sketch): build `web/` and deploy `web/dist` with `actions/deploy-pages`. Add the `CNAME` file (`stripe.imswarnil.com`) and enable Pages + custom domain + HTTPS in repo settings. Point your DNS `CNAME` to `<user>.github.io`.

**Indexing:** `robots.txt` + per-page `<meta robots>` — index `/` and `/learn` (so people can find the learning), **noindex `/invite`** (Stripe-styled). Disclaimer everywhere.
**Concepts you now own:** headless CI auth (auth URL secret), path-filtered workflows, `deploy-pages`, custom domain + DNS.

---

## 14. The learning site (React + markdown, TOC + pagination)

Your lessons live as markdown in `learning/*.md` with frontmatter:
```md
---
section: "AI Foundations"
order: 3
title: "Prompt Builder: dossier + score"
---
# Prompt Builder
What I set out to do … what broke … how I fixed it … screenshot: ![](../docs/media/prompt-preview.png)
```
The React `/learn` route:
- **imports all lessons** with Vite: `const files = import.meta.glob('/learning/*.md', { as: 'raw', eager: true })`, parses frontmatter (gray-matter), sorts by `section` + `order`.
- **renders markdown** with `react-markdown` (+ `remark-gfm`, syntax highlighting).
- **TOC (sidebar):** grouped by `section`, generated from frontmatter — clickable.
- **Pagination:** prev/next buttons computed from the sorted order (`<Pager/>`).
- **In-page TOC:** headings → anchor list on the right.
- **Media:** screenshots/gifs/videos from `docs/media/` embedded in the markdown.

So writing a lesson = drop a `.md` file + a screenshot, commit, and it appears on the site with TOC + prev/next automatically. **Your documentation is code.**
**Concepts you now own:** markdown-driven content in React, `import.meta.glob`, frontmatter-driven TOC/pagination, docs-as-code.

---

## 15. The case study (resume-ready) + running log

`case-study/README.md` — a polished writeup you can link on your resume/LinkedIn:
- **Persona** (`persona.md`): who this serves — e.g., *"Ravi, a GTM reviewer at a payments company, drowning in unqualified invite requests."* Plus the applicant persona.
- **Problem → Approach → Architecture (diagram) → What I built → Screenshots/Demo → Results → What I learned → Skills demonstrated** (Salesforce AI: Prompt Builder, Agentforce, Data Cloud; Flow; LWC; React; n8n; CI/CD).
- **Running log** (`case-study/log/`): dated entries, one per problem solved (e.g., `2025-01-15-remediation-loop.md`) — the problem, options considered, what you chose, the fix, a screenshot. This is the folder you *keep adding to*; it becomes both your learning trail and the evidence for the case study.

**Why separate:** the `/learn` site teaches *how*; the case study sells *what you accomplished*. Same repo, two audiences (learners vs recruiters).
**Concepts you now own:** framing engineering work as a portfolio artifact; persona-driven storytelling; a decision log.

---

## 16. Scoping — pull ONLY this app from the org (it has other apps)

Your org has other POCs; don't drag them into this repo. Two guards:

**A. A scoped manifest** — `manifest/package.xml` lists only *our* components by name (no `<members>*</members>` for shared types like Profile). Retrieve with it:
```bash
sf project retrieve start --manifest manifest/package.xml --target-org iop-dev
```
Example (trimmed):
```xml
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types><members>Stripe_Invite_Request__c</members>
         <members>Stripe_Crawler_Finding__c</members>
         <members>Stripe_Provisioned_Account__c</members>
         <members>Stripe_Usage_Snapshot__c</members><name>CustomObject</name></types>
  <types><members>Stripe_Reviewer_PS</members><members>Stripe_Admin_PS</members><name>PermissionSet</name></types>
  <types><members>Stripe_Invite_Only_Portal</members><name>CustomApplication</name></types>
  <version>62.0</version>
</Package>
```

**B. `.forceignore`** — belt-and-suspenders so a stray retrieve can't capture other apps or org-wide files:
```
**/profiles/**
# ignore anything not prefixed Stripe_ inside these dirs (be explicit as you grow)
```
**Reflex:** in a shared org, **retrieve by explicit manifest**, never "grab everything." Wildcards pull the whole org.
**Concepts you now own:** manifest-scoped retrieve, `.forceignore`, keeping a shared org clean in git.

---

## 17. Command cheat-sheet

```bash
# --- Salesforce (sf) ---
sf org login web --alias iop-dev --set-default        # connect org
sf org display --target-org iop-dev --verbose --json  # get auth URL for CI
sf project retrieve start -x manifest/package.xml      # pull ONLY our app
sf project retrieve start -m "CustomObject:Stripe_Invite_Request__c"
sf project deploy start --source-dir force-app         # push metadata
sf project deploy validate --source-dir force-app      # dry-run
sf apex run --file scripts/seed.apex                   # seed demo data
sf org open                                            # open the org

# --- Git / GitHub ---
git add -A && git commit -m "phaseN: …" && git push
gh repo create Invite-Only-Onboarding-Portal --public --source=. --remote=origin
gh secret set SFDX_AUTH_URL --body "force://…"         # CI auth secret
gh run watch                                           # watch the Action

# --- React ---
cd web && pnpm install && pnpm dev                     # local dev
pnpm build                                             # → web/dist (Pages)
```

---

## 18. AI capability map · glossary · disclaimer

**Capability map:** turn record data → text/JSON = **Prompt Builder**; do it on an event with branching = **Flow**; converse/act = **Agentforce**; ground on unified/large data = **Data Cloud**; crawl the web = **n8n**; public UI = **React**; in-org UI = **LWC**.

**Glossary:** *Prompt Template* (reusable grounded prompt) · *Flex template* (callable from Flow/Apex/Agent) · *Grounding* (feeding real data to the model) · *Agent* = topics + actions + instructions · *Atlas* (agent reasoning) · *Calculated Insight/Segment* (Data Cloud analytics + triggers) · *LWC* (native in-org UI) · *Named/External Credential* (secret storage) · *SFDX auth URL* (headless CI login) · *Dynamic Forms* (field-level record-page logic).

**Rules of the road (repeat to Claude Code):** phase by phase; **do it manually in the org first, then retrieve**; teach each phase (Learn → Build → Try → Level up → Reflex + "Concepts you now own"). Native-first: Prompt Builder + Agentforce + Data Cloud think; **n8n only fetches**. Paid calls behind buttons + **Demo Mode**. Prefix everything **`Stripe_`**. Retrieve by scoped manifest only. Secrets in credentials/GitHub Secrets, never git. React for public + learning; LWC for the reviewer. Document every phase (screenshot + log entry) and commit. Optimize for **me getting smarter**, not just a working org.

*Independent educational project. Not affiliated with, endorsed by, or connected to Stripe. Uses public information about Stripe India's invite-only program to make the scenario realistic. Hosted at stripe.imswarnil.com for learning; `/invite` is a styled demo, not Stripe's real form.*