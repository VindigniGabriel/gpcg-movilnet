<template>
  <div class="Chart">
    <v-subheader>Requerimientos por status At. no presencial</v-subheader>
    <Radar :chart-data="dataPoints" />
    <v-select
      v-model="options"
      :items="requests"
      multiple
      chips
      hint="Seleccione requerimientos (máx 2)"
      persistent-hint
      v-on:input="limiter"
      item-text="name"
    ></v-select>
  </div>
</template>

<script>
import Radar from "@/components/chart/Radar.vue";
import moment from "moment";
import { mapGetters } from "vuex";
export default {
  components: {
    Radar
  },
  data() {
    return {
      options: [],
      dataPoints: {},
      datasets: [
        {
          label: "",
          backgroundColor: "rgba(90,80,72,0.2)",
          borderColor: "rgba(90,80,72,1)",
          pointBackgroundColor: "rgba(90,80,72,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(90,80,72,1)",
          data: []
        },
        {
          label: "",
          backgroundColor: "rgba(255,102,51,0.2)",
          borderColor: "rgba(255,102,51,1)",
          pointBackgroundColor: "rgba(255,102,51,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(255,102,51,1)",
          data: []
        }
      ]
    };
  },
  computed: {
    ...mapGetters([
      "getRequestsLocation",
      "getRequestsOptions",
      "getStatusOptions"
    ]),
    datasetsL: state => state.datasets,
    requests: state => state.getRequestsOptions.filter(o => o.face === false),
    requestsFilter: state =>
      state.getRequestsOptions
        .filter(o => o.face === false && state.options.includes(o.name))
        .map(r => r.name)
  },
  watch: {
    getRequestsLocation() {
      this.fillData();
    },
    requestsFilter() {
      this.fillData();
    }
  },
  methods: {
    limiter(e) {
      if (e.length > 2) {
        e.pop();
        this.$alertify.error("Puede seleccionar un máximo 2 requerimientos");
      }
    },
    fillData() {
      if (this.options.length < 1) {
        this.options = this.getRequestsOptions
          .filter(o => o.face === false)
          .map(r => r.name)
          .slice(0, 2);
      }

      let count = 0;
      let label = null;
      let data = [];
      let datasets = [];
      let labels = this.getStatusOptions
        .filter(s => s.face === false || s.face === "n/a")
        .map(r => r.name);
      let requests = null;

      this.requestsFilter.forEach((request, i) => {
        data = [];
        this.datasetsL[i].data = [];
        this.datasetsL[i].label = null;
        this.datasetsL[i].label = request;
        requests = this.getRequestsLocation.filter(r => r.request === request);

        labels.forEach(st => {
          count = requests.filter(rq => rq.status === st).length;
          this.datasetsL[i].data.push(count);
        });
      });

      this.dataPoints = {
        labels,
        datasets: this.datasetsL
      };
    }
  },
  mounted() {
    this.fillData();
  }
};
</script>