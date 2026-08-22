import { LightningElement, wire } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import CHART_JS from "@salesforce/resourceUrl/chartJs";
import getTypeSplit from "@salesforce/apex/InviteHomeController.getTypeSplit";

const COLORS = ["#635bff", "#04844b"];

export default class ApplicantTypeSplit extends LightningElement {
  individualCount = 0;
  companyCount = 0;
  errorMessage;
  chartJsLoaded = false;
  chart;

  @wire(getTypeSplit)
  wiredSplit({ data, error }) {
    if (data) {
      this.individualCount = data.individualCount;
      this.companyCount = data.companyCount;
      this.errorMessage = undefined;
      this.renderChart();
    } else if (error) {
      this.errorMessage =
        error?.body?.message ?? "Could not load applicant type split.";
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
    if (!window.Chart) {
      return;
    }
    const canvas = this.template.querySelector("canvas");
    if (!canvas) {
      return;
    }
    const values = [this.individualCount, this.companyCount];

    if (this.chart) {
      this.chart.data.datasets[0].data = values;
      this.chart.update();
      return;
    }

    this.chart = new window.Chart(canvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Individual", "Company"],
        datasets: [
          {
            data: values,
            backgroundColor: COLORS,
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
