import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const OBJECT_API = "Invite_Request__c";

export default class InviteRequestEditor extends LightningElement {
  @api recordId;
  errorMessage;

  @wire(getRecord, {
    recordId: "$recordId",
    fields: [`${OBJECT_API}.Applicant_Type__c`]
  })
  record;

  get isCompany() {
    return this.record?.data?.fields?.Applicant_Type__c?.value === "Company";
  }

  get isIndividual() {
    return this.record?.data?.fields?.Applicant_Type__c?.value === "Individual";
  }

  handleSuccess() {
    this.errorMessage = undefined;
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Saved",
        message: "Invite Request updated.",
        variant: "success"
      })
    );
  }

  handleError(event) {
    this.errorMessage = event.detail?.message ?? "Could not save this record.";
  }
}
