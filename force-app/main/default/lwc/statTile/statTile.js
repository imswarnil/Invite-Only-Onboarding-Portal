import { LightningElement, api } from "lwc";

export default class StatTile extends LightningElement {
  @api label = "Stat";
  @api value = "—";
  @api sublabel = "";
  @api accent = "purple"; // purple | navy | green | orange | red

  get tileClass() {
    return `stat-tile stat-tile-${this.accent}`;
  }
}
