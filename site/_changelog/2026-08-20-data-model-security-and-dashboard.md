---
date: 2026-08-20
title: "Data model, security, and the first dashboard"
summary: "Core objects, role-based permission sets, stage-routing automation, and the first native LWC dashboard."
---

- `Invite_Request__c` + child objects, Company/Individual record types, page layouts, tabs, and the `Apply_For_Invite` screen flow.
- `Admin_PS`, then role-scoped `Reviewer_PS` / `CSM_PS` / `TSE_PS` permission sets — not copies of each other, genuinely different access per role.
- `Invite_Request__c` OWD set to Private, with narrow Guest User grants for public submission.
- Flow-based stage routing and account provisioning on approval; standard `Account` later removed from the flow entirely once it became clear this app's data didn't need to touch it.
- First 10 native LWC components and a full-width homepage, replacing an earlier React-in-LWC/iframe experiment.
- First cut of the `/learn` learning site (MDX pipeline, sidebar + pagination, GitHub Pages deploy).
