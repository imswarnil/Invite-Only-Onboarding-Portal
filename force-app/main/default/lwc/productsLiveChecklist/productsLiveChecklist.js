import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

const FIELDS = ["Provisioned_Account__c.Products_Live__c"];
const ALL_PRODUCTS = ["Payments", "Payouts", "Billing", "Connect", "Radar", "Tax"];

export default class ProductsLiveChecklist extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  get products() {
    const raw = this.record?.data?.fields?.Products_Live__c?.value ?? "";
    const live = new Set(raw.split(";").filter(Boolean));
    return ALL_PRODUCTS.map((name) => ({
      name,
      live: live.has(name),
      cssClass: live.has(name) ? "product-row is-live" : "product-row",
      icon: live.has(name) ? "utility:check" : "utility:close"
    }));
  }
}
