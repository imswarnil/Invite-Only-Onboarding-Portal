import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getAccountInviteSummary from "@salesforce/apex/InviteHomeController.getAccountInviteSummary";

export default class AccountInviteSummary extends NavigationMixin(
  LightningElement
) {
  @api recordId;
  provisionedAccountCount = 0;
  totalVolumeInr = 0;
  sourceInviteRequestId;
  sourceInviteRequestName;
  errorMessage;

  @wire(getAccountInviteSummary, { accountId: "$recordId" })
  wiredSummary({ data, error }) {
    if (data) {
      this.provisionedAccountCount = data.provisionedAccountCount;
      this.totalVolumeInr = data.totalVolumeInr;
      this.sourceInviteRequestId = data.sourceInviteRequestId;
      this.sourceInviteRequestName = data.sourceInviteRequestName;
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load invite summary.";
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
