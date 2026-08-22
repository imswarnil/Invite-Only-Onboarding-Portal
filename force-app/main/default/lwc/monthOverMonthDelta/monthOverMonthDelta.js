import { LightningElement, api, wire } from "lwc";
import getMonthOverMonthDelta from "@salesforce/apex/InviteHomeController.getMonthOverMonthDelta";

export default class MonthOverMonthDelta extends LightningElement {
  @api recordId;
  errorMessage;
  delta;

  @wire(getMonthOverMonthDelta, { usageSnapshotId: "$recordId" })
  wiredDelta({ data, error }) {
    if (data) {
      this.delta = data;
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not compute month-over-month change.";
    }
  }

  get hasPrevious() {
    return this.delta?.hasPrevious === true;
  }

  get isUp() {
    return this.hasPrevious && this.delta.deltaPercent >= 0;
  }

  get arrow() {
    return this.isUp ? "▲" : "▼";
  }

  get deltaClass() {
    return this.isUp ? "delta-value is-up" : "delta-value is-down";
  }

  get displayDelta() {
    if (!this.hasPrevious || this.delta.deltaPercent == null) return "—";
    return `${Math.abs(this.delta.deltaPercent).toFixed(1)}%`;
  }
}
