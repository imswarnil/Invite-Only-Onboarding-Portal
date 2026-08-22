import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getUsageSummary from "@salesforce/apex/InviteHomeController.getUsageSummary";

export default class UsageSnapshotSummary extends NavigationMixin(
  LightningElement
) {
  @api recordId;
  snapshotCount = 0;
  totalVolumeInr = 0;
  totalRevenueInr = 0;
  sourceInviteRequestId;
  sourceInviteRequestName;
  errorMessage;

  @wire(getUsageSummary, { provisionedAccountId: "$recordId" })
  wiredSummary({ data, error }) {
    if (data) {
      this.snapshotCount = data.snapshotCount;
      this.totalVolumeInr = data.totalVolumeInr;
      this.totalRevenueInr = data.totalRevenueInr;
      this.sourceInviteRequestId = data.sourceInviteRequestId;
      this.sourceInviteRequestName = data.sourceInviteRequestName;
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage = error?.body?.message ?? "Could not load usage summary.";
    }
  }

  get hasSource() {
    return Boolean(this.sourceInviteRequestId);
  }

  handleSourceClick() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.sourceInviteRequestId,
        objectApiName: "Invite_Request__c",
        actionName: "view"
      }
    });
  }
}
