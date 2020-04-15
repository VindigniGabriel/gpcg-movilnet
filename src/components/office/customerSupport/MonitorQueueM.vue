<template>
  <div class="Chart">
    <v-layout justify-space-between>
      <v-flex xs6 sm4>
        <v-subheader>Monitor Gestión de Cola {{ocLocation}}</v-subheader>
      </v-flex>
    </v-layout>
    <v-data-table :headers="headersUsers" :items="usersQueueM" hide-default-footer>
      <template v-slot:item.status="{ item }">
        <v-chip color="success" dark v-if="!item.updated">{{item.requestName}}</v-chip>
        <v-chip color="warning" dark v-else>{{item.requestName}}</v-chip>
      </template>
      <template v-slot:item.updated="{ item }">{{item.updated? tempo(item.updated) : '00:00:00'}}</template>
      <template v-slot:item.tta="{ item }">{{item.tta}}</template>
    </v-data-table>
  </div>
</template>

<script>
import moment from "moment";
import { db } from "@/firebase";
export default {
  data() {
    return {
      users: [],
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
    usersQueueM: state => state.users,
    view: state => state.new  },
  methods: {
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
    filldata() {
      let ticket = `${this.$store.state.user.user.locationCode}-`;
      let officeId = this.$store.state.user.user.locationId;
      let updated = null;
      let requestName = "Disponible";
      db.collection("usersApp")
        .where("locationId", "==", officeId)
        .where("admin", "==", false)
        .where("active", "==", true)
        .get()
        .then(snapshot => {
          this.users = [];
          snapshot.forEach(user => {
            this.users.push(
              Object.assign(
                {},
                {
                  id: user.id,
                  name: user.data().name
                }
              )
            );
            this.day(user.id);
            this.requestsDay(user.id);
          });
        });
    },
    requestsDay(userId) {
      let day = moment().format("DD/MM/YYYY");
      let requests = db
        .collection("clientsRequests")
        .where("block", "==", userId)
        .where("close", "==", day)
        .onSnapshot(s => {
          let t = 0;
          let tn = 0;
          let tta = 0;
          let tma = 0;
          let day = s.size;
          let index = this.users.findIndex(u => u.id === userId);
          if (s.empty) {
            this.users.splice(
              index,
              1,
              Object.assign(this.users[index], { day, tta, tma })
            );
          } else {
            s.forEach(rq => {
              t = rq.data().ta.split(":");
              tn = t[0] * 3600 + t[1] * 60 + (+t[2] || 0);
              tta = tta + tn;
              tma = tta / day;
              this.users.splice(
                index,
                1,
                Object.assign(this.users[index], {
                  day,
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
                })
              );
            });
          }
        });
    },
    day(userId) {
      db.collection("clientsRequests")
        .where("block", "==", userId)
        .where("close", "==", null)
        .onSnapshot(s => {
          let ticket = `${this.$store.state.user.user.locationCode}-`;
          let updated = null;
          let requestName = "Disponible";
          let index = this.users.findIndex(u => u.id === userId);
          if (s.empty) {
            this.users.splice(
              index,
              1,
              Object.assign(this.users[index], { updated, requestName, ticket })
            );
          } else {
            s.forEach(r => {
              this.users.splice(
                index,
                1,
                Object.assign(this.users[index], {
                  updated: r.data().updated,
                  requestName: r.data().request,
                  ticket: r.data().ticket
                })
              );
            });
          }
        });
    }
  },
  mounted() {
    this.filldata();
  }
};
</script>