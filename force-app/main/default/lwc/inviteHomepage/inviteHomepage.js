import { LightningElement, wire } from "lwc";
import getOverviewStats from "@salesforce/apex/InviteHomeController.getOverviewStats";

export default class InviteHomepage extends LightningElement {
  totalRequests = "—";
  averageFitScore = "—";

  @wire(getOverviewStats)
  wiredStats({ data }) {
    if (data) {
      this.totalRequests = data.totalRequests;
      this.averageFitScore =
        data.averageFitScore === null ? "Not yet scored" : data.averageFitScore;
    }
  }
}
