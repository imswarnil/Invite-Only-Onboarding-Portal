---
order: 6
title: "Data Cloud"
area: "AI"
status: planned
summary: "Deliberately last on the list — the honest call at this project's current size is that Data Cloud doesn't earn its keep yet."
---

Data Cloud unifies data across many source systems or high-volume events. At this project's current scale — one Salesforce org, a handful of related objects — a well-modeled object graph already gives Prompt Builder and Agentforce everything they need through plain SOQL. The plan (documented, not built) is a health engine once there's real usage volume: stream `Usage_Snapshot__c` into Calculated Insights for trend detection, then At-Risk/Upsell-Ready Segments that trigger a cancellation-review task or an Upsell Opportunity automatically.

Listed here on purpose, not skipped: knowing _when a tool doesn't earn its keep yet_ is as much a real skill as building the tool.
