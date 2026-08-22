---
order: 9
title: "CI/CD"
area: "Foundation"
status: in-progress
summary: "The Jekyll site auto-deploys on every push; the Salesforce org side is still a manual deploy."
---

`.github/workflows/pages.yml` builds and publishes this Jekyll site to GitHub Pages on every push to `main` — no manual build step for the public site anymore.

The Salesforce metadata side (`force-app/`) still deploys by hand (`sf project deploy start --source-dir force-app`) against the dev org. A pipeline that syncs a sandbox/scratch org with GitHub on every push is planned but not built.
