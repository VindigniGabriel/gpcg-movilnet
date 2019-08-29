<template>
  <div class="Chart">
    <v-layout justify-space-between>
      <v-flex xs6 sm4>
        <v-subheader>Monitor Gestión de Cola {{ocLocation}}</v-subheader>
      </v-flex>
      <v-flex xs6 sm4>{{viewDate}}</v-flex>
    </v-layout>
    <v-data-table :headers="headersUsers" :items="usersQueueM" hide-default-footer>
      <template v-slot:item.status="{ item }">
        <v-chip color="success" dark v-if="!item.status">Disponible</v-chip>
        <v-chip color="warning" dark v-else>{{item.request}}</v-chip>
      </template>
      <template v-slot:item.updated="{ item }">{{item.status? tempo(item.updated) : item.updated}}</template>
      <template v-slot:item.tta="{ item }">{{item.tta}}</template>
    </v-data-table>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import moment from "moment";
export default {
  data() {
    return {
      ocLocation: this.$store.state.user.user.locationCode,
      new: null,
      date: moment().format("LLLL"),
      timer: moment().format("YYYY-MM-DD HH:mm:ss"),
      monitor: [],
      headersUsers: [
        { text: "Nombre", value: "name", align: "left" },
        { text: "Estatus", value: "status", align: "center" },
        { text: "#", value: "ticket", align: "center" },
        { text: "TA", value: "updated", align: "center" },
        { text: "Req. procesados", value: "day", align: "center" },
        { text: "TMA", value: "tma", align: "center" },
        { text: "TTA", value: "tta", align: "center" }
      ]
    };
  },
  computed: {
    ...mapGetters(["getQueueManager"]),
    usersQueueM: state => state.monitor,
    view: state => state.new,
    viewDate: state => state.date
  },
  watch: {
    getQueueManager() {
      this.filldate();
    }
  },

  methods: {
    updateTimer() {
      setInterval(() => (this.date = moment().format("LLLL")), 60000);
    },
    tempo(timer) {
      var timerOld = moment(timer).format("hh:mm:ss");
      var a = timerOld.split(":");
      let timerOldConvert = a[0] * 3600 + a[1] * 60 + (+a[2] || 0);
      let test = setInterval(() => {
        var timerNew = moment().format("hh:mm:ss");
        var b = timerNew.split(":");
        let timerNewConvert = b[0] * 3600 + b[1] * 60 + (+b[2] || 0);
        let seconds = timerNewConvert - timerOldConvert;
        this.new = moment()
          .hours(0)
          .minutes(0)
          .seconds(seconds)
          .format("HH:mm:ss");
      }, 1000);
      return this.new;
    },
    filldate() {
      
      this.updateTimer();
      let close = moment().format("DD/MM/YYYY");
      let usersQueueM = [];
      let now = [];
      let total = [];
      let status = false;
      let day = 0;
      let updated = "00:00:00";
      let tta = 0;
      let tma = 0;
      let request = null;
      let ticket = `${this.ocLocation}-`
      this.getQueueManager.users.forEach((user, i) => {
        //Requerimiento atendido en el momento
        now = this.getQueueManager.requests.filter(
          r => r.block === user.id && r.close === null
        );
        //Requerimientos atendidos en el día
        total = this.getQueueManager.requests.filter(
          r => r.block === user.id && r.close === close
        );

        day = total.length;
        if (total.length > 0) {
          let t = null;
          let tn = null;
          total.forEach(rq => {
            t = rq.ta.split(":");
            tn = t[0] * 3600 + t[1] * 60 + (+t[2] || 0);
            tta = tta + tn;
            tma = tta / day;
          });
        }

        if (now.length > 0) {
          status = true;
          updated = now[0].updated;
          request = now[0].request;
          ticket = now[0].ticket;
        }
        usersQueueM.push({
          name: user.name,
          status,
          request,
          ticket,
          day,
          updated,
          tma: moment()
            .hours(0)
            .minutes(0)
            .seconds(tma)
            .format("HH:mm:ss"),
          tta: moment()
            .hours(0)
            .minutes(0)
            .seconds(tta)
            .format("HH:mm:ss")
        });
      });

      this.monitor = usersQueueM;
    }
  },
  mounted() {
    this.filldate();
  }
};
</script>