<template>
  <div>
    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" color="primary" fab dark small fixed bottom right @click="dialog = true">
          <v-icon>person_pin</v-icon>
        </v-btn>
      </template>
      <span>Módulo de atención</span>
    </v-tooltip>
    <v-dialog v-model="dialog" width="500" persistent fullscreen>
      <v-card>
        <v-card-title primary-title>
          <span class="headline">Gestión de Cola.</span>
          <v-spacer></v-spacer>
          <span class="app-font">{{active !== null ? tempo(active.updated) : '00:00:00'}}</span>
        </v-card-title>
        <v-card-text v-if="active !== null">
          <v-list-item four-line>
            <v-list-item-content>
              <v-list-item-title>Datos del cliente</v-list-item-title>
              <v-list-item-subtitle>Nombre: {{active.name}}</v-list-item-subtitle>
              <v-list-item-subtitle>Cédula: {{active.clientId}}</v-list-item-subtitle>
              <v-list-item-subtitle>Contacto 1: {{active.contact1}}</v-list-item-subtitle>
              <v-list-item-subtitle>Contacto 2: {{active.contact2}}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item four-line>
            <v-list-item-content>
              <v-list-item-title>Datos del requerimiento</v-list-item-title>
              <v-list-item-subtitle># {{active.ticket}}</v-list-item-subtitle>
              <v-list-item-subtitle>Requerimiento: {{active.request}}</v-list-item-subtitle>
              <v-list-item-subtitle>Línea: {{active.phone}}</v-list-item-subtitle>
              <v-list-item-subtitle>Tecnología: {{active.technologie}}</v-list-item-subtitle>
              <v-list-item-subtitle>Activación de plan: {{active.service}}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-card v-if="active !== null">
            <v-card-title class="title font-weight-regular justify-space-between">
              <v-subheader>Observaciones</v-subheader>
              <v-avatar color="primary" class="subheading white--text" size="24" v-text="step"></v-avatar>
            </v-card-title>
            <v-card-text>
              <v-window v-model="step">
                <v-window-item
                  :value="index + 1"
                  v-for="(observation, index) in active.observations"
                  :key="index"
                >
                  <v-card>
                    <v-list-item>
                      <v-list-item-title avatar>
                        <v-list-item-content>
                          <v-list-item-title>Creado el: {{observation.date}}</v-list-item-title>
                          <v-list-item-title>Autor: {{observation.author}}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item-title>
                    </v-list-item>
                    <v-container>
                      <span>{{observation.content}}</span>
                    </v-container>
                  </v-card>
                </v-window-item>
              </v-window>
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions>
              <v-btn
                :disabled="step === 1"
                @click="step--"
                small
                outlined
                text
                color="secondary"
              >Anterior</v-btn>
              <v-spacer></v-spacer>
              <v-btn
                :disabled="step === active.observations.length"
                color="secondary"
                depressed
                @click="step++"
                small
                outlined
                text
              >Siguiente</v-btn>
            </v-card-actions>
          </v-card>
        </v-card-text>
        <v-divider></v-divider>

        <v-bottom-navigation>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn @click="close()" v-on="on">
                <span>Cancelar</span>
                <v-icon color="red">close</v-icon>
              </v-btn>
            </template>
            <span>Cancelar atención.</span>
          </v-tooltip>

          <v-tooltip top v-for="(item, i) in statusOptions" :key="i">
            <template v-slot:activator="{ on }">
              <v-btn
                v-show="active !== null"
                v-on="on"
                @click="confirmSave(status = {id :item.id, name: item.name})"
              >
                <span v-text="item.name"></span>
                <v-icon color="warning" v-text="item.icon"></v-icon>
              </v-btn>
            </template>
            <span v-text="item.description"></span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click="nextClient"
                :disabled="requestsSlopes.length === 0 || nextBtn"
              >
                <span>Próximo</span>
                <v-icon color="primary">navigate_next</v-icon>
              </v-btn>
            </template>
            <span>Siguiente requerimiento en cola.</span>
          </v-tooltip>
        </v-bottom-navigation>
        <v-card-text class="text-center" v-show="requestsSlopes.length === 0 && active === null">
          <span>No exiten requerimientos en cola.</span>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
export default {
  data: () => ({
    new: null,
    nextBtn: false,
    request: null,
    requestQueueM: [],
    userUid: null,
    requestsSlopes: [],
    dialog: false,
    step: 1
  }),
  computed: {
    active: state => state.getQueueRequest,
    ...mapGetters([
      "getRequestsLocation",
      "getAplicationsStatus",
      "getStatusOptions",
      "getQueueRequest"
    ]),
    statusOptions: state => state.getStatusOptions.filter(s => s.face === false)
  },
  watch: {
    getRequestsLocation() {
      this.updatedRequestsNotFace();
    },
    getAplicationsStatus() {
      this.updatedRequestsNotFace();
    }
  },
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
    async updatedRequestsNotFace() {
      let data = {
        attentionType: 1,
        date: null
      };

      let requests = await this.$store.dispatch("setUpdatedRequests", data);

      this.requestsSlopes = requests.requests.filter(
        r => r.status === "Pendiente"
      );
    },
    nextClient() {
      let requests = this.requestsSlopes;
      //Obtener el primero según fecha de creación
      let request = requests.sort(function(a, b) {
        return new Date(a.created) - new Date(b.created);
      });

      if (request.length > 0) {
        this.$store.dispatch("nextClient", request[0].id);
        this.nextBtn = true;
      }
    },
    confirmSave(status) {
      this.$alertify.confirm(
        `Actualizar requerimiento a "${status.name}"`,
        () => {
          this.save(status.id);
        },
        () => {
          this.$alertify.error("Operación cancelada.");
        }
      );
    },
    save(statusId) {
      let status = {
        id: statusId,
        ta: this.new
      };
      this.$store.dispatch("solutionRequest", status);
      this.nextBtn = false;
    },
    close() {
      this.nextBtn = false;
      this.dialog = false;
      if (this.getQueueRequest !== null) {
        this.$store.dispatch("closeClient");
      }
    }
  },
  created() {
    this.dialog = false;
    this.userUid = this.$store.state.user.user.uid;
    this.updatedRequestsNotFace();
    this.$store.dispatch("listenersQueueM");
  }
};
</script>