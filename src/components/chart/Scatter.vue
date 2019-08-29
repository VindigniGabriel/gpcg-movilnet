<script>
import { Line } from "./BaseCharts";
import { reactiveProp } from "./mixins";

export default {
  extends: Line,
  mixins: [reactiveProp],
  data: () => ({
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  }),
  mounted() {
    this.renderChart(this.chartData, this.options);
  }
};
</script>