import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getRecentInvites from "@salesforce/apex/InviteHomeController.getRecentInvites";

export default class RecentInvitesList extends NavigationMixin(
  LightningElement
) {
  errorMessage;
  invites = [];

  @wire(getRecentInvites, { maxResults: 10 })
  wiredInvites({ data, error }) {
    if (data) {
      this.invites = data;
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load recent invite requests.";
    }
  }

  get rows() {
    return this.invites.map((r) => ({
      id: r.Id,
      name: r.Name,
      applicant: `${r.First_Name__c ?? ""} ${r.Last_Name__c ?? ""}`.trim(),
      email: r.Work_Email__c,
      type: r.Applicant_Type__c,
      stage: r.Stage__c,
      score: r.Fit_Score__c ?? "—",
      stageClass: `slds-badge ${this.stageBadgeClass(r.Stage__c)}`
    }));
  }

  stageBadgeClass(stage) {
    const success = ["Won", "Activated", "Approved", "Onboarding"];
    const warning = ["Action Needed", "Waitlisted"];
    const error = ["Rejected"];
    if (success.includes(stage)) return "slds-theme_success";
    if (warning.includes(stage)) return "slds-theme_warning";
    if (error.includes(stage)) return "slds-theme_error";
    return "";
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
