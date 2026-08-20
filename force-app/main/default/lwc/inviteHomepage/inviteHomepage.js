import { LightningElement, wire } from "lwc";
import getOverviewStats from "@salesforce/apex/InviteHomeController.getOverviewStats";
import getStageCounts from "@salesforce/apex/InviteHomeController.getStageCounts";
import getProvisionedAccountSummary from "@salesforce/apex/InviteHomeController.getProvisionedAccountSummary";

export default class InviteHomepage extends LightningElement {
  totalRequests = "—";
  averageFitScore = "—";
  provisionedTotal = "—";
  needsAttentionCount = "—";

  @wire(getOverviewStats)
  wiredStats({ data }) {
    if (data) {
      this.totalRequests = data.totalRequests;
      this.averageFitScore =
        data.averageFitScore === null ? "Not yet scored" : data.averageFitScore;
    }
  }

  @wire(getStageCounts)
  wiredStages({ data }) {
    if (data) {
      const needsAttention = data.filter(
        (s) => s.stage === "Action Needed" || s.stage === "Waitlisted"
      );
      this.needsAttentionCount = needsAttention.reduce(
        (sum, s) => sum + s.total,
        0
      );
    }
  }

  @wire(getProvisionedAccountSummary)
  wiredProvisioned({ data }) {
    if (data) {
      this.provisionedTotal =
        data.activeCount + data.pausedCount + data.cancelledCount;
    }
  }
}
