import { LightningElement, api } from "lwc";

export default class StatTile extends LightningElement {
  @api label = "Stat";
  @api value = "—";
  @api sublabel = "";
  @api accent = "purple"; // purple | navy | green | orange | red
  @api iconName = "";

  get tileClass() {
    return `stat-tile stat-tile-${this.accent}`;
  }

  get hasIcon() {
    return Boolean(this.iconName);
  }
}
