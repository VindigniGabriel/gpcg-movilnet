<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialogRequestSetting"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      persistent
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="close">
            <v-icon>close</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="save">Guardar</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-subheader>General</v-subheader>
        <v-container grid-list-lg>
          <v-layout wrap>
            <v-flex xs12 sm6 md3>
              <v-text-field
                outlined
                shaped
                color="secondary"
                v-model="request.name"
                label="Nombre del requerimiento"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md3>
              <v-switch
                color="success"
                v-model="request.face"
                :label="`Atención presencial: ${request.face ? 'Si': 'No'}`"
              ></v-switch>
            </v-flex>
            <v-flex xs12 sm6 md3>
              <v-switch
                color="success"
                v-model="request.phone"
                :label="`Cliente actual: ${request.phone ? 'Si': 'No'}`"
              ></v-switch>
            </v-flex>
            <v-flex xs12 sm6 md3>
              <v-switch
                color="success"
                v-model="request.service"
                :label="`Activación de plan: ${request.service ? 'Si': 'No'}`"
              ></v-switch>
            </v-flex>
          </v-layout>
        </v-container>
        <v-divider></v-divider>
        <v-subheader>Asignaciones</v-subheader>
        <v-item-group multiple v-model="listTechnologie">
          <v-container grid-list-md>
            <v-layout justify-center align-center wrap>
              <v-flex v-for="(technologie, index) in technologiesAssing" :key="index" xs12 sm6>
                <v-item v-slot:default="{ active, toggle }">
                  <v-card
                    :color="technologie.aplications.length > 0? 'info' : ''"
                    class="d-flex align-center ma-5"
                    dark
                    height="50"
                    @click="toggle"
                  >
                    <v-scroll-y-transition>
                      <div
                        v-if="technologie.aplications.length > 0"
                        class="display-1 flex-grow-1 text-center"
                      >{{technologie.name}}</div>
                      <div v-else class="display-1 flex-grow-1 text-center">{{technologie.name}}</div>
                    </v-scroll-y-transition>
                  </v-card>
                </v-item>
                <v-chip-group
                  multiple
                  active-class="primary--text"
                  v-show="technologie.add"
                  v-model="technologie.aplications"
                >
                  <v-chip v-for="(aplication, i) in aplications" :key="i">{{ aplication.name }}</v-chip>
                </v-chip-group>
              </v-flex>
            </v-layout>
          </v-container>
        </v-item-group>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { db } from "@/firebase";
import { validationMixin } from "vuelidate";
import { mapGetters } from "vuex";
import moment from "moment";
export default {
  data() {
    return {
      listTechnologie: [],
      request: "", //Objeto requerimientos {name, phone, technologies, face, service}
      aplications: [], //Facturadores {name, status}
      technologiesAssing: [] // "name": Tecnologie, "add": true/false, "aplications": Ej. [ "Sinapsis" ]
    };
  },
  computed: {
    ...mapGetters([
      "dialogRequestSetting",
      "getTechnologiesOptions",
      "requestSetting",
      "edit"
    ]),
    //Valida que se agregue al menos una aplicación
    validationNewRequest: state => {
      var filter = state.technologiesAssing.filter(
        r => r.add === true && r.aplications.length > 0
      );
      return filter.length > 0 ? true : false;
    }
  },
  watch: {
    //Busca el indice seleccionado en tecnología en arreglo technologiesAssing
    listTechnologie(val) {
      this.technologiesAssing.forEach((t, i) => {
        val.includes(i)
          ? (this.technologiesAssing[i].add = true)
          : (this.technologiesAssing[i].add = false);
      });
    },
    //Actualiza estado de dialog
    dialogSettingsRequests(val) {
      val || this.close();
    },
    //Actualiza el valor de request
    requestSetting(request) {
      if (this.edit) {
        this.technologiesAssing = [];
        this.request = request;

        this.getTechnologiesOptions.forEach((t, i) => {
          var validation = request.technologies.filter(req => req.name === t.name);
          if (validation.length > 0) {
            this.listTechnologie.push(i);
            let aplications = [];
            this.aplications.forEach((app, i) => {
              if (validation[0].aplications.includes(app.name)) {
                aplications.push(i);
              }
            });

            this.technologiesAssing.push({
              name: t.name,
              add: true,
              aplications
            });
          } else {
            this.technologiesAssing.push({
              name: t.name,
              add: false,
              aplications: []
            });
          }
        });
      }
    }
  },
  methods: {
    buildRequest() {
      this.request = {
        name: "",
        phone: true,
        technologies: [],
        face: true,
        service: false
      };
    },
    save() {
      var error = false;

      if (!this.validationNewRequest) {
        this.$alertify.error("Error!. El requerimiento no posee asignación.");
        error = true;
      }

      if (this.request.name === "") {
        this.$alertify.error("Error!. El requerimiento no posee un nombre.");
        error = true;
      }

      this.request.technologies = [];

      //se inserta array de las asignaciones a request
      this.technologiesAssing.forEach(technologie => {
        if (technologie.add) {
          let aplications = this.aplications
            .filter((a, i) => technologie.aplications.includes(i))
            .map(t => t.name);
          this.request.technologies.push({
            aplications,
            name: technologie.name
          });
        }
      });

      if (!error) {
        if (this.edit) {
          this.proccessSettingsRequestEdit();
        } else {
          this.proccessSettingsRequest();
        }
      }
    },
    async proccessSettingsRequest() {
      try {
        let active = true;
        let updated = moment().format("YYYY-MM-DD HH:mm:ss");
        let user = this.$store.state.user.user.name;
        let insert = await db
          .collection("optionsRequests")
          .add(Object.assign({ updated, user, active }, this.request));
        this.$store.commit("setSnackbar", {
          active: true,
          text: `"${this.request.name}" ha sido agregado con éxito.`,
          color: "success"
        });
        this.close();
      } catch (error) {
        console.error(error);
        this.$store.commit("setSnackbar", {
          active: true,
          text: `Error!. "${this.request.name}" no logró ser creado.`,
          color: "error"
        });
        this.close();
      }
    },
    async proccessSettingsRequestEdit() {
      let updated = moment().format("YYYY-MM-DD HH:mm:ss");
      let user = this.$store.state.user.user.name;
      try {
        let edit = await db
          .collection("optionsRequests")
          .doc(this.request.id)
          .update(Object.assign({ updated, user }, this.request));
        this.$store.commit("setSnackbar", {
          active: true,
          text: `"${this.request.name}" ha sido actualizado con éxito.`,
          color: "success"
        });
        this.close();
      } catch (error) {
        console.error(error);
        this.$store.commit("setSnackbar", {
          active: true,
          text: `Error!. "${this.request.name}" no logró ser actualizado.`,
          color: "error"
        });
        this.close();
      }
    },
    close() {
      this.listTechnologie = [];
      this.$store.commit("setRequestDialog", {
        open: false
      });
      this.updateTechnologiesAssing();
    },
    updateTechnologiesAssing() {
      this.technologiesAssing = [];

      this.getTechnologiesOptions.forEach(technologie => {
        this.technologiesAssing.push({
          name: technologie.name,
          add: false,
          aplications: []
        });
      });

      this.buildRequest();
    },
    async init() {
      try {
        this.aplications = []; //Facturadores {name, status}
        let apps = await db.collection("aplications").get();
        apps.forEach(app => {
          this.aplications.push(app.data());
        });

        this.updateTechnologiesAssing();
      } catch (error) {
        console.error(error);
      }
    }
  },
  created() {
    this.init();
  }
};
</script>
