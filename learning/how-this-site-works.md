---
section: "Front-End & Branding"
order: 4
title: "How this learning site works"
summary: "How a folder of markdown files becomes a routed, sidebar-navigable, paginated site with no JavaScript framework involved."
---

# How this learning site works

You're reading this lesson on a plain Jekyll static site — no React, no client-side bundler, no
markdown parser shipped to the browser. This page explains the actual pipeline that turns a
`.md` file into a routed, sidebar-navigable, paginated page, so the mechanism is as legible as the
content.

_(This lesson originally described a React + Vite + MDX prototype of this site. The public site
was rebuilt on Jekyll, so this lesson has been rewritten to match what's actually running today.)_

## The pipeline, end to end

```
_learning/how-this-site-works.md      ← you write this (frontmatter + markdown)
        │  Jekyll's build step sees a new file in the `learning` collection
_config.yml (collections.learning)  ← declares the collection + its permalink pattern
        │  produces, per file
a rendered HTML page + page.* data  ← frontmatter becomes Liquid variables, markdown becomes HTML
        │  collected by
site.learning                        ← one array, every lesson, no manual registry
        │  sorted + rendered by
_layouts/lesson.html                 ← sidebar (grouped by section) + content + pager
```

## Frontmatter becomes data, not text

Every lesson starts with a YAML block:

```yaml
---
section: "Front-End & Branding"
order: 4
title: "How this learning site works"
---
```

Jekyll strips that block out of the rendered page (so it never prints as literal text) and exposes
it as Liquid variables: `page.section`, `page.order`, `page.title` on the page itself, and
`lesson.section` / `lesson.order` / `lesson.title` when another page loops over `site.learning`.
That's the whole trick behind the sidebar and pagination: **building a table of contents is
sorting an array by a field**, not parsing markdown a second time.

## Finding every lesson without a manifest file

```liquid
{% raw %}{% assign lessons = site.learning | sort: "order" %}
{% assign sections = lessons | group_by: "section" %}{% endraw %}
```

`site.learning` is populated automatically because `_learning/` is a **collection** declared once
in `_config.yml`:

```yaml
collections:
  learning:
    output: true
    permalink: /learn/:name/
```

**Adding a lesson is: write the `.md` file with frontmatter, commit, push.** GitHub Pages rebuilds
the whole site on every push — no route to register, no sidebar entry to hand-add. That's the
entire point of frontmatter-driven navigation, in Jekyll exactly as much as it would be in any
other static-site generator.

## Sidebar + pagination, from one sorted list

- **Sidebar** = `site.learning` grouped by `section` (`group_by`), each group's lessons already
  sorted by `order`, rendered as plain `<a>` tags — a full page navigation, not a client-side
  router, since there's no JavaScript framework running.
- **Pagination** = the _same_ sorted flat list; "next" is `lessons[current_index + 1]`, "previous"
  is `lessons[current_index - 1]`. One sort, used twice — the sidebar and the pager can never
  disagree about ordering.

## Where a phosphor icon comes from

Each section heading and lesson thumbnail renders a small inline SVG via
`{% raw %}{% include icon.html name="..." %}{% endraw %}` — a self-hosted, MIT-licensed Phosphor
icon, inlined directly into the page rather than loaded from a CDN. No extra network request per
icon, no icon font, no flash of unstyled content while a font file loads.

**Concepts you now own:** Jekyll collections as "a folder becomes a route," frontmatter as
queryable data (not prose), `sort` + `group_by` as the entire mechanism behind a table of
contents, and why a documentation-shaped site doesn't need a JavaScript framework to feel
navigable.
