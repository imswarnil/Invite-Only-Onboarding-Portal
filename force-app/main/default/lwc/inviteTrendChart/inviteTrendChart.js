import { LightningElement, wire } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import CHART_JS from "@salesforce/resourceUrl/chartJs";
import getTrendData from "@salesforce/apex/InviteHomeController.getTrendData";

const RANGES = [
  { key: "LAST_7", label: "Last 7 days" },
  { key: "LAST_30", label: "Last 30 days" },
  { key: "LAST_90", label: "Last 90 days" }
];

const GROUPINGS = [
  { key: "DAY", label: "Days" },
  { key: "WEEK", label: "Weeks" },
  { key: "MONTH", label: "Months" }
];

export default class InviteTrendChart extends LightningElement {
  rangeKey = "LAST_30";
  groupBy = "DAY";
  errorMessage;
  chartJsLoaded = false;
  trendData;
  chart;

  @wire(getTrendData, { rangeKey: "$rangeKey", groupBy: "$groupBy" })
  wiredTrend({ data, error }) {
    if (data) {
      this.trendData = data;
      this.errorMessage = undefined;
      this.renderChart();
    } else if (error) {
      this.errorMessage = error?.body?.message ?? "Could not load trend data.";
    }
  }

  renderedCallback() {
    if (this.chartJsLoaded) {
      return;
    }
    this.chartJsLoaded = true;
    loadScript(this, CHART_JS)
      .then(() => {
        this.renderChart();
      })
      .catch((error) => {
        this.errorMessage = "Could not load charting library.";
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }

  get rangeOptions() {
    return RANGES.map((r) => ({
      ...r,
      buttonClass:
        r.key === this.rangeKey ? "toggle-button is-active" : "toggle-button"
    }));
  }

  get groupOptions() {
    return GROUPINGS.map((g) => ({
      ...g,
      buttonClass:
        g.key === this.groupBy ? "toggle-button is-active" : "toggle-button"
    }));
  }

  handleRangeClick(event) {
    this.rangeKey = event.currentTarget.dataset.key;
  }

  handleGroupClick(event) {
    this.groupBy = event.currentTarget.dataset.key;
  }

  renderChart() {
    if (!window.Chart || !this.trendData) {
      return;
    }
    const canvas = this.template.querySelector("canvas");
    if (!canvas) {
      return;
    }
    const labels = this.trendData.map((p) => p.bucketLabel);
    const values = this.trendData.map((p) => p.total);

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = values;
      this.chart.update();
      return;
    }

    this.chart = new window.Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Invite Requests",
            data: values,
            borderColor: "#635bff",
            backgroundColor: "rgba(99, 91, 255, 0.12)",
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: "#635bff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }
}
