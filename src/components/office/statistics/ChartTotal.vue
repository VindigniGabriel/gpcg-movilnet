<template>
  <div class="Chart">
    <v-subheader>Requerimientos por día (mes actual)</v-subheader>
    <horizontal-bar :chart-data="dataPoints" />
  </div>
</template>

<script>
import HorizontalBar from "@/components/chart/Scatter.vue";
import moment from "moment";
import { mapGetters } from "vuex";
export default {
  components: {
    HorizontalBar
  },
  data() {
    return {
      dataPoints: {}
    };
  },
  computed: {
    ...mapGetters(["getRequestsLocation"]),
    view: state =>
      moment(state.data)
        .add(1, "day")
        .format("YYYY-MM-DD")
  },
  watch: {
    getRequestsLocation() {
      this.fillData();
    }
  },
  methods: {
    fillData() {
      let labels = [];
      let dataMonth = [];
      let dataDay = [];
      let dataTrend = [];
      let countTotal = 0;
      let label = null;
      let days = 0;
      let dayName = null;
      let d = null;
      let startMonthDay = moment()
        .startOf("month")
        .format("YYYY-MM-DD");
      let endMonthDay = moment().format("YYYY-MM-DD");
      let endDay = moment()
        .endOf("month")
        .format("DD");
      let today = moment().format("DD");
      for (let day = 0; day < endDay; day++) {
        d = moment(startMonthDay)
          .add(day, "day")
          .format("DD/MM/YYYY");

        let countRequests = this.getRequestsLocation.filter(
          r => r.created === d
        ).length;
        countTotal = countTotal + countRequests;
        dataMonth.push(countRequests);
        days = day + 1;
        label = days.toString();

        if (label.length < 2) {
          label = "0" + label;
        }

        labels.push(label);

        if (day === today - 1) {
          dataDay.push(countRequests);
        } else {
          dataDay.push(0);
        }
      }

      for (let day = 0; day < endDay; day++) {
        dataTrend.push(countTotal / endDay);
      }

      this.dataPoints = {
        labels,
        datasets: [
          {
            label: "Hoy",
            data: dataDay,
            backgroundColor: "rgba(255,102,51,0.4)"
          },
          {
            label: "Días",
            borderColor: "#F5F5F5",
            backgroundColor: "rgba(90,80,72,0.4)",
            data: dataMonth
          },
          {
            label: "Promedio",
            borderColor: "#90CAF9",
            backgroundColor: "rgba(0,0,0,0)",
            data: dataTrend
          }
        ]
      };
    }
  },
  mounted() {
    this.fillData();
  }
};
</script>