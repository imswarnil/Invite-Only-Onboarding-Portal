import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

const FIELDS = [
  "Invite_Request__c.Legitimacy_Verdict__c",
  "Invite_Request__c.Has_IEC__c",
  "Invite_Request__c.Has_Overseas_Entity__c",
  "Invite_Request__c.Seeking_Overseas_Expansion__c"
];

export default class LegitimacyBadge extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get verdict() {
    return this.record?.data?.fields?.Legitimacy_Verdict__c?.value ?? "Not yet verified";
  }

  get verdictClass() {
    const map = {
      Verified: "slds-badge slds-theme_success",
      "Needs Review": "slds-badge slds-theme_warning",
      Rejected: "slds-badge slds-theme_error"
    };
    return map[this.verdict] || "slds-badge";
  }

  get badges() {
    const data = this.record?.data;
    if (!data) return [];
    return [
      { key: "iec", label: "Has IEC", active: data.fields.Has_IEC__c?.value === true },
      {
        key: "overseas",
        label: "Overseas Entity",
        active: data.fields.Has_Overseas_Entity__c?.value === true
      },
      {
        key: "expansion",
        label: "Seeking Expansion",
        active: data.fields.Seeking_Overseas_Expansion__c?.value === true
      }
    ].map((b) => ({
      ...b,
      cssClass: b.active ? "compliance-chip is-active" : "compliance-chip"
    }));
  }
}
