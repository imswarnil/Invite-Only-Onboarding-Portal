import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getMyOwnedInvites from "@salesforce/apex/InviteHomeController.getMyOwnedInvites";

export default class MyOwnedInvites extends NavigationMixin(LightningElement) {
  invites = [];
  errorMessage;

  @wire(getMyOwnedInvites)
  wiredInvites({ data, error }) {
    if (data) {
      this.invites = data;
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load your invite requests.";
    }
  }

  get hasInvites() {
    return this.invites.length > 0;
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
