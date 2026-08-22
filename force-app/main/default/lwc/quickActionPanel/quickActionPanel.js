import { LightningElement, api, wire } from "lwc";
import { getRecord, updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const FIELDS = ["Invite_Request__c.Decision__c"];

export default class QuickActionPanel extends LightningElement {
  @api recordId;
  saving = false;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get currentDecision() {
    return this.record?.data?.fields?.Decision__c?.value ?? "Pending";
  }

  get isDisabled() {
    return this.saving;
  }

  tileClass(value) {
    return this.currentDecision === value
      ? "action-tile is-active"
      : "action-tile";
  }

  get approveTileClass() {
    return this.tileClass("Approved");
  }

  get waitlistTileClass() {
    return this.tileClass("Waitlisted");
  }

  get rejectTileClass() {
    return this.tileClass("Rejected");
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
