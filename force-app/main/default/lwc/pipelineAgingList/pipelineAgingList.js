import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getAgingRequests from "@salesforce/apex/InviteHomeController.getAgingRequests";

export default class PipelineAgingList extends NavigationMixin(LightningElement) {
  requests = [];
  errorMessage;

  @wire(getAgingRequests, { maxResults: 5 })
  wiredAging({ data, error }) {
    if (data) {
      this.requests = data.map((r) => ({
        ...r,
        cssClass: r.daysInStage >= 5 ? "aging-row is-stale" : "aging-row"
      }));
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage = error?.body?.message ?? "Could not load aging requests.";
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
