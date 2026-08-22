import { LightningElement, wire } from "lwc";
import getStateBreakdown from "@salesforce/apex/InviteHomeController.getStateBreakdown";

// Rough, stylized relative positions (% of card width/height) -- not a real GeoJSON
// outline, just enough north/south/east/west arrangement to read as "a map of India"
// at a glance. Add more states here if seed/demo data starts covering them.
const STATE_POSITIONS = {
  "Jammu and Kashmir": { x: 42, y: 6 },
  Punjab: { x: 38, y: 16 },
  Delhi: { x: 45, y: 23 },
  Rajasthan: { x: 32, y: 30 },
  "Uttar Pradesh": { x: 53, y: 27 },
  Gujarat: { x: 25, y: 42 },
  "Madhya Pradesh": { x: 48, y: 42 },
  "West Bengal": { x: 68, y: 44 },
  Assam: { x: 78, y: 32 },
  Odisha: { x: 62, y: 54 },
  Maharashtra: { x: 38, y: 54 },
  Telangana: { x: 52, y: 62 },
  Karnataka: { x: 42, y: 70 },
  "Andhra Pradesh": { x: 55, y: 70 },
  "Tamil Nadu": { x: 48, y: 84 },
  Kerala: { x: 38, y: 84 }
};

export default class IndiaRegionMap extends LightningElement {
  errorMessage;
  spots = [];
  maxCount = 1;

  @wire(getStateBreakdown)
  wiredStates({ data, error }) {
    if (data) {
      this.maxCount = Math.max(1, ...data.map((s) => s.total));
      this.spots = data
        .filter((s) => STATE_POSITIONS[s.state])
        .map((s) => {
          const pos = STATE_POSITIONS[s.state];
          const sizePx = 14 + (s.total / this.maxCount) * 26;
          return {
            key: s.state,
            state: s.state,
            total: s.total,
            style: `left: ${pos.x}%; top: ${pos.y}%; width: ${sizePx}px; height: ${sizePx}px; margin-left: -${
              sizePx / 2
            }px; margin-top: -${sizePx / 2}px;`,
            title: `${s.state}: ${s.total}`
          };
        });
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load state breakdown.";
    }
  }

  get hasSpots() {
    return this.spots.length > 0;
  }
}
