import { LightningElement, api, wire } from "lwc";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const FIELDS = [
  "Crawler_Finding__c.Title__c",
  "Crawler_Finding__c.Severity__c",
  "Crawler_Finding__c.Status__c",
  "Crawler_Finding__c.Fixable__c"
];

export default class FindingsList extends LightningElement {
  @api recordId;
  errorMessage;

  // relatedListId is the relationshipName on Crawler_Finding__c's Invite_Request__c
  // master-detail field ("Crawler_Findings") -- no "__r" suffix, that's SOQL-only syntax.
  // fields must be fully qualified as ChildObject.Field for this wire adapter.
  @wire(getRelatedListRecords, {
    parentRecordId: "$recordId",
    relatedListId: "Crawler_Findings",
    fields: FIELDS
  })
  wiredFindings({ data, error }) {
    if (data) {
      this.findings = data.records ?? [];
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage = error?.body?.message ?? "Could not load findings.";
    }
  }

  findings = [];

  get hasFindings() {
    return this.findings.length > 0;
  }

  get rows() {
    return this.findings.map((r) => {
      const severity = r.fields.Severity__c?.value;
      const status = r.fields.Status__c?.value;
      return {
        id: r.id,
        title: r.fields.Title__c?.value,
        severity,
        status,
        fixable: r.fields.Fixable__c?.value,
        severityClass: `slds-badge finding-badge-${(severity || "info").toLowerCase()}`,
        canFlag: status === "Open"
      };
    });
  }

  handleFlag(event) {
    const findingId = event.currentTarget.dataset.id;
    updateRecord({ fields: { Id: findingId, Status__c: "Flagged" } })
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Flagged",
            message: "Finding marked Flagged.",
            variant: "success"
          })
        );
      })
      .catch((e) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error",
            message: e?.body?.message ?? "Could not update finding.",
            variant: "error"
          })
        );
      });
  }
}
