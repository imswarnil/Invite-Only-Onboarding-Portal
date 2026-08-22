import { LightningElement, api, wire } from "lwc";
import getFieldHistory from "@salesforce/apex/InviteHomeController.getFieldHistory";

// Only these fields have Field History Tracking enabled on Invite_Request__c
// (Stage__c, Sub_Status__c, Decision__c, Fit_Score__c, Legitimacy_Verdict__c) --
// see force-app/.../objects/Invite_Request__c/fields/*.field-meta.xml (trackHistory).
const FIELD_LABELS = {
  Stage__c: "Stage",
  Sub_Status__c: "Sub Status",
  Decision__c: "Decision",
  Fit_Score__c: "Fit Score",
  Legitimacy_Verdict__c: "Legitimacy Verdict"
};

export default class InviteTimeline extends LightningElement {
  @api recordId;
  errorMessage;
  entries = [];

  @wire(getFieldHistory, { recordId: "$recordId" })
  wiredHistory({ data, error }) {
    if (data) {
      this.entries = data.map((h, index) => {
        const isCreated = h.fieldLabel === "created";
        return {
          key: index,
          isCreated,
          fieldLabel: isCreated
            ? "Record Created"
            : FIELD_LABELS[h.fieldLabel] ?? h.fieldLabel,
          oldValue: h.oldValue ?? "—",
          newValue: h.newValue ?? "—",
          changedByName: h.changedByName,
          changedDate: h.changedDate
        };
      });
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage = error?.body?.message ?? "Could not load history.";
    }
  }

  get hasEntries() {
    return this.entries.length > 0;
  }
}
