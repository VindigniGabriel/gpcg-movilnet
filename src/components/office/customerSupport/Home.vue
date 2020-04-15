<template>
  <v-container fill-height grid-list-md>
    <v-layout align-center justify-center wrap>
      <v-flex xs12 class="text-right">
        <v-subheader>Atención diaria</v-subheader>
        <v-spacer></v-spacer>
        {{viewDate}}
        <v-divider></v-divider>
      </v-flex>
      <v-flex xs12>
        <MonitorQueueM/>
      </v-flex>
      <v-flex xs12 md4>
        <v-card class="mx-auto">
          <v-list shaped>
            <v-subheader>Tipo de Atención</v-subheader>
            <v-list-item-group v-model="attentionType" color="primary">
              <v-list-item v-for="(item, i) in items" :key="i">
                <v-list-item-icon>
                  <v-icon v-text="item.icon"></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="item.text"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
            <Availability />
          </v-list>
        </v-card>
      </v-flex>
      <v-flex xs12 md8>
        <v-tabs v-model="tab" centered dark icons-and-text small class="mb-2">
          <v-tabs-slider></v-tabs-slider>

          <v-tab href="#tab-1">
            Gráfica
            <v-icon>bar_chart</v-icon>
          </v-tab>

          <v-tab href="#tab-2">
            Tabla
            <v-icon>tab</v-icon>
          </v-tab>
        </v-tabs>
        <div class="Chart">
          <v-subheader>Atención {{attention}}</v-subheader>
          <template v-if="tab === 'tab-1'">
            <horizontal-bar :chart-data="dataPoints" />
          </template>
          <template v-else>
            <v-card>
              <v-card-title>
                <v-subheader>Detalle</v-subheader>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  append-icon="search"
                  label="Buscar"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
              <v-data-table
                :headers="headers"
                :items="requests"
                :search="search"
                :items-per-page="5"
              >
                <template v-slot:item.action="{ item }">
                  <v-icon small @click="viewRequest(item)" color="info">info</v-icon>
                </template>
              </v-data-table>
              <v-card-actions>
                <p class="font-weight-thin text-sm">* Según disponibilidad de aplicaciones.</p>
              </v-card-actions>
            </v-card>
          </template>
        </div>
      </v-flex>
      <v-dialog v-model="dialogObservations" width="500">
        <v-card>
          <v-card-title primary-title>
            <span class="headline">Observaciones</span>
            <v-spacer></v-spacer>
            <span>{{item + 1}}/{{lengthObservations}}</span>
          </v-card-title>

          <v-card-text>
            <p>Creado el: {{date}}</p>
            <p>{{content}}</p>
            <p>Realizado por: {{author}}</p>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              class="mr-2"
              v-show="(item > 0)"
              color="secondary"
              text
              @click="back()"
              outlined
              small
            >Anterior</v-btn>
            <v-btn
              v-if="(item + 1 < lengthObservations)"
              color="secondary"
              text
              @click="next"
              outlined
              small
            >Siguiente</v-btn>
            <v-btn
              v-else
              color="red lighten-3"
              text
              @click="dialogObservations = false"
              outlined
              small
            >Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" color="primary" fab dark small fixed bottom right @click="download">
          <v-icon>arrow_downward</v-icon>
        </v-btn>
      </template>
      <span>Descargar Req. con Atención {{attention}}</span>
    </v-tooltip>
  </v-container>
</template>

<script>
import XLSX from "xlsx";
import moment from "moment";
import { mapGetters } from "vuex";
import HorizontalBar from "@/components/chart/HorizontalBar.vue";
import MonitorQueueM from "./MonitorQueueM";
import Availability from "@/components/aplications/Availability";
export default {
  components: { HorizontalBar, Availability, MonitorQueueM },
  data: () => ({
    dialogObservations: "",
    content: "",
    date: "",
    author: "",
    item: 0,
    lengthObservations: "",
    observations: "",
    tab: null,
    dataPoints: {},
    requestsLocation: [],
    date: moment().format("LLLL"),
    items: [
      { icon: "visibility", text: "Presencial (con cita confirmada)" },
      { icon: "visibility_off", text: "No presencial" }
    ],
    attentionType: 0,
    search: "",
    requests: [],
    headers: [
      { text: "Memos", value: "action", sortable: false },
      { text: "#", value: "ticket" },
      {
        text: "Fecha de Creación",
        value: "created"
      },
      { text: "Requerimiento(s)", value: "request" },
      { text: "Tec.", value: "technologie" },
      { text: "Estatus", value: "status" }
    ]
  }),
  computed: {
    ...mapGetters([
      "getRequestsLocation",
      "getRequestsOptions",
      "getAplicationsStatus"
    ]),
    viewDate: state => state.date,
    attention: state => state.items[state.attentionType].text
  },
  watch: {
    attentionType() {
      this.updatedRequests();
    },
    getRequestsLocation() {
      this.updatedRequests();
    },
    getAplicationsStatus() {
      this.updatedRequests();
    }
  },
  methods: {
    async updatedRequests() {
      let data = {
        attentionType: this.attentionType,
        date: null
      };
      let requests = await this.$store.dispatch("setUpdatedRequests", data);
      this.requests = requests.requests;
      if (this.attentionType === 0) {
        this.fillData(
          requests.labels,
          requests.processedCount,
          requests.confirmedCount
        );
      } else {
        this.fillData(
          requests.labels,
          requests.processedCount,
          requests.pendingCount
        );
      }
    },
    fillData(labels, processed, pending) {
      this.dataPoints = {
        labels,
        datasets: [
          {
            label: "Procesados (hoy)",
            backgroundColor: "rgba(90,80,72,0.4)",
            data: processed
          },
          {
            label: "Pendientes",
            backgroundColor: "rgba(255,102,51,0.4)",
            data: pending
          }
        ]
      };
    },
    updateTimer() {
      setInterval(() => (this.date = moment().format("LLLL")), 1000);
    },
    dateRelative(fecha) {
      return moment(fecha).fromNow();
    },
    viewRequest(request) {
      this.item = 0;
      this.observations = request.observations;
      this.lengthObservations = this.observations.length;
      (this.content = this.observations[this.item].content),
        (this.date = this.observations[this.item].date),
        (this.author = this.observations[this.item].author),
        (this.dialogObservations = true);
    },
    next() {
      this.item++,
        (this.content = this.observations[this.item].content),
        (this.date = this.observations[this.item].date),
        (this.author = this.observations[this.item].author);
    },
    back() {
      this.item--,
        (this.content = this.observations[this.item].content),
        (this.date = this.observations[this.item].date),
        (this.author = this.observations[this.item].author);
    },
    download() {
      let oc = this.$store.state.user.user.locationName;
      this.$alertify.confirm(
        `¿Esta seguro que desea descargar la data asociada a "Atención ${this.attention}"?. *La información dependerá de la disponibilidad de los aplicativos.`,
        () => {
          this.$alertify.success("Iniciando descarga...");
          this.downloadExcel();
        },
        () => {
          this.$alertify.error("Operación cancelada.");
        }
      );
    },
    async downloadExcel() {
      if (this.requests.length > 0) {
        let oc = this.$store.state.user.user.locationName;
        let requests = [];
        let observations = [];
        let observation = "";

        this.requests.forEach(request => {
          request.observations.forEach((ob, index) => {
            observations.push(
              `${ob.date} - ${ob.content}. Realizado por :${ob.author}`
            );
          });
          requests.push({
            Número: request.ticket,
            Estatus: request.status,
            Cliente: request.name,
            Cédula: request.clientId,
            "Contacto 1": request.contact1,
            "Contacto 2": request.contact2,
            Requerimiento: request.request,
            "Creado por": request.author,
            Oficina: oc,
            "F. creación": request.created,
            "F. cita": request.quote,
            "F. cerrado": request.close,
            Tecnología: request.technologie,
            Télefono: request.phone,
            Plan: request.service,
            "Ult. Act.": request.update,
            Observaciones: observations.join()
          });
        });
        let date = moment().format("DD/MM/YYYY");
        let data = await XLSX.utils.json_to_sheet(requests);
        const workbook = await XLSX.utils.book_new();
        const filename = `Atención ${this.attention}`;
        XLSX.utils.book_append_sheet(workbook, data, filename);
        XLSX.writeFile(workbook, `Data_${this.attention}_${date}.xlsx`);
        //XLSX.writeFile(workbook, `Data_${this.attention}.xlsx`);
      } else {
        this.$alertify.warning(
          `No hay requerimientos asociados a "Atención ${this.attention}"`
        );
      }
    }
  },
  created() {
    this.updateTimer();
    this.updatedRequests();
  }
};
</script>

<style>
.Chart {
  padding: 20px;
  box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.4);
  border-radius: 20px;
}
</style>
