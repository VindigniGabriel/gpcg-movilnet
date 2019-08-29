<template>
  <v-card>
    <v-card-title>
      <v-subheader>Atención no presencial</v-subheader>
    </v-card-title>
    <v-data-table :headers="headersSummary" :items="requestsSummary" hide-default-footer></v-data-table>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
export default {
  data() {
    return {
      start: moment(),
      end: moment(),
      requestsSummary: [],
      headersSummary: [
        { text: "Requerimiento", value: "request", align: "left" },
        { text: "Procesados (hoy)", value: "processedCount", align: "center" },
        { text: "Pendientes", value: "pendingCount", align: "center" }
      ]
    };
  },
  computed: {
    view: state =>
      moment(state.end.diff(state.start, "seconds") * 1000).format("mm:ss"),
    ...mapGetters(["getRequestsLocation"])
  },
  watch: {
    getRequestsLocation() {
      this.updatedRequestsNotFace();
    }
  },
  methods: {
    score() {
      this.start = moment().format("hh:mm:ss");
      setInterval(() => {
        this.end = moment();
      }, 1000);
    },
    click() {
      this.start = moment().format("hh:mm:ss");
    },
    async updatedRequestsNotFace() {
      let data = {
        attentionType: 1,
        date: null
      };
      this.requestsSummary = [];
      let requests = await this.$store.dispatch("setUpdatedRequests", data);

      requests.labels.forEach((request, i) => {
        this.requestsSummary.push({
          request: request,
          pendingCount: requests.pendingCount[i],
          processedCount: requests.processedCount[i]
        });
      });
    }
  },
  created() {
    this.updatedRequestsNotFace();
  }
};
</script>