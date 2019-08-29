<template>
  <v-container mt-5>
    <v-layout justify-center align-center wrap>
      <v-flex xs12>
        <v-subheader>
          <v-icon left>list</v-icon>Historial de la OC
        </v-subheader>
      </v-flex>
      <v-flex xs12>
        <v-card class="elevation-12">
          <v-card-title>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Buscar"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="requests"
              class="elevation-1"
              :items-per-page="25"
              :search="search"
              item-key="ticket"
            >
              <template v-slot:item.delete="{ item }">
                    <v-icon small color="red" @click="confirmDelete(item)" :disabled="item.status !== 'Pendiente'">delete</v-icon>
              </template>

              <template v-slot:item.action="{ item }">
                <v-icon small @click="viewRequest(item)" color="info">info</v-icon>
              </template>

              <template v-slot:item.updated="{ item }">{{dateRelative(item.updated)}}</template>
            </v-data-table>
          </v-card-text>
        </v-card>
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
  </v-container>
</template>

<script>
import moment from "moment";
moment.locale("es");
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      dialogObservations: false,
      content: "",
      date: "",
      author: "",
      item: 0,
      lengthObservations: "",
      observations: "",
      search: "",
      headers: [
        {
          text: "Memos",
          align: "left",
          value: "action"
        },
        {
          text: "#",
          align: "left",
          value: "ticket"
        },
        {
          text: "Fecha de Creación",
          align: "left",
          value: "created"
        },
        { text: "Estatus", value: "status" },
        { text: "Cédula", value: "clientId" },
        { text: "Usuario", value: "name" },
        { text: "Requerimiento", value: "request" },
        { text: "Línea", value: "phone", sortable: false },
        { text: "Tec.", value: "technologie", sortable: false },
        {
          text: "Ult. Actualización",
          value: "updated"
        },
        {
          text: "Eliminar",
          value: "delete"
        }
      ]
    };
  },
  computed: {
    ...mapGetters(["getUser", "getRequestsLocation"]),
    requests: state => state.getRequestsLocation.filter(r => r.status !== 'Eliminado')
  },
  methods: {
    confirmDelete(request){
      this.$alertify.confirm(
        `Esta acción eliminará el requerimiento # "${request.ticket}"`,
        () => {
          this.delete(request);
        },
        () => {
          this.$alertify.error("Operación cancelada.");
        }
      );
    },
    delete(request){
      let close = moment().format('DD/MM/YYYY')
      request.status = 'Eliminado'
      request.close = close
      this.$store.dispatch('setUpdatedStatus', request)
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
    }
  }
};
</script>
