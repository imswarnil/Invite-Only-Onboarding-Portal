import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { NavigationMixin } from "lightning/navigation";

const FIELDS = [
  "Invite_Request__c.Name",
  "Invite_Request__c.First_Name__c",
  "Invite_Request__c.Last_Name__c",
  "Invite_Request__c.Applicant_Type__c",
  "Invite_Request__c.Stage__c",
  "Invite_Request__c.Decision__c"
];

export default class InviteRequestWorkspace extends NavigationMixin(
  LightningElement
) {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get applicantName() {
    const fields = this.record?.data?.fields;
    if (!fields) return "";
    const first = fields.First_Name__c?.value ?? "";
    const last = fields.Last_Name__c?.value ?? "";
    return `${first} ${last}`.trim();
  }

  get recordName() {
    return this.record?.data?.fields?.Name?.value ?? "";
  }

  get applicantType() {
    return this.record?.data?.fields?.Applicant_Type__c?.value ?? "";
  }

  get stage() {
    return this.record?.data?.fields?.Stage__c?.value ?? "";
  }

  get decision() {
    return this.record?.data?.fields?.Decision__c?.value ?? "Pending";
  }

  get decisionBadgeClass() {
    const map = {
      Approved: "header-badge is-approved",
      Waitlisted: "header-badge is-waitlisted",
      Rejected: "header-badge is-rejected"
    };
    return map[this.decision] || "header-badge";
  }

  handleBackClick() {
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Invite_Request__c",
        actionName: "list"
      }
    });
  }
}
