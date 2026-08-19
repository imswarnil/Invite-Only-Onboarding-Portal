# react.md — learning React as the foundation of this project

> Companion to [`instruction.md`](./instruction.md) (the full phase-by-phase plan) and
> [`learning/00-overview.md`](./learning/00-overview.md). This file is scoped to one question:
> **how does React work, and how does it work *here*, in a project where Salesforce is the
> backend brain?** The first working example is `web/src/App.tsx` — a homepage that says
> "Hello World — I'm learning React in Salesforce."

---

## 1. React in one mental model

React renders **UI as a function of state**. You don't write imperative steps ("create a div,
append it, update its text"); you describe **what the UI should look like for the current data**,
and React figures out the minimal DOM changes to get there.

Three ideas carry almost everything else:

- **Components** — a component is a JavaScript function that returns markup (JSX). `App` in
  `web/src/App.tsx` is one. Components compose: a homepage is a tree of small components
  (`Header`, `Hero`, `Footer`) nested inside a page component.
- **Props** — data passed *into* a component from its parent, read-only from the child's side.
  This is how a reusable `<Card title="..." />` gets different content in different places.
- **State** — data a component *owns* and can change over time (`useState`), which triggers
  React to re-render that component (and its children) when it changes. A form's current input
  value, a toggle, a loading flag — all state.

**JSX** (`<h1>Hello World</h1>` inside a `.tsx` file) is not HTML — it's syntax sugar that compiles
to `React.createElement(...)` calls. That's why a JSX expression must return **one** root element
(or a `<>fragment</>`, which `App.tsx` uses) and why you write `className` instead of `class`
(it's JavaScript under the hood, and `class` is a reserved word).

**The render cycle:** state changes → React re-runs the component function → it produces a new
tree of elements → React diffs that against the previous tree (the "virtual DOM") → it applies
only the minimal real-DOM updates. You almost never touch the DOM directly.

**Hooks** are functions starting with `use` that hook a plain function-component into React's
machinery: `useState` (local state), `useEffect` (run code after render / on data changes,
e.g. fetching), `useReducer` (state machine for something like a multi-step form — this is what
`instruction.md` §12 plans for the `/invite` form), `useContext` (share data down a tree without
prop-drilling). You'll meet these as soon as the homepage grows past static text.

---

## 2. How this project's React app actually runs (the foundation)

This repo's front end lives in `web/` and is a **Vite + React 19 + TypeScript** app — not
Create React App, not Next.js. Vite is the build tool: an instant dev server (native ES modules,
no bundling while you work) and a fast production bundler (Rollup under the hood).

### 2.1 The boot sequence

```
web/index.html          ← the one real HTML page; has <div id="root"></div>
        │  loads
web/src/main.tsx         ← entry point: finds #root, mounts <App /> into it
        │  renders
web/src/App.tsx          ← your component tree (currently: header, hello, footer)
        │  styled by
web/src/App.css          ← component-scoped-by-convention styles
web/src/index.css        ← global tokens (colors, fonts) + resets
```

`main.tsx` is short and rarely changes:

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`createRoot(...).render(<App />)` is the one line where React takes over a plain DOM node.
Everything after that — routing, state, fetches, sub-components — happens **inside** the React
tree, not by touching `index.html` again. `<StrictMode>` is a dev-only helper that intentionally
double-invokes some functions to surface side-effect bugs early; it's stripped in production.

### 2.2 Commands

```bash
cd web
pnpm install      # install once (React, Vite, TS, etc.)
pnpm dev          # dev server with hot reload — http://localhost:5173
pnpm build        # type-checks (tsc -b) then bundles to web/dist
pnpm preview       # serve the production build locally
pnpm lint         # oxlint
```

`pnpm dev` is what you'll run while learning: edit `App.tsx`, save, and the browser updates
without a full reload (Hot Module Replacement). `pnpm build` is what CI runs before publishing
`web/dist` to GitHub Pages (`.github/workflows/pages.yml`, per `instruction.md` §13).

### 2.3 Where this grows from here

Per `instruction.md` §12, the homepage you have now is route `/` of a bigger single-page app.
The next foundation piece is `react-router`, giving you `/`, `/invite`, `/portal`, `/learn` as
separate routes rendered by the same `App` shell — still one Vite build, one deploy.

---

## 3. How React integrates with Salesforce (the boundary that matters)

This is the one concept worth internalizing before you build more pages: **React does not render
Salesforce, and Salesforce does not render React.** They're two separate UI layers that talk to
each other **over the network**, never by one embedding the other's rendering engine.

```
┌─────────────────────────┐        HTTP (fetch/POST)        ┌───────────────────────────┐
│   React app (web/)      │ ───────────────────────────────▶ │  n8n / Salesforce API      │
│   GitHub Pages, public  │ ◀─────────────────────────────── │  (Invite_Request__c, etc.) │
└─────────────────────────┘        JSON responses            └───────────────────────────┘
        ▲
        │  people (applicants, learners)
        │
┌─────────────────────────┐
│  Salesforce native UI    │   record pages, page layouts, LWC widgets, Agentforce —
│  (LWC, not React)         │   this is what the *reviewer* uses inside the org
└─────────────────────────┘
```

- **The homepage you just built has zero Salesforce calls** — it's static content, which is
  exactly right for `/`. It only needs to *load fast and explain the project*.
- **The `/invite` form** (future work) will `POST` its data to n8n or a Web-to-Lead endpoint,
  which creates a real `Invite_Request__c` record. React never talks to Salesforce's UI APIs —
  it talks to a plain HTTP endpoint, same as it would talk to any backend.
- **The reviewer's screen stays native Salesforce (LWC)** — page layouts, Dynamic Forms,
  Agentforce panels. You cannot (and per this project's scope, should not) rebuild that in React;
  that's what Lightning Web Components exist for. **React owns everything the public/applicant
  touches; Salesforce's own UI owns the internal reviewer.**

This split is why the homepage didn't need any Salesforce SDK, auth, or API call to say "Hello
World" — it's pure front-end. The integration work only shows up once a page needs to *read or
write* Salesforce data.

---

## 4. Ways to build a homepage (and why this project picked one)

| Approach | How it works | Best for | Trade-off |
|---|---|---|---|
| **Plain HTML/CSS** | Hand-written static file(s), no build step | A single page that never changes | No components, no reuse, tedious past a few pages |
| **CSR SPA (this project)** — Vite + React | Browser downloads JS, React renders everything client-side | Apps with interactive state (forms, dashboards) that also want a marketing page in the same codebase | First paint waits on JS; SEO needs extra care (meta tags, prerendering) |
| **SSR** — Next.js, Remix | Server renders HTML per-request, then React "hydrates" it in the browser | Content that must be fast-indexed and personalized per request | Needs a Node server (not just static hosting) |
| **SSG** — Next.js `export`, Astro, Gatsby | Pages are pre-built to static HTML at build time | Marketing sites, blogs, docs — content known ahead of time | Rebuild needed when content changes (fine for most homepages) |
| **Salesforce-native** — Experience Cloud (LWR) | Salesforce hosts and renders the public site itself, using LWC | Keeping everything inside one platform, org-managed data grounding | Less design/dev flexibility than a hand-rolled React app; tied to Salesforce hosting |
| **Headless CMS + any front end** | Content lives in a CMS (Contentful, Sanity...); any renderer (React, static, etc.) pulls it | Marketing teams who edit copy without touching code | Overkill for a two-person learning project |

**Why this project uses CSR with Vite + React:** the homepage, `/invite`, `/portal`, and `/learn`
share one component library, one design language, and one deploy target (GitHub Pages), and none
of them need per-request personalization — a client-rendered SPA is the simplest thing that
covers all four. If SEO on `/` and `/learn` becomes a real concern later, the natural upgrade is
adding a prerender/SSG step for just those routes — not switching frameworks.

---

## 5. Real homepage practice — what production homepages actually do

Regardless of framework, homepages that work share a structure. Worth studying (open any SaaS
marketing site — Stripe, Linear, Vercel — and you'll see this pattern):

1. **Header/nav** — logo/brand + a handful of links, sticky or not. Never more than ~5-7 links.
2. **Hero** — one sentence that says *what this is and who it's for*, a sub-line with one more
   sentence of detail, and a single primary call-to-action button. This is the highest-value real
   estate on the whole site — most visitors decide to stay or leave here.
3. **Social proof / trust signals** — logos, stats, testimonials. (Skip for an internal/learning
   project — this is real for products selling to strangers.)
4. **Feature/benefit sections** — 3-4 short blocks, each: an icon, a short heading, one sentence.
   Not paragraphs — homepages are scanned, not read.
5. **"How it works"** — a short numbered flow, useful when the product's mechanism isn't obvious
   at a glance (this project's own "brain vs hands" mental model is exactly this kind of block).
6. **Secondary CTA** — repeat the main action once more near the bottom, for people who scrolled
   the whole page before deciding.
7. **Footer** — secondary links, legal/disclaimer text, contact/social. This project's footer
   *must* carry the Stripe-independence disclaimer per `instruction.md` — that's the same slot a
   real company would use for copyright/ToS/privacy links.

Practices that apply across all of the above:
- **Responsive by default** — design for mobile width first, then add complexity for wider
  screens (this repo's `App.css` already does this with `@media (max-width: 1024px)` blocks).
- **Accessibility** — semantic tags (`<header>`, `<main>`, `<footer>`, `<nav>`), real `<h1>`, `alt`
  text on meaningful images, visible focus states for keyboard users (see `.counter:focus-visible`
  in the original template for an example of the pattern, even though that button is gone now).
- **Performance** — a homepage is often the *first* thing a stranger loads; keep images
  optimized, avoid loading a whole component library for three lines of text, lazy-load anything
  below the fold.
- **SEO basics** — a real `<title>`, one `<h1>`, a meta description, and (per `instruction.md`
  §13) a `robots.txt` that indexes `/` and `/learn` but **not** `/invite`.
- **One clear voice** — don't mix "we" (company voice) and "I" (personal-project voice) on the
  same page; this project is a personal learning log wearing a company-homepage costume, so lean
  into that honestly (as the current Hello World copy does).

---

## 6. What to actually keep on *this* homepage

Distilled from Phase 8 (`instruction.md` §12) plus the practices above — a checklist for
`web/src/App.tsx` as it grows past "Hello World":

- [x] One clear headline + one-sentence subline (done: "Hello World" / "I'm learning React in
      Salesforce")
- [ ] A short paragraph on **what this project is** — the invite-only onboarding story, one or
      two sentences (see `learning/00-overview.md` for the source text to adapt)
- [ ] Links to the other routes once they exist: `/invite`, `/portal`, `/learn`
- [ ] The **Stripe-independence disclaimer** in the footer, on every page (already present)
- [ ] Nothing that calls Salesforce directly — the homepage stays static; only `/invite` and
      `/portal` talk to the backend
- [ ] Keep it skimmable: short lines, no walls of text, one primary action if/when there is one
      (right now there's nothing to "do" yet, which is fine for a learning-stage homepage)

**Concepts you now own:** components/props/state/hooks, JSX vs HTML, the render cycle, how
`main.tsx` boots `App.tsx` into `index.html`, the dev/build commands, the CSR-vs-SSR-vs-SSG-vs-
Salesforce-native landscape, why this project chose CSR, the React↔Salesforce integration
boundary (public React over the wire, native LWC for the reviewer), and the anatomy of a
production homepage.
