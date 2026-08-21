---
section: frontend-branding
order: 6
title: "How a Jekyll docs site actually works"
summary: "Collections, layouts, and Liquid: the whole mechanism behind this site's Learn and Teach sections."
---

# How a Jekyll docs site actually works

This site (the one you're reading right now) is a static Jekyll site, not a JavaScript
application. There's no React, no build-time bundler beyond Jekyll's own Sass compiler, and no
client-side markdown parser. This lesson explains the actual pipeline, since the mechanism is as
worth learning as the content it renders.

## Collections turn a folder of markdown into a routed site

A **collection** is a Jekyll concept: a folder prefixed with an underscore (`_learning/`,
`_teach/`) whose files become pages automatically. `_config.yml` declares each collection's
`permalink` pattern once:

```yaml
collections:
  teach:
    output: true
    permalink: /teach/lessons/:name/
```

Drop a new `.md` file into `_teach/`, commit, and it's a live page at that URL — no router to
register, no manifest file to hand-edit.

## Frontmatter is data, not text

Every lesson starts with a YAML block between `---` fences:

```yaml
---
section: process-ui
order: 5
title: "Action bars, quick actions, and the layout-assignment gotcha"
---
```

Jekyll strips that block from the rendered output and exposes it as `page.section`,
`page.order`, `page.title` inside the page's own layout, and as `lesson.section` etc. when looping
over `site.teach` from any other page. That's the entire trick behind a sidebar and pagination:
building a table of contents is **sorting an array by a field**, not parsing markdown a second
time.

## One sorted list can drive both the sidebar and the pager

```liquid
{% raw %}{% assign lessons = site.teach | sort: "order" %}{% endraw %}
```

That single sorted list is grouped by `section` for the sidebar, and walked linearly for
"previous / next" pagination — one sort, used twice, so the sidebar order and the pager order can
never drift out of sync with each other.

## Why Jekyll instead of a JS framework, here

A documentation-style site — mostly text, occasional code blocks, a stable page count — doesn't
need client-side routing or a virtual DOM. Jekyll produces plain HTML files at build time; the
browser never runs a markdown parser or a router. The trade-off: content changes need a rebuild
(handled automatically by GitHub Pages on every push), not a database write — the right trade for
docs, the wrong one for something like a live comment thread.

**Key takeaway:** collections + frontmatter + Liquid's `sort`/`group_by` are the entire mechanism
— no framework required for a site whose content is fundamentally "documents with metadata."
