import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

const FIELDS = [
  "Provisioned_Account__c.Renewal_Date__c",
  "Provisioned_Account__c.Plan_Tier__c"
];

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export default class RenewalCountdown extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get planTier() {
    return this.record?.data?.fields?.Plan_Tier__c?.value ?? "—";
  }

  get daysUntilRenewal() {
    const renewalDate = this.record?.data?.fields?.Renewal_Date__c?.value;
    if (!renewalDate) return null;
    const diffMs = new Date(renewalDate).getTime() - Date.now();
    return Math.ceil(diffMs / MS_PER_DAY);
  }

  get hasRenewalDate() {
    return this.daysUntilRenewal !== null;
  }

  get displayDays() {
    if (!this.hasRenewalDate) return "—";
    return this.daysUntilRenewal < 0
      ? "Overdue"
      : `${this.daysUntilRenewal}`;
  }

  get urgencyClass() {
    if (!this.hasRenewalDate) return "renewal-days";
    if (this.daysUntilRenewal < 0) return "renewal-days is-overdue";
    if (this.daysUntilRenewal <= 30) return "renewal-days is-soon";
    return "renewal-days is-healthy";
  }
}
