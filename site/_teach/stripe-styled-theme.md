---
section: frontend-branding
order: 7
title: "Building a Stripe-styled theme from scratch"
summary: "Design tokens, a type scale, and a handful of components — not a CSS framework."
---

# Building a Stripe-styled theme from scratch

"Stripe-styled" here means borrowing a well-known visual language — indigo accent, deep navy ink,
generous whitespace, soft borders instead of heavy shadows — to make a learning project look like
a real product instead of a wall of default browser styles. None of it is Stripe's code; it's a
small, hand-written set of tokens and components.

## Tokens first, everything else references them

The entire palette is nine CSS custom properties defined once, in `:root`:

```css
:root {
  --accent: #635bff; /* the signature indigo */
  --accent-dark: #4b45c6; /* hover state */
  --ink: #0a2540; /* headings, primary text */
  --ink-soft: #425466; /* body copy, secondary text */
  --surface: #f6f9fc; /* subtle backgrounds */
  --border: #e3e8ee; /* hairline borders */
}
```

Every component — buttons, cards, the navbar, code blocks — references these variables instead of
hard-coded hex values. Changing the whole site's mood is a six-line edit, not a find-and-replace
across dozens of files.

## A type scale, not "pick a font size each time"

Headings step down in fixed increments (hero `h1` ~2.6rem, section `h2` ~1.4rem, lesson body `h1`
2rem, `h2` 1.4rem) so every page feels part of the same system, and `line-height`/`color` are set
once on the container (`.lesson-content p`) rather than per-paragraph.

## Components over pages

Rather than styling each page individually, this theme defines a small vocabulary of reusable
pieces: `.btn` / `.btn-primary` / `.btn-secondary`, `.feature-card`, `.concept-tag`, `.pager-link`.
A new page composes these instead of inventing new CSS — the same discipline that keeps a real
design system from sprawling into hundreds of one-off classes.

## Fluid navbar vs. fixed-width content

The navbar (`.nav-fluid`) intentionally spans the full viewport width with fluid padding
(`clamp()`), while page _content_ (`.container`) stays capped around 1100px for readability. That
split — full-bleed chrome, constrained reading width — is the same pattern Stripe's own docs and
most modern SaaS marketing sites use: the frame fills the screen, the words don't stretch across
it.

## Docs get a third column

Compare `/learn/` (two columns: sidebar + content) with `/teach/` lesson pages (three columns:
sidebar + content + an auto-generated "on this page" list). The extra rail exists because longer,
structured lessons benefit from in-page navigation the way Stripe's own API docs do — it's built
with a small script that scans the rendered `h2`/`h3` elements at page load, not a Jekyll plugin.

**Key takeaway:** a theme is tokens + a type scale + a small component vocabulary, applied
consistently — not a framework, and not per-page custom CSS.
