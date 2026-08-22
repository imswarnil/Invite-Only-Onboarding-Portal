import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

const FIELDS = ["Invite_Request__c.Stage__c", "Invite_Request__c.LastModifiedDate"];

export default class DaysInStageTile extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get stage() {
    return this.record?.data?.fields?.Stage__c?.value ?? "—";
  }

  get days() {
    const lastModified = this.record?.data?.fields?.LastModifiedDate?.value;
    if (!lastModified) return null;
    const diffMs = Date.now() - new Date(lastModified).getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  get displayDays() {
    return this.days === null ? "—" : this.days;
  }

  get isStale() {
    return this.days !== null && this.days >= 5;
  }

  get numberClass() {
    return this.isStale ? "days-number is-stale" : "days-number";
  }
}
