---
section: "Foundations"
order: 1
title: "How this learning site works"
---

# How this learning site works

You're reading this lesson _inside the React app_ — same Vite build as the homepage, same
deploy, same domain. This page explains the pipeline that turns a plain `.md` file into a routed,
styled, sidebar-navigable page, so the mechanism is as legible as the content.

## The pipeline, end to end

```
learning/01-the-learning-site.md      ← you write this (frontmatter + markdown)
        │  Vite build sees the import
web/vite.config.ts                    ← @mdx-js/rollup compiles .md → a React component
        │  produces
{ default: Component, frontmatter }   ← the rendered page + its metadata, as one module
        │  collected by
import.meta.glob('.../learning/*.md') ← one call finds every lesson, no manual registry
        │  sorted + rendered by
web/src/routes/Learn.tsx              ← sidebar (grouped by section) + content + pager
```

**Why MDX instead of just "parse markdown at runtime":** a library like `react-markdown` parses
markdown _in the browser_, every page load. MDX instead **compiles markdown to a React component
at build time** — by the time this ships to GitHub Pages, this lesson is already a plain
JavaScript function, no markdown parser shipped to your visitors at all. The trade-off you're
accepting: content changes require a rebuild (`pnpm build`), not just a file edit — fine for a
docs site, wrong for user-generated content.

## Frontmatter becomes data, not text

Every lesson starts with a YAML block:

```md
---
section: "Foundations"
order: 1
title: "How this learning site works"
---
```

`remark-frontmatter` strips that block out of the rendered markdown (so it doesn't print as
literal text on the page); `remark-mdx-frontmatter` turns it into a named export instead:

```ts
import Lesson, { frontmatter } from "../../../learning/01-the-learning-site.md";
// frontmatter === { section: "Foundations", order: 1, title: "..." }
```

That's the whole trick behind the sidebar and pagination: **the frontmatter is just JavaScript
data once compiled**, so building a table of contents is sorting an array, not parsing markdown
a second time.

## Finding every lesson without a manifest file

```ts
const modules = import.meta.glob("../../../learning/*.md", { eager: true });
```

`import.meta.glob` is a **Vite-only** feature (not standard JS) — it's a build-time macro that
expands to a static list of imports for every file matching the pattern. `{ eager: true }` means
"import all of them immediately" (vs. lazy, one dynamic `import()` per file, better once the
lesson count gets large). The result is an object keyed by file path, each value the module
(`{ default, frontmatter }`) — from there, `Learn.tsx` just does `Object.values(modules)`, sorts
by `frontmatter.section` then `frontmatter.order`, and renders.

**Adding a lesson is: write the `.md` file, commit.** No route to register, no sidebar entry to
hand-add — that's the entire point of frontmatter-driven navigation.

## One thing that broke the first time: the file lives outside `web/`

`learning/` sits at the repo root, one level _above_ `web/` (this Vite project's actual root).
Vite's dev server refuses to serve files outside its project root by default — a deliberate
security guard so a dev server can't be tricked into leaking arbitrary files from your machine.
The fix is one explicit opt-in in `vite.config.ts`:

```ts
server: {
  fs: {
    allow: [".."];
  }
}
```

This only affects `pnpm dev` (the local dev server's file-serving path). `pnpm build` reads files
straight off disk via Node, no HTTP layer involved, so it was never affected — a good example of a
restriction that only exists at one specific layer of the toolchain, not "everywhere."

## Sidebar + pagination, conceptually

- **Sidebar** = `modules` grouped by `frontmatter.section`, each group's lessons sorted by
  `frontmatter.order`, rendered as `<Link>`s from `react-router-dom` (client-side navigation —
  clicking a lesson doesn't reload the page or refetch the JS bundle).
- **Pagination** = the _same_ sorted flat list; "next" is `sorted[currentIndex + 1]`, "prev" is
  `sorted[currentIndex - 1]`. No separate ordering system to keep in sync with the sidebar —
  there's exactly one sort, used twice.

**Concepts you now own:** compile-time vs. runtime markdown rendering, frontmatter as data (not
prose), `import.meta.glob` as a Vite-specific static-import macro, dev-server file-access
restrictions vs. build-time file access, and why one sorted list can drive two different UI
pieces (sidebar + pager) without duplicating logic.
