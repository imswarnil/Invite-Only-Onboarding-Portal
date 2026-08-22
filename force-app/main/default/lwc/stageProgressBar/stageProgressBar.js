import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

const FIELDS = ["Invite_Request__c.Stage__c"];

const MAIN_STAGES = [
  "Received",
  "AI Validation",
  "Action Needed",
  "In Review",
  "Approved",
  "Onboarding",
  "Activated",
  "Won"
];

const OFF_RAMPS = ["Waitlisted", "Rejected"];

export default class StageProgressBar extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get stage() {
    return this.record?.data?.fields?.Stage__c?.value;
  }

  get isOffRamp() {
    return OFF_RAMPS.includes(this.stage);
  }

  get offRampClass() {
    return this.stage === "Rejected"
      ? "off-ramp-banner is-rejected"
      : "off-ramp-banner is-waitlisted";
  }

  get steps() {
    const currentIndex = MAIN_STAGES.indexOf(this.stage);
    return MAIN_STAGES.map((label, index) => {
      let status = "upcoming";
      if (currentIndex === -1) {
        status = "upcoming";
      } else if (index < currentIndex) {
        status = "complete";
      } else if (index === currentIndex) {
        status = "current";
      }
      return {
        key: label,
        label,
        cssClass: `stage-step is-${status}`,
        wrapClass: index === 0 ? "stage-step-wrap is-first" : "stage-step-wrap"
      };
    });
  }
}
