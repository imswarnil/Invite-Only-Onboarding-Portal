import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getReadyToProvision from "@salesforce/apex/InviteHomeController.getReadyToProvision";

export default class ReadyToProvisionList extends NavigationMixin(
  LightningElement
) {
  errorMessage;
  requests = [];

  @wire(getReadyToProvision, { maxResults: 5 })
  wiredRequests({ data, error }) {
    if (data) {
      this.requests = data.map((r) => ({
        ...r,
        verdictClass:
          r.legitimacyVerdict === "Verified"
            ? "verdict-icon is-verified"
            : "verdict-icon"
      }));
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load ready-to-provision requests.";
    }
  }

  get hasRequests() {
    return this.requests.length > 0;
  }

  handleRowClick(event) {
    const recordId = event.currentTarget.dataset.id;
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId,
        objectApiName: "Invite_Request__c",
        actionName: "view"
      }
    });
  }
}
