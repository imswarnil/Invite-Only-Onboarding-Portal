import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const TABS = [
  { key: "contact", label: "Contact", icon: "utility:contact" },
  { key: "business", label: "Business", icon: "utility:money" },
  { key: "research", label: "Research & Scoring", icon: "utility:trending" },
  { key: "pipeline", label: "Pipeline", icon: "utility:approval" },
  { key: "notes", label: "Notes", icon: "utility:notebook" }
];

export default class InviteRequestEditor extends LightningElement {
  @api recordId;
  errorMessage;
  activeTab = "contact";

  @wire(getRecord, {
    recordId: "$recordId",
    fields: ["Invite_Request__c.Applicant_Type__c"]
  })
  record;

  get isCompany() {
    return this.record?.data?.fields?.Applicant_Type__c?.value === "Company";
  }

  get isIndividual() {
    return this.record?.data?.fields?.Applicant_Type__c?.value === "Individual";
  }

  get tabButtons() {
    return TABS.map((tab) => ({
      ...tab,
      buttonClass:
        tab.key === this.activeTab ? "tab-button is-active" : "tab-button"
    }));
  }

  panelClass(key) {
    return key === this.activeTab ? "tab-panel is-active" : "tab-panel";
  }

  get contactPanelClass() {
    return this.panelClass("contact");
  }

  get businessPanelClass() {
    return this.panelClass("business");
  }

  get researchPanelClass() {
    return this.panelClass("research");
  }

  get pipelinePanelClass() {
    return this.panelClass("pipeline");
  }

  get notesPanelClass() {
    return this.panelClass("notes");
  }

  handleTabClick(event) {
    this.activeTab = event.currentTarget.dataset.tab;
  }

  handleSuccess() {
    this.errorMessage = undefined;
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Saved",
        message: "Invite Request updated.",
        variant: "success"
      })
    );
  }

  handleError(event) {
    this.errorMessage = event.detail?.message ?? "Could not save this record.";
  }
}
