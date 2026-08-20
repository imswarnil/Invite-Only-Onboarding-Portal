import { LightningElement, wire } from "lwc";
import getTypeSplit from "@salesforce/apex/InviteHomeController.getTypeSplit";

export default class ApplicantTypeSplit extends LightningElement {
  individualCount = 0;
  companyCount = 0;
  errorMessage;

  @wire(getTypeSplit)
  wiredSplit({ data, error }) {
    if (data) {
      this.individualCount = data.individualCount;
      this.companyCount = data.companyCount;
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load applicant type split.";
    }
  }

  get total() {
    return this.individualCount + this.companyCount;
  }

  get individualStyle() {
    return `width: ${this.total ? (this.individualCount / this.total) * 100 : 0}%`;
  }

  get companyStyle() {
    return `width: ${this.total ? (this.companyCount / this.total) * 100 : 0}%`;
  }
}
