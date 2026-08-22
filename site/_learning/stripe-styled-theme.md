---
section: "Front-End & Branding"
order: 5
title: "Giving the build log a Stripe-styled home"
summary: "The Salesforce side needed a public face — building it as a static site with a Stripe-inspired token and type system."
---

# Giving the build log a Stripe-styled home

The Salesforce side of this project needed a public face — somewhere to publish these lessons and
point people applying for an invite. Rather than a bare GitHub README, it became this Jekyll site,
themed to look like a real product rather than default browser styles.

## Why "Stripe-styled," specifically

Stripe's own docs and marketing pages are a well-known, well-documented visual language: an
indigo accent (`#635BFF`), deep navy text instead of pure black, soft hairline borders instead of
drop shadows, and generous whitespace. Borrowing that language (not their code, not their content)
gave this project a credible look without spending real design time — the whole palette is nine
CSS custom properties in `:root`, referenced everywhere else.

## The first version was a single centered container everywhere

The original layout used one `.container` (max-width 1100px, centered) for literally every page,
including the navbar. It read as cramped once the navbar needed more items (Home, Learn, Teach,
Apply, About, a GitHub star button, a Hire Me CTA). The fix was splitting "chrome" from "content":
the navbar (`.nav-fluid`) now spans the full viewport width with fluid `clamp()` padding, while
page content keeps the constrained, readable `.container` width. Full-bleed frame, capped reading
column — that split is doing more work for the "feels like a real product" perception than any
individual color choice.

## Icons: self-hosted, not a CDN font

Early drafts used inline hand-drawn SVG dots for the sidebar. Swapping to a real icon set
(Phosphor, MIT-licensed) made the sidebar and navbar legible at a glance instead of decorative.
The icons are vendored directly into `_includes/icon.html` as inline `<path>` data rather than
loaded from a CDN — one Liquid include, zero extra network requests, and no icon-font flash while
a webfont loads.

## What's still intentionally plain

No CSS framework, no client-side JavaScript framework, no build step beyond Jekyll's own Sass
compiler. For a site that's fundamentally "documents with a sidebar," that's the right amount of
tooling — see the Teach lesson on Jekyll mechanics for the deeper mechanical breakdown.

**Concepts you now own:** design tokens as CSS custom properties, splitting fluid chrome from
constrained content width, and self-hosting an icon set instead of depending on a CDN.
