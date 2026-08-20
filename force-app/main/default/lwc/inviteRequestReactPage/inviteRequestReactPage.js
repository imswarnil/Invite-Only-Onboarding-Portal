import { LightningElement, api, wire } from "lwc";
import { getRecord, updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import REACT_JS from "@salesforce/resourceUrl/inviteRequestRecordPageJs";
import REACT_CSS from "@salesforce/resourceUrl/inviteRequestRecordPageCss";

// Keep in sync with web/src/sfwidgets/fieldSchema.ts ALL_FIELD_APIS — this LWC and the
// React bundle it loads are two different build pipelines, so the field list is
// duplicated here rather than shared at build time.
const CUSTOM_FIELD_APIS = [
  "Applicant_Type__c",
  "First_Name__c",
  "Last_Name__c",
  "Work_Email__c",
  "Phone__c",
  "Phone_Verified__c",
  "Country__c",
  "State__c",
  "City__c",
  "Company_Website__c",
  "Job_Level__c",
  "Job_Function__c",
  "Sells__c",
  "Annual_Revenue_Band__c",
  "Expected_Revenue_INR__c",
  "Has_Overseas_Entity__c",
  "Seeking_Overseas_Expansion__c",
  "GST_Number__c",
  "Company_Registration_Number__c",
  "PAN_Number__c",
  "Registered_Entity_Type__c",
  "Has_IEC__c",
  "MCA_CIN__c",
  "Blog_Count__c",
  "Content_Depth__c",
  "Fit_Score__c",
  "Legitimacy_Verdict__c",
  "Expansion_Signal__c",
  "Persona__c",
  "Score_Rationale__c",
  "Dossier__c",
  "Stage__c",
  "Sub_Status__c",
  "Decision__c",
  "Notes__c",
  "Marketing_Consent__c"
];
const OBJECT_API = "Invite_Request__c";
const WIRE_FIELDS = [
  `${OBJECT_API}.Name`,
  ...CUSTOM_FIELD_APIS.map((f) => `${OBJECT_API}.${f}`)
];

export default class InviteRequestReactPage extends LightningElement {
  @api recordId;

  scriptsLoaded = false;
  saving = false;
  errorMessage = null;
  record;

  @wire(getRecord, { recordId: "$recordId", fields: WIRE_FIELDS })
  wiredRecord({ data, error }) {
    if (data) {
      this.record = data;
      this.errorMessage = null;
      this.renderReact();
    } else if (error) {
      this.errorMessage = this.reduceError(error);
      this.renderReact();
    }
  }

  renderedCallback() {
    if (this.scriptsLoaded) {
      return;
    }
    this.scriptsLoaded = true;
    Promise.all([loadScript(this, REACT_JS), loadStyle(this, REACT_CSS)])
      .then(() => {
        this.renderReact();
      })
      .catch((e) => {
        this.errorMessage = `Failed to load the React bundle: ${this.reduceError(e)}`;
      });
  }

  renderReact() {
    if (
      !this.record ||
      typeof window.InviteRequestReactWidget === "undefined"
    ) {
      return;
    }
    const container = this.template.querySelector(".irrp-container");
    if (!container) {
      return;
    }
    const plainRecord = {};
    CUSTOM_FIELD_APIS.forEach((fieldApi) => {
      const field = this.record.fields[fieldApi];
      plainRecord[fieldApi] = field ? field.value : null;
    });
    window.InviteRequestReactWidget.mount(container, {
      record: plainRecord,
      recordName: this.record.fields.Name
        ? this.record.fields.Name.value
        : this.recordId,
      saving: this.saving,
      error: this.errorMessage,
      onSave: (changed) => this.handleSave(changed)
    });
  }

  handleSave(changed) {
    this.saving = true;
    this.renderReact();
    const fields = { Id: this.recordId, ...changed };
    updateRecord({ fields })
      .then(() => {
        this.errorMessage = null;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Saved",
            message: "Invite Request updated.",
            variant: "success"
          })
        );
      })
      .catch((e) => {
        this.errorMessage = this.reduceError(e);
      })
      .finally(() => {
        this.saving = false;
        this.renderReact();
      });
  }

  reduceError(error) {
    if (error && Array.isArray(error.body)) {
      return error.body.map((e) => e.message).join(", ");
    }
    if (error && error.body && typeof error.body.message === "string") {
      return error.body.message;
    }
    return (error && error.message) || "Unknown error";
  }

  disconnectedCallback() {
    const container = this.template.querySelector(".irrp-container");
    if (container && window.InviteRequestReactWidget) {
      window.InviteRequestReactWidget.unmount(container);
    }
  }
}
