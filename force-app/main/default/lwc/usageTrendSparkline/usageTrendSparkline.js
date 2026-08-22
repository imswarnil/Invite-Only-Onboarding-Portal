import { LightningElement, api, wire } from "lwc";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";

const FIELDS = ["Usage_Snapshot__c.Month__c", "Usage_Snapshot__c.Volume_INR__c"];

export default class UsageTrendSparkline extends LightningElement {
  @api recordId;
  snapshots = [];
  errorMessage;

  @wire(getRelatedListRecords, {
    parentRecordId: "$recordId",
    relatedListId: "Usage_Snapshots",
    fields: FIELDS,
    sortBy: ["Usage_Snapshot__c.Month__c"]
  })
  wiredSnapshots({ data, error }) {
    if (data) {
      this.snapshots = data.records ?? [];
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage = error?.body?.message ?? "Could not load usage trend.";
    }
  }

  get hasData() {
    return this.snapshots.length > 0;
  }

  get latestVolume() {
    if (!this.hasData) return "—";
    const last = this.snapshots[this.snapshots.length - 1];
    const value = last.fields.Volume_INR__c?.value;
    return value == null ? "—" : Math.round(value).toLocaleString("en-IN");
  }

  get points() {
    const values = this.snapshots.map((s) => s.fields.Volume_INR__c?.value ?? 0);
    if (!values.length) return "";
    const max = Math.max(...values, 1);
    const width = 160;
    const height = 48;
    const step = values.length > 1 ? width / (values.length - 1) : 0;
    return values
      .map((v, i) => {
        const x = i * step;
        const y = height - (v / max) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }
}
