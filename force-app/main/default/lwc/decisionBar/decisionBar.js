import { LightningElement, api, wire } from "lwc";
import { getRecord, updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const FIELDS = ["Invite_Request__c.Decision__c"];

export default class DecisionBar extends LightningElement {
  @api recordId;
  saving = false;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get currentDecision() {
    return this.record?.data?.fields?.Decision__c?.value ?? "Pending";
  }

  get isApproved() {
    return this.currentDecision === "Approved";
  }

  get isWaitlisted() {
    return this.currentDecision === "Waitlisted";
  }

  get isRejected() {
    return this.currentDecision === "Rejected";
  }

  get isDisabled() {
    return this.saving;
  }

  handleApprove() {
    this.setDecision("Approved");
  }

  handleWaitlist() {
    this.setDecision("Waitlisted");
  }

  handleReject() {
    this.setDecision("Rejected");
  }

  setDecision(value) {
    this.saving = true;
    updateRecord({ fields: { Id: this.recordId, Decision__c: value } })
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Decision recorded",
            message: `Set to ${value}.`,
            variant: "success"
          })
        );
      })
      .catch((e) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error",
            message: e?.body?.message ?? "Could not save decision.",
            variant: "error"
          })
        );
      })
      .finally(() => {
        this.saving = false;
      });
  }
}
