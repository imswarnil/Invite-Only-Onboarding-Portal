---
order: 4
icon: gear
title: "Process & UI"
description: "Actions, page layouts, and the layout-assignment wiring that decides what a user actually sees."
---

Two of the most confusing bugs in this build came from Salesforce's UI configuration layer, not
from any code. This section covers how a record's action bar is actually built, why a Quick
Action sometimes needs a field that doesn't exist yet, and the single most expensive lesson in
the whole project: layout assignment lives on the Profile, not the Layout.
