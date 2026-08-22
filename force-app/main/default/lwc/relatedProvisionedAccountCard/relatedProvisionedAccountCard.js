import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getRelatedProvisionedAccount from "@salesforce/apex/InviteHomeController.getRelatedProvisionedAccount";

export default class RelatedProvisionedAccountCard extends NavigationMixin(
  LightningElement
) {
  @api recordId;
  errorMessage;
  account;

  @wire(getRelatedProvisionedAccount, { inviteRequestId: "$recordId" })
  wiredAccount({ data, error }) {
    if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load provisioned account.";
      this.account = undefined;
      return;
    }
    this.errorMessage = undefined;
    this.account = data
      ? {
          ...data,
          displayContractValue:
            data.contractValueInr == null
              ? "—"
              : `₹${Math.round(data.contractValueInr).toLocaleString("en-IN")}`
        }
      : undefined;
  }

  get hasAccount() {
    return Boolean(this.account);
  }

  handleClick() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.account.recordId,
        objectApiName: "Provisioned_Account__c",
        actionName: "view"
      }
    });
  }
}
