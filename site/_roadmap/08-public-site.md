---
order: 8
title: "Public site (this Jekyll site)"
area: "Front end"
status: implemented
summary: "A Stripe-styled Jekyll site — homepage, a dated build-log collection, and this roadmap — rebuilt from an earlier React prototype."
---

The public site (`stripe.imswarnil.com`) is plain Jekyll: a project-overview homepage, the `/learn` collection (frontmatter-driven sidebar + pagination, no manifest file to hand-maintain), dark mode, a sitemap, and a self-hosted icon set with no CDN dependency. It was rebuilt from an earlier React + Vite + MDX prototype once a static-site generator turned out to be the better fit for a documentation-shaped site with no interactive app behind it.

The site briefly also carried a live `/invite` apply form that posted straight to the Salesforce org's Guest REST endpoint. That's been removed — public intake now runs solely through the Salesforce-native Experience Cloud Flow (see `doc.md`), and this site's job is to document and showcase the build, not operate a live intake channel.
