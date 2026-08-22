import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

const FIELDS = [
  "Invite_Request__c.PAN_Number__c",
  "Invite_Request__c.GST_Number__c",
  "Invite_Request__c.MCA_CIN__c",
  "Invite_Request__c.Has_IEC__c",
  "Invite_Request__c.Company_Registration_Number__c"
];

export default class ComplianceChecklist extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get items() {
    const data = this.record?.data;
    if (!data) return [];
    const has = (value) => Boolean(value && String(value).trim().length > 0);
    return [
      {
        key: "reg",
        label: "Registration Number",
        complete: has(data.fields.Company_Registration_Number__c?.value)
      },
      { key: "pan", label: "PAN", complete: has(data.fields.PAN_Number__c?.value) },
      { key: "gst", label: "GST Number", complete: has(data.fields.GST_Number__c?.value) },
      { key: "cin", label: "MCA CIN", complete: has(data.fields.MCA_CIN__c?.value) },
      { key: "iec", label: "IEC", complete: data.fields.Has_IEC__c?.value === true }
    ].map((item) => ({
      ...item,
      cssClass: item.complete ? "checklist-row is-complete" : "checklist-row",
      icon: item.complete ? "utility:success" : "utility:dash"
    }));
  }

  get completedCount() {
    return this.items.filter((i) => i.complete).length;
  }

  get totalCount() {
    return this.items.length;
  }
}
