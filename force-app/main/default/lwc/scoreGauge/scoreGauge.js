import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

const FIELDS = [
  "Invite_Request__c.Fit_Score__c",
  "Invite_Request__c.Legitimacy_Verdict__c"
];

// Thresholds mirror instruction.md's scoring rule: score >= 75 -> In Review track,
// score < 45 -> Waitlisted track. The gauge's color bands are the same cutoffs,
// so what the reviewer sees here always matches what the routing Flow (Phase 4) acts on.
const LOW_MAX = 45;
const HIGH_MIN = 75;

export default class ScoreGauge extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get score() {
    const value = this.record?.data?.fields?.Fit_Score__c?.value;
    return typeof value === "number" ? value : null;
  }

  get verdict() {
    return this.record?.data?.fields?.Legitimacy_Verdict__c?.value ?? "";
  }

  get hasScore() {
    return this.score !== null;
  }

  get displayScore() {
    return this.hasScore ? this.score : "—";
  }

  get band() {
    if (!this.hasScore) return "pending";
    if (this.score < LOW_MAX) return "low";
    if (this.score >= HIGH_MIN) return "high";
    return "mid";
  }

  get bandColor() {
    return {
      low: "#ea001e",
      mid: "#fe9339",
      high: "#04844b",
      pending: "#c9c9c9"
    }[this.band];
  }

  get bandLabel() {
    return {
      low: "Low fit",
      mid: "Borderline",
      high: "Strong fit",
      pending: "Not yet scored"
    }[this.band];
  }

  // A ring drawn with two stacked <circle> elements: a full-opacity track and an
  // arc whose length is set via stroke-dasharray, proportional to score/100.
  get circumference() {
    return 2 * Math.PI * 40;
  }

  get dashArray() {
    const pct = this.hasScore ? this.score / 100 : 0;
    const filled = this.circumference * pct;
    return `${filled} ${this.circumference}`;
  }

  get ringStyle() {
    return `stroke: ${this.bandColor}`;
  }
}
