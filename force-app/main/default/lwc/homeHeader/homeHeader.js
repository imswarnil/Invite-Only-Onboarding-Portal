import { LightningElement, api } from "lwc";

export default class HomeHeader extends LightningElement {
  @api title = "Invite Only Onboarding";
  @api subtitle = "Reviewer workspace";
}
