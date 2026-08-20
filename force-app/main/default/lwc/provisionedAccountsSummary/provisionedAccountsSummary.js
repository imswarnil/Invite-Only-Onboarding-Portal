import { LightningElement, wire } from "lwc";
import getProvisionedAccountSummary from "@salesforce/apex/InviteHomeController.getProvisionedAccountSummary";

export default class ProvisionedAccountsSummary extends LightningElement {
  activeCount = 0;
  pausedCount = 0;
  cancelledCount = 0;
  errorMessage;

  @wire(getProvisionedAccountSummary)
  wiredSummary({ data, error }) {
    if (data) {
      this.activeCount = data.activeCount;
      this.pausedCount = data.pausedCount;
      this.cancelledCount = data.cancelledCount;
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load provisioned account summary.";
    }
  }
}
