<template>
  <v-container fill-height grid-list-xl>
    <v-layout justify-center align-center wrap>
      <v-flex xs12>
        <v-subheader>Estadísticas</v-subheader>
        <v-divider></v-divider>
      </v-flex>
      <v-flex xs12>
        <MonitorQueueM/>
      </v-flex>
      <v-flex xs12 sm6>
        <ChartFace />
      </v-flex>
      <v-flex xs12 sm6>
        <ChartFaceNot />
      </v-flex>
      <v-flex xs12>
        <ChartTotal />
      </v-flex>
      <v-flex xs12 sm6>
        <ChartStatusFace />
      </v-flex>
      <v-flex xs12 sm6>
        <ChartStatusFaceNot />
      </v-flex>
    </v-layout>
    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" color="primary" fab dark small fixed bottom right @click="download">
          <v-icon>arrow_downward</v-icon>
        </v-btn>
      </template>
      <span>Descargar Data</span>
    </v-tooltip>
  </v-container>
</template>

<script>
import XLSX from "xlsx";
import ChartTotal from "./ChartTotal";
import ChartFace from "./ChartFace";
import ChartFaceNot from "./ChartFaceNot";
import ChartStatusFace from "./ChartStatusFace";
import ChartStatusFaceNot from "./ChartStatusFaceNot";
import MonitorQueueM from "./MonitorQueueM";
import { mapGetters } from 'vuex';
export default {
  data: () => ({}),
  components: {
    ChartTotal,
    ChartFace,
    ChartFaceNot,
    ChartStatusFace,
    ChartStatusFaceNot,
    MonitorQueueM
  },
  computed: {
    ...mapGetters(['getRequestsLocation'])
  },
  methods: {
    download() {
      let oc = this.$store.state.user.user.locationName;
      this.$alertify.confirm(
        `¿Esta seguro que desea descargar el historial de ${oc}?`,
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
      let oc = this.$store.state.user.user.locationName;
      let requests = [];
      let observations = [];
      let observation = "";

      this.getRequestsLocation.forEach(request => {
        request.observations.forEach((ob, index) => {
          observations.push(
            `${ob.date} - ${ob.content}. Realizado por :${ob.author}`
          );
        });
        requests.push({
          Numero: request.ticket,
          Usuario: request.name,
          Cédula: request.clientId,
          "Contacto 1": request.contact1,
          "Contacto 2": request.contact2,
          Requerimiento: request.request,
          "Creado por": request.author,
          Oficina: oc,
          Estatus: request.status,
          "F. creación": request.created,
          "F. cita": request.quote,
          "F. cerrado": request.close,
          Tecnología: request.technologie,
          Télefono: request.phone,
          Plan: request.service,
          "Ult. Act.": request.updated,
          Observaciones: observations.join(),
          TA: request.ta
        });
      });
      let data = await XLSX.utils.json_to_sheet(requests);
      const workbook = await XLSX.utils.book_new();
      const filename = "Requerimientos";
      XLSX.utils.book_append_sheet(workbook, data, filename);
      XLSX.writeFile(workbook, `Data_${oc}.xlsx`);
    }
  }
};
</script>