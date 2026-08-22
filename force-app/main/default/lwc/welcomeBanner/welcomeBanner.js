import { LightningElement, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import USER_ID from "@salesforce/user/Id";
import NAME_FIELD from "@salesforce/schema/User.Name";
import SMALL_PHOTO_FIELD from "@salesforce/schema/User.SmallPhotoUrl";

export default class WelcomeBanner extends LightningElement {
  @wire(getRecord, { recordId: USER_ID, fields: [NAME_FIELD, SMALL_PHOTO_FIELD] })
  user;

  get userName() {
    return this.user?.data?.fields?.Name?.value ?? "there";
  }

  get userPhotoUrl() {
    return this.user?.data?.fields?.SmallPhotoUrl?.value;
  }

  get greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  get todayLabel() {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }
}
