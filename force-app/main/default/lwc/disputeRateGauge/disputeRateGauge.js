import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

const FIELDS = ["Usage_Snapshot__c.Dispute_Rate__c"];
const WATCH_MAX = 1;
const RISK_MIN = 2;

export default class DisputeRateGauge extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get rate() {
    const value = this.record?.data?.fields?.Dispute_Rate__c?.value;
    return typeof value === "number" ? value : null;
  }

  get hasRate() {
    return this.rate !== null;
  }

  get displayRate() {
    return this.hasRate ? `${this.rate}%` : "—";
  }

  get band() {
    if (!this.hasRate) return "pending";
    if (this.rate >= RISK_MIN) return "risk";
    if (this.rate >= WATCH_MAX) return "watch";
    return "healthy";
  }

  get bandColor() {
    return {
      healthy: "#04844b",
      watch: "#fe9339",
      risk: "#ea001e",
      pending: "#c9c9c9"
    }[this.band];
  }

  get bandLabel() {
    return {
      healthy: "Healthy",
      watch: "Watch",
      risk: "At risk",
      pending: "No data"
    }[this.band];
  }

  get circumference() {
    return 2 * Math.PI * 40;
  }

  get dashArray() {
    const pct = this.hasRate ? Math.min(this.rate / 5, 1) : 0;
    const filled = this.circumference * pct;
    return `${filled} ${this.circumference}`;
  }

  get ringStyle() {
    return `stroke: ${this.bandColor}`;
  }
}
