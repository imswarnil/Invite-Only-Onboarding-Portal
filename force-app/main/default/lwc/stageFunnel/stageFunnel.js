import { LightningElement, wire } from "lwc";
import getStageCounts from "@salesforce/apex/InviteHomeController.getStageCounts";

export default class StageFunnel extends LightningElement {
  stageData;
  errorMessage;

  @wire(getStageCounts)
  wiredStages({ data, error }) {
    if (data) {
      const max = Math.max(1, ...data.map((s) => s.total));
      this.stageData = data.map((s) => ({
        stage: s.stage,
        total: s.total,
        widthStyle: `width: ${(s.total / max) * 100}%`
      }));
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load stage counts.";
    }
  }
}
