<template>
  <div>
    <v-card>
      <v-card-title>
        <v-subheader>Atención presencial</v-subheader>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="search" label="Buscar" single-line hide-details></v-text-field>
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
        <template v-slot:item.go="{ item }">
          <v-checkbox
            :disabled="item.status !== 'con Cita confirmada'"
            :input-value="item.block && item.status === 'en proceso...'"
            color="info"
            label="En sitio"
            @change="addQueueM(item)"
          ></v-checkbox>
        </template>
      </v-data-table>
    </v-card>
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
  </div>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      dialogObservations: false,
      requestObservations: null,
      dialogObservations: false,
      content: "",
      date: "",
      author: "",
      item: 0,
      lengthObservations: "",
      observations: "",
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
        { text: "Agregar a cola", value: "go" }
      ]
    };
  },
  computed: {
    ...mapGetters(["getRequestsLocation", "getAplicationsStatus"])
  },
  watch: {
    getRequestsLocation() {
      this.updatedQuote();
    },
    getAplicationsStatus() {
      this.updatedQuote();
    }
  },
  methods: {
    addQueueM(req) {
      this.$store.dispatch("closeClient");

      if (req.block !== null) {
        this.$store.dispatch("closeClient");
      } else {
        this.$store.dispatch("nextClient", req.id);
      }
    },
    async updatedQuote() {
      let data = {
        attentionType: 0,
        date: moment().format("DD/MM/YYYY")
      };
      let requests = await this.$store.dispatch("setUpdatedRequests", data);
      this.requestsDetails = requests.requests;
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
  },
  created() {
    this.updatedQuote(); //Obtengo los requerimientos citados a la fecha seleccionada
  }
};
</script>