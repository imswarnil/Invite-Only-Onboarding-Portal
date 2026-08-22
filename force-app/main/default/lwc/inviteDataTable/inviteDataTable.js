import { LightningElement, wire } from "lwc";
import getInviteTableRows from "@salesforce/apex/InviteHomeController.getInviteTableRows";

const COLUMNS = [
  { label: "Name", fieldName: "recordUrl", type: "url", sortable: true,
    typeAttributes: { label: { fieldName: "name" }, target: "_self" } },
  { label: "Type", fieldName: "applicantType", type: "text", sortable: true },
  { label: "Stage", fieldName: "stage", type: "text", sortable: true },
  { label: "Sub Status", fieldName: "subStatus", type: "text", sortable: true },
  { label: "Decision", fieldName: "decision", type: "text", sortable: true },
  { label: "Fit Score", fieldName: "fitScore", type: "number", sortable: true },
  { label: "Country", fieldName: "country", type: "text", sortable: true },
  { label: "State", fieldName: "state", type: "text", sortable: true },
  { label: "Owner", fieldName: "ownerName", type: "text", sortable: true },
  {
    label: "Created",
    fieldName: "createdDate",
    type: "date",
    sortable: true,
    typeAttributes: {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  }
];

export default class InviteDataTable extends LightningElement {
  columns = COLUMNS;
  allRows = [];
  errorMessage;
  searchTerm = "";
  stageFilter = "All";
  sortedBy = "createdDate";
  sortDirection = "desc";

  @wire(getInviteTableRows, { maxResults: 100 })
  wiredRows({ data, error }) {
    if (data) {
      this.allRows = data.map((row) => ({
        ...row,
        recordUrl: `/lightning/r/Invite_Request__c/${row.recordId}/view`
      }));
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage = error?.body?.message ?? "Could not load invite requests.";
    }
  }

  get stageOptions() {
    const stages = new Set(this.allRows.map((r) => r.stage).filter(Boolean));
    const options = [{ label: "All Stages", value: "All" }];
    Array.from(stages)
      .sort()
      .forEach((s) => options.push({ label: s, value: s }));
    return options;
  }

  get filteredRows() {
    let rows = this.allRows;
    if (this.stageFilter !== "All") {
      rows = rows.filter((r) => r.stage === this.stageFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      rows = rows.filter((r) =>
        [r.name, r.applicantType, r.country, r.state, r.ownerName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term))
      );
    }
    return this.sortRows(rows);
  }

  get rowCountLabel() {
    return `${this.filteredRows.length} of ${this.allRows.length} requests`;
  }

  sortRows(rows) {
    const field = this.sortedBy;
    const direction = this.sortDirection === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const valueA = a[field] ?? "";
      const valueB = b[field] ?? "";
      if (valueA > valueB) return direction;
      if (valueA < valueB) return -direction;
      return 0;
    });
  }

  handleSearchChange(event) {
    this.searchTerm = event.target.value;
  }

  handleStageFilterChange(event) {
    this.stageFilter = event.detail.value;
  }

  handleSort(event) {
    this.sortedBy = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;
  }
}
