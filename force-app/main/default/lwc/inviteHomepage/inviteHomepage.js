import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import INVITE_REQUEST_OBJECT from "@salesforce/schema/Invite_Request__c";
import getOverviewStats from "@salesforce/apex/InviteHomeController.getOverviewStats";
import getStageCounts from "@salesforce/apex/InviteHomeController.getStageCounts";
import getProvisionedAccountSummary from "@salesforce/apex/InviteHomeController.getProvisionedAccountSummary";

export default class InviteHomepage extends NavigationMixin(LightningElement) {
  totalRequests = "—";
  averageFitScore = "—";
  provisionedTotal = "—";
  needsAttentionCount = "—";
  showNewModal = false;
  newApplicantType = "Individual";

  @wire(getObjectInfo, { objectApiName: INVITE_REQUEST_OBJECT })
  objectInfo;

  @wire(getOverviewStats)
  wiredStats({ data }) {
    if (data) {
      this.totalRequests = data.totalRequests;
      this.averageFitScore =
        data.averageFitScore === null ? "Not yet scored" : data.averageFitScore;
    }
  }

  @wire(getStageCounts)
  wiredStages({ data }) {
    if (data) {
      const needsAttention = data.filter(
        (s) => s.stage === "Action Needed" || s.stage === "Waitlisted"
      );
      this.needsAttentionCount = needsAttention.reduce(
        (sum, s) => sum + s.total,
        0
      );
    }
  }

  @wire(getProvisionedAccountSummary)
  wiredProvisioned({ data }) {
    if (data) {
      this.provisionedTotal =
        data.activeCount + data.pausedCount + data.cancelledCount;
    }
  }

  get recordTypeId() {
    const infos = this.objectInfo?.data?.recordTypeInfos;
    if (!infos) return undefined;
    const match = Object.values(infos).find(
      (info) => info.name === this.newApplicantType
    );
    return match?.recordTypeId;
  }

  get isIndividualSelected() {
    return this.newApplicantType === "Individual";
  }

  get isCompanySelected() {
    return this.newApplicantType === "Company";
  }

  get individualToggleClass() {
    return this.isIndividualSelected
      ? "modal-toggle-option is-selected"
      : "modal-toggle-option";
  }

  get companyToggleClass() {
    return this.isCompanySelected
      ? "modal-toggle-option is-selected"
      : "modal-toggle-option";
  }

  handleViewPipelineClick() {
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Invite_Request__c",
        actionName: "list"
      }
    });
  }

  handleNewInviteClick() {
    this.newApplicantType = "Individual";
    this.showNewModal = true;
  }

  handleCloseModal() {
    this.showNewModal = false;
  }

  handleApplicantTypeToggle(event) {
    this.newApplicantType = event.currentTarget.dataset.type;
  }

  handleNewSuccess() {
    this.showNewModal = false;
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Created",
        message: "New invite request saved.",
        variant: "success"
      })
    );
  }

  handleNewError(event) {
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Error",
        message: event.detail?.detail ?? "Could not save the invite request.",
        variant: "error"
      })
    );
  }
}
