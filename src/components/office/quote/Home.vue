<template>
  <v-container fill-height grid-list-md>
    <v-layout align-center justify-center wrap>
      <v-flex xs12 class="text-right">
        <v-subheader>Gestión de citas</v-subheader>
        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-icon right large color="primary" v-on="on" @click="save">save</v-icon>
          </template>
          <span>Guardar cambios</span>
        </v-tooltip>
        <v-divider></v-divider>
      </v-flex>
      <v-flex xs12 md5 class="text-center">
        <v-date-picker
          v-model="date"
          :reactive="true"
          locale="es"
          color="primary"
          @input="updatedQuote"
          :min="today"
        ></v-date-picker>
      </v-flex>
      <v-flex xs12 md7>
        <v-data-table :headers="headersSummary" :items="requestsSummary" :items-per-page="5">
          <template v-slot:item.addition="{ item }">
            <v-tooltip left>
              <template v-slot:activator="{ on }">
                <v-icon
                  v-on="on"
                  small
                  color="blue"
                  @click="item.assign++; item.onHoldCount++; item.pendingCount--"
                  :disabled="item.pendingCount === 0"
                >add</v-icon>
              </template>
              <span>Agregar para el {{dateFormat}}</span>
            </v-tooltip>
          </template>
          <template v-slot:item.subtract="{ item }">
            <v-tooltip left>
              <template v-slot:activator="{ on }">
                <v-icon
                  small
                  v-on="on"
                  @click="item.assign--; item.onHoldCount--; item.pendingCount++"
                  color="red"
                  :disabled="item.assign === 0"
                >remove</v-icon>
              </template>
              <span>Quitar del {{dateFormat}}</span>
            </v-tooltip>
          </template>
          <template v-slot:footer>
            <tr>
              <td :colspan="headersSummary.length">
                <v-icon small left color="blue">add</v-icon>Existe(n) requerimiento(s) pendientes
              </td>
              <td :colspan="headersSummary.length">
                <v-icon small left :disabled="true">add</v-icon>No existe requerimiento pendiente
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs12 class="text-right">
        <v-subheader>Detalle de los requerimientos asignados para el {{dateFormat}}</v-subheader>
        <v-spacer></v-spacer>
        <v-divider></v-divider>
      </v-flex>
      <v-flex xs12>
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
            :headers="headersDetails"
            :items="requestsDetails"
            :search="search"
            :items-per-page="5"
          >
            <template v-slot:item.action="{ item }">
              <v-icon small @click="viewRequest(item)" color="info">info</v-icon>
            </template>
            <template v-slot:item.confirmed="{ item }">
              <v-checkbox
                :input-value="item.status !== 'con Cita por confirmar'"
                color="info"
                @change="updatedStatus(item)"
              ></v-checkbox>
            </template>
            <template v-slot:item.calendar="{ item }">
              <v-icon
                small
                color="info"
                :disabled="item.close != null"
                @click="changeQuote(item)"
              >calendar_today</v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>
      <v-dialog v-model="dialogChangeQuote" width="500">
        <v-card>
          <v-card-title primary-title>
            <span class="headline">Reasignar Cita</span>
          </v-card-title>

          <v-card-text class="text-center p-4">
            <v-date-picker
              v-model="dateChangeQuote"
              :reactive="true"
              locale="es"
              color="primary"
              :min="today"
            ></v-date-picker>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Mover cita {{dateQuote}} a {{dateFormatChangeQuote}}</v-list-item-title>
                <v-list-item-subtitle>{{dateRelative(dateChangeQuote)}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="secondary" text @click="processChangeQuote" outlined small>Procesar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
import { mapGetters } from "vuex";
moment().format();
export default {
  data() {
    return {
      dialogChangeQuote: false,
      dateQuote: null, //Fecha actual
      dateChangeQuote: null, //Fecha a asignar,
      requestId: null, //Obtiene el ID del requerimiento que se le cambiara la fecha de la cita
      requestTicket: null,
      requestObservations: null,
      dialogObservations: false,
      content: "",
      date: "",
      author: "",
      item: 0,
      lengthObservations: "",
      observations: "",
      today: moment().format("YYYY-MM-DD"),
      date: moment().format("YYYY-MM-DD"),
      search: "",
      requestsDetails: [],
      headersDetails: [
        { text: "Memos", value: "action", sortable: false },
        { text: "#", value: "ticket" },
        {
          text: "Fecha de Creación",
          value: "created"
        },
        { text: "Requerimiento(s)", value: "request" },
        { text: "Tec.", value: "technologie" },
        { text: "Estatus", value: "status" },
        { text: "Cita Confirmada", value: "confirmed" },
        { text: "Cambiar cita", value: "calendar" }
      ],
      requestsSummary: [],
      headersSummary: [
        { text: "Citar", value: "addition", align: "center" },
        { text: "Quitar", value: "subtract", align: "left" },
        { text: "Requerimiento", value: "request", align: "left" },
        { text: "Confirmado", value: "confirmedCount", align: "center" },
        { text: "Por Confirmar", value: "onHoldCount", align: "center" },
        { text: "Procesado", value: "processedCount", align: "center" },
        { text: "Pendientes", value: "pendingCount", align: "center" }
      ]
    };
  },
  computed: {
    ...mapGetters(["getRequestsLocation", "getAplicationsStatus"]),
    dateFormat: state => moment(state.date).format("DD/MM/YYYY"),
    dateFormatChangeQuote: state =>
      moment(state.dateChangeQuote).format("DD/MM/YYYY")
  },
  watch: {
    getRequestsLocation(val) {
      this.updatedQuote();
    },
    getAplicationsStatus(val) {
      this.updatedQuote();
    }
  },
  methods: {
    updatedStatus(req) {
      if (req.status === "con Cita confirmada") {
        let request = {
          id: req.id,
          status: "con Cita por confirmar",
          observations: req.observations,
          ticket: req.ticket
        };
        this.$store.dispatch("setUpdatedStatus", request);
      } else {
        let request = {
          id: req.id,
          status: "con Cita confirmada",
          observations: req.observations,
          ticket: req.ticket
        };
        this.$store.dispatch("setUpdatedStatus", request);
      }
    },
    async updatedQuote() {
      let date = moment(this.date).format("DD/MM/YYYY");
      let data = {
        attentionType: 0,
        date
      };
      let requests = await this.$store.dispatch("setUpdatedRequests", data);
      this.requestsSummary = [];

      this.requestsDetails = this.getRequestsLocation.filter(
        r => r.quote === date
      );
      //this.requestsDetails = requests.requests.concat(requests.requestsOnHold);

      requests.labels.forEach((request, i) => {
        this.requestsSummary.push({
          request: request,
          confirmedCount: requests.confirmedCount[i],
          pendingCount: requests.pendingCount[i],
          onHoldCount: requests.onHoldCount[i],
          processedCount: requests.processedCount[i],
          assign: 0
        });
      });
    },
    dateRelative(fecha) {
      return moment(fecha).fromNow();
    },
    changeQuote(request) {
      this.requestId = request.id;
      this.requestTicket = request.ticket;
      this.requestObservations = request.observations;
      let date = moment(request.quote, "DD.MM.YYYY").format("YYYY-MM-DD");
      this.dateQuote = request.quote;
      this.dateChangeQuote = date;
      this.dialogChangeQuote = true;
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
    processChangeQuote() {
      this.dialogChangeQuote = false;
      let request = {
        quote: this.dateFormatChangeQuote,
        id: this.requestId,
        ticket: this.requestTicket,
        observations: this.requestObservations,
        oldQuote: this.dateQuote
      };
      this.$store.dispatch("updatedRequestQuote", request);
    },
    save() {
      let quotesRequests = this.requestsSummary.filter(r => r.assign > 0);
      let quotes = [];
      if (quotesRequests.length > 0) {
        quotesRequests.forEach(r => {
          let requestsGet = this.getRequestsLocation
            .filter(rq => {
              return (
                rq.request === r.request &&
                rq.status === "Pendiente" &&
                (rq.quote === this.dateFormat || rq.quote === null)
              );
            })
            .slice(0, r.assign);

          requestsGet.forEach(q => {
            quotes.push(q);
          });
        });

        let requests = {
          date: this.dateFormat,
          quotes
        };

        this.$store.dispatch("assignQuotesRequests", requests);
      } else {
        this.$store.commit("setSnackbar", {
          active: true,
          text: `Debe asignar por lo menos un requerimiento a la fecha seleccionada.`,
          color: "info"
        });
      }
    }
  },
  created() {
    this.updatedQuote(); //Obtengo los requerimientos citados a la fecha seleccionada
    this.$store.dispatch("updateRequestsQuoteNotProcessed"); //Actualiza requerimientos antes del día actual en estatus: con cita
  }
};
</script>
