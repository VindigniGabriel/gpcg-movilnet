<template>
  <div class="Chart">
    <v-subheader>Requerimientos At. no presencial</v-subheader>
    <horizontal-bar :chart-data="dataPoints" />
  </div>
</template>

<script>
import HorizontalBar from "@/components/chart/Bar.vue";
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
    ...mapGetters([
      "getRequestsLocation",
      "getRequestsOptions",
      "getStatusOptions"
    ])
  },
  watch: {
    getRequestsLocation() {
      this.fillData();
    }
  },
  methods: {
    fillData() {
      let labels = [];
      let requestsClose = [];
      let requestsOpen = [];
      let close = null;
      let open = null;
      let openStatus = this.getStatusOptions
        .filter(s => s.close === true)
        .map(r => r.name);
      let closeStatus = this.getStatusOptions
        .filter(s => s.close === false)
        .map(r => r.name);

      this.getRequestsOptions
        .filter(r => r.face === false)
        .forEach(request => {
          //Nombre de los requeriemientos
          labels.push(request.name);

          open = this.getRequestsLocation.filter(
            r => r.request === request.name && openStatus.includes(r.status)
          ).length;

          close = this.getRequestsLocation.filter(
            r => r.request === request.name && closeStatus.includes(r.status)
          ).length;

          requestsOpen.push(open);
          requestsClose.push(close);

        });

      this.dataPoints = {
        labels,
        datasets: [
          {
            label: "Procesados",
            data: requestsOpen,
            backgroundColor: "rgba(90,80,72,0.4)"
          },
          {
            label: "Pendientes",
            data: requestsClose,
            backgroundColor: "rgba(255,102,51,0.4)"
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
