import { LightningElement, api, wire } from "lwc";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const FIELDS = ["Title__c", "Severity__c", "Status__c", "Fixable__c"];

export default class FindingsList extends LightningElement {
  @api recordId;
  errorMessage;

  // relatedListId here is the child relationship's query name (the same name you'd use
  // in a SOQL subquery, e.g. SELECT (SELECT Title__c FROM Crawler_Findings__r) FROM
  // Invite_Request__c) -- matches the relationshipName set on Crawler_Finding__c's
  // Invite_Request__c master-detail field. Unverified live (no browser access here) --
  // if this comes back empty, that relationship name is the first thing to check.
  @wire(getRelatedListRecords, {
    parentRecordId: "$recordId",
    relatedListId: "Crawler_Findings__r",
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
      const severity = r.fields.Severity__c.value;
      const status = r.fields.Status__c.value;
      return {
        id: r.id,
        title: r.fields.Title__c.value,
        severity,
        status,
        fixable: r.fields.Fixable__c.value,
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
