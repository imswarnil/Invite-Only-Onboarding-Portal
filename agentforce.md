# agentforce.md — Prompt Builder & Agentforce, concepts and how to build them

> Companion to [`instruction.md`](./instruction.md) §7 (Phase 3 — Prompt Builder) and §9 (Phase 5
> — Agentforce). Scoped to one question: **what are these two things, and how do you actually
> build them for this project?**

**Why this is a separate, hand-built-only doc:** everything else in this repo — objects, fields,
Flows, Apex, LWC — got built by generating metadata and deploying it with `sf project deploy
start`, iterating on real deploy errors until it worked. Prompt Builder templates and Agentforce
agents use some of Salesforce's newest metadata types (`GenAiPromptTemplate`, `Bot`/`BotVersion`,
`GenAiPlannerBundle`, `GenAiPlugin`), and unlike Layout/Flow/PermissionSet — which have years of
public examples to check XML against — these are new enough that a wrong guess is more likely to
silently misconfigure something than to fail loudly at deploy time. So this phase is **Setup UI
only**, same as Page Layout Assignment and Experience Builder page composition were. Once you've
built one by hand and (optionally) retrieved the resulting metadata, _that_ becomes a real
reference worth automating from.

---

## 1. The concept: reasons over data it's _given_

Every AI feature in this project sits on the same foundation: **grounding**. The model doesn't
know anything about your business until you hand it real data — a record's fields, a related
list, a block of text from n8n's crawl. Salesforce's AI stack is a ladder of _how much control you
have over that reasoning_:

| Layer                     | What it does                                                                                 | Analogy                                              |
| ------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Prompt Template**       | One grounded prompt, called explicitly (from a button, Flow, or Apex)                        | A function call                                      |
| **Flow calling a prompt** | The same prompt, wired into branching logic and automation                                   | A function call inside a script                      |
| **Agentforce agent**      | A conversational loop: it _decides_ which action/prompt to call, based on what the user says | A small program that chooses which function to call  |
| **Data Cloud grounding**  | Any of the above, but reasoning over _unified, large-scale_ data instead of one record       | Swapping a hardcoded value for a live database query |

This project uses the first three. Data Cloud (Phase 6) grounds all of them on a **Data Library**
of past decisions later.

---

## 2. Prompt Builder: `Dossier_And_Score`

**What it is:** a _Flex_ prompt template — reusable, callable from Flow, Agentforce, or Apex (not
just a one-off you preview and forget). It takes the `Invite_Request__c` record plus a
`CrawlSummary` text input, and returns strict JSON: the dossier, a 0–100 fit score, per-criterion
scoring, a legitimacy verdict, an expansion signal, a persona label, and a findings list.

**The scoring rule to encode in the prompt text:** international-expansion signal weighted 35,
legitimacy 25, revenue band 15, content depth 10, contact completeness 5, risk 10. **Individual**
applicants, or **Company** applicants with no registered entity, get capped at ≤35 with a finding
"register an entity / form a US LLC via Stripe Atlas" — this is a business rule, not something the
model infers, so it belongs in the prompt text itself, not left to the model's judgment.

### Build it by hand

1. Setup → quick find **Prompt Builder** → **New Prompt Template** → choose **Flex** (not
   "Field Generation" or "Record Summary" — those are narrower, single-purpose templates; Flex is
   the one that's callable from Flow/Agentforce).
2. Name it `Dossier_And_Score`.
3. Add a **Record** input for `Invite_Request__c` — this is how you reference
   `{!Input:Record.Applicant_Type__c}` etc. in the prompt text.
4. Add a plain **Text** input named `CrawlSummary` — this is where n8n's scraped/compressed text
   gets passed in when the real integration exists.
5. Write the prompt body. Keep the actual wording in
   [`integration/prompts/dossier_and_score.md`](./integration/prompts/dossier_and_score.md) too
   (create that file) so the prompt text is versioned in git, not just living inside the org —
   copy-paste between the two when you iterate.
6. Instruct the model to return **strict JSON** matching the field names you'll parse back out:
   `dossier`, `fit_score`, `criteria[]`, `legitimacy`, `expansion_signal`, `persona`,
   `content_depth`, `findings[]`.
7. Use the **Preview** panel against your seeded specimen records (`scripts/apex/seed-demo.apex`
   already gives you Company and Individual examples, including ones with different revenue
   bands) — iterate the prompt text until the JSON shape is consistently right before wiring it
   into anything.
8. **Activate** the template once you're happy with it.

### Wire it into the pipeline

Phase 4's `Run Research` Flow (quick-action-invoked, not yet built) calls this template with the
real record + n8n's `CrawlSummary`, parses the returned JSON, and writes `Dossier__c`,
`Fit_Score__c`, `Score_Rationale__c`, `Legitimacy_Verdict__c`, `Expansion_Signal__c`, `Persona__c`,
and creates `Crawler_Finding__c` records from `findings[]`. Once `Fit_Score__c` changes, the
already-built `Score_Routes_Stage` Flow (see [`README.md`](./README.md#automation)) takes over
routing automatically — that Flow was built _ahead of_ this one specifically so the routing logic
would already exist and be testable the moment scoring goes live.

**Concepts you now own:** Flex vs. single-purpose prompt templates, merge fields (`{!Input:...}`),
grounding a prompt on a specific record, structured-JSON output as a contract between the model
and your automation.

---

## 3. Agentforce: two agents

**What an agent actually is:** `topics` (what it can talk about) + `actions` (what it can _do_ —
usually a Flow or prompt template, wrapped so the agent can invoke it) + `instructions` (the rules
governing its behavior). The agent's own reasoning ("Atlas") decides which topic/action fits what
the user just said — you don't write an if/else tree, you describe the boundaries and let it plan.

### `Invite_Concierge` — internal, employee-facing

Topics: **Assess/Explain** (summarize an applicant's dossier and score for a reviewer who asks),
**Communicate** (draft a fix-request email), **Decide** (surface a recommendation). Actions map to
the Flows/prompts already built — `Score_Routes_Stage`'s logic, `Provision_On_Approval`, and once
it exists, `Dossier_And_Score`.

**The one instruction that matters most:** _recommend, don't auto-decide; always show rationale;
never invent facts._ This is a direct extension of why `Decision__c` is a field the reviewer sets
via the Decision Bar LWC, not something the agent sets on its own — the agent can _suggest_
Approve/Waitlist/Reject with reasoning, but the click is still a human's.

### `Applicant_Assistant` — external, applicant-facing

Lives on the Experience Cloud site (same site as the apply Flow). Topics: application status,
what's missing before approval, eligibility questions — all grounded on _that specific applicant's_
record via the running user's context, never on other applicants' data.

### Build one by hand

1. Setup → quick find **Agents** → **New Agent** (or **Agentforce** if your org labels it that
   way) → choose **Employee** (for `Invite_Concierge`) or the external/service type (for
   `Applicant_Assistant`).
2. Give it a name, description, and its **instructions** (the "recommend, don't decide" text
   above, for the internal one).
3. Add **topics** — each topic gets its own scoped instructions and a list of **actions** it can
   call. An action is usually "Call a Flow" or "Call a Prompt Template" — point it at
   `Provision_On_Approval` or `Dossier_And_Score` once that exists.
4. Use the **Preview** panel (chat interface) to test utterances before activating — this is the
   same preview-then-activate rhythm as Prompt Builder.
5. For `Invite_Concierge`: add it to the Invite Request record page as a utility item or a panel
   component (the org already has a Utility Bar — `Inlet_Invite_Only_Portal_UtilityBar` — that's
   a natural place to surface it).
6. For `Applicant_Assistant`: embed it on the Experience Cloud site the same way you'd embed any
   other component in Experience Builder — drag it onto the `/invite` or portal page.

**Level up:** give `Invite_Concierge` a "crawl" action that calls n8n directly, so a reviewer can
ask the agent to re-research an applicant conversationally instead of clicking a quick action.

**Concepts you now own:** topics/actions/instructions as the three levers of agent design,
agent-as-tool-caller (it invokes your existing Flows/prompts, it doesn't replace them),
employee vs. service agent, why "recommend, don't decide" is enforced structurally (a human clicks
Decision Bar) rather than just requested in the instructions.

---

## 4. Glossary

- **Prompt Template** — a reusable, grounded prompt. **Flex** = callable from Flow/Apex/Agent, not
  just a UI preview.
- **Grounding** — feeding the model real data (a record, a related list, free text) instead of
  relying on what it already "knows."
- **Agent** = topics + actions + instructions. **Atlas** is Salesforce's name for the reasoning
  layer that decides which topic/action fits a given utterance.
- **Data Library / Calculated Insight / Segment** — Data Cloud concepts for Phase 6: unifying data
  across objects, deriving trend metrics, and turning a segment membership change into a trigger
  (e.g., "At-Risk" segment → cancellation-review task).

_Independent educational project. Not affiliated with, endorsed by, or connected to Stripe._
