import { LightningElement, wire } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import CHART_JS from "@salesforce/resourceUrl/chartJs";
import getStageCounts from "@salesforce/apex/InviteHomeController.getStageCounts";

const BAR_COLOR = "#635bff";

export default class StageFunnel extends LightningElement {
  errorMessage;
  chartJsLoaded = false;
  stageData;
  chart;

  @wire(getStageCounts)
  wiredStages({ data, error }) {
    if (data) {
      this.stageData = data;
      this.errorMessage = undefined;
      this.renderChart();
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load stage counts.";
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

  renderChart() {
    if (!window.Chart || !this.stageData) {
      return;
    }
    const canvas = this.template.querySelector("canvas");
    if (!canvas) {
      return;
    }
    const labels = this.stageData.map((s) => s.stage);
    const values = this.stageData.map((s) => s.total);

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = values;
      this.chart.update();
      return;
    }

    this.chart = new window.Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Requests",
            data: values,
            backgroundColor: BAR_COLOR,
            borderRadius: 4,
            maxBarThickness: 18
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }
}
