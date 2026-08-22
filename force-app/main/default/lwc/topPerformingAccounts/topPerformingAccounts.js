import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getTopPerformingAccounts from "@salesforce/apex/InviteHomeController.getTopPerformingAccounts";

export default class TopPerformingAccounts extends NavigationMixin(
  LightningElement
) {
  errorMessage;
  accounts = [];

  @wire(getTopPerformingAccounts, { maxResults: 5 })
  wiredAccounts({ data, error }) {
    if (data) {
      this.accounts = data.map((a, index) => ({
        ...a,
        rank: index + 1,
        displayVolume:
          a.totalVolumeInr == null
            ? "—"
            : `₹${Math.round(a.totalVolumeInr).toLocaleString("en-IN")}`
      }));
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load top performing accounts.";
    }
  }

  get hasAccounts() {
    return this.accounts.length > 0;
  }

  handleRowClick(event) {
    const recordId = event.currentTarget.dataset.id;
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId,
        objectApiName: "Provisioned_Account__c",
        actionName: "view"
      }
    });
  }
}
