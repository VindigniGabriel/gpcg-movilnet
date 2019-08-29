<template>
  <v-dialog v-model="getDialogNewRequest" max-width="500px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">Agregar Requerimiento</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm8>
              <v-autocomplete
                v-model="request"
                :items="getRequestsOptions"
                label="Requerimiento"
                persistent-hint
                color="secondary"
                :error-messages="requestErrors"
                @input="$v.request.$touch()"
                @blur="$v.request.$touch()"
                @change="selectedRequest"
                item-text="name"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs12 sm4>
              <v-autocomplete
                v-model="technologie"
                :items="requestClient.technologies"
                label="Técnologia"
                color="secondary"
                :error-messages="technologieErrors"
                @input="$v.technologie.$touch()"
                @blur="$v.technologie.$touch()"
                item-text="name"
                @change="selectedTechnologie"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs12 sm6>
              <v-text-field
                v-model="phone"
                :label="labelPhone"
                hint="Ejemplo. (416) xxx - xxxx"
                single-line
                v-mask="mask"
                color="secondary"
                type="tel"
                :error-messages="phoneErrors"
                @input="$v.phone.$touch()"
                @blur="$v.phone.$touch()"
                :disabled="!requestClient.phone"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6>
              <v-autocomplete
                v-model="service"
                :items="services"
                label="Solicitud de plan"
                color="secondary"
                :error-messages="serviceErrors"
                @input="$v.service.$touch()"
                @blur="$v.service.$touch()"
                item-text="name"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs12>
              <v-textarea
                filled
                name="input-7-4"
                label="Observaciones"
                color="secondary"
                v-model="observations"
                :counter="60"
                :error-messages="observationsErrors"
                @input="$v.observations.$touch()"
                @blur="$v.observations.$touch()"
              ></v-textarea>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-layout justify-space-around wrap class="text-center">
          <v-flex xs12 sm4 class="ma-1">
            <v-btn color="red" text @click="close" small outlined>Cancelar</v-btn>
          </v-flex>
          <v-flex xs12 sm4 class="ma-1">
            <v-btn color="secondary" text @click="save" small outlined>Agregar</v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from "moment";
import { db } from "@/firebase";
import { validationMixin } from "vuelidate";
import Cleave from "vue-cleave-component";
import { required, minLength, maxLength } from "vuelidate/lib/validators";
import { mapGetters } from "vuex";
export default {
  mixins: [validationMixin],
  data() {
    return {
      labelPhone: "Línea",
      requestClient: {
        phone: false
      },
      request: "",
      phone: 416,
      observations: "",
      mask: "(###) ###-####",
      selectPlans: true,
      technologie: "",
      services: [],
      service: ""
    };
  },
  validations() {
    if (!this.requestClient.phone) {
      return {
        phone: {},
        technologie: { required },
        request: { required },
        observations: { required },
        service: { required }
      };
    } else {
      return {
        phone: { required, minLength: minLength(14) },
        technologie: { required },
        request: { required },
        observations: { required },
        service: { required }
      };
    }
  },
  computed: {
    ...mapGetters([
      "getDialogNewRequest",
      "getRequestsOptions",
      "getServicesOptions",
      "getUser",
      "getClient"
    ]),
    phoneErrors() {
      if (this.requestClient.phone) {
        const errors = [];
        if (!this.$v.phone.$dirty) return errors;
        !this.$v.phone.required && errors.push("Teléfono requerido.");
        !this.$v.phone.minLength && errors.push("Télefono no valido");
        return errors;
      }
    },
    technologieErrors() {
      const errors = [];
      if (!this.$v.technologie.$dirty) return errors;
      !this.$v.technologie.required && errors.push("Tipo de Línea requerido.");
      return errors;
    },
    requestErrors() {
      const errors = [];
      if (!this.$v.request.$dirty) return errors;
      !this.$v.request.required && errors.push("Seleccione un requerimiento.");
      return errors;
    },
    serviceErrors() {
      const errors = [];
      if (!this.$v.service.$dirty) return errors;
      !this.$v.service.required && errors.push("Seleccione un plan.");
      return errors;
    },
    observationsErrors() {
      const errors = [];
      if (!this.$v.observations.$dirty) return errors;
      !this.$v.observations.required &&
        errors.push("Debe dejar un comentario breve.");
      return errors;
    }
  },
  methods: {
    close() {
      this.$v.$reset();
      this.$store.commit("setDialogNewRequest", false);
      this.request = "";
      this.phone = 416;
      this.observations = "";
      this.technologie = "";
      this.service = "";
    },
    async save() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        var ticket = `${this.getUser.locationCode}-${moment().unix()}`;
        let officeId = this.getUser.locationId;
        let created = moment().format("DD/MM/YYYY");
        let updated = moment().format("YYYY-MM-DD HH:mm:ss");
        let author = this.$store.state.user.user.name;
        let request = {
          block: null,
          ticket,
          clientId: this.getClient.identify,
          created,
          request: this.request,
          phone: this.phone,
          technologie: this.technologie,
          author,
          status: "Pendiente",
          updated,
          officeId,
          service: this.service,
          quote: null,
          close: null,
          observations: [
            {
              date: updated,
              content: this.observations,
              author
            }
          ]
        };

        try {
          db.collection("clientsRequests").add(request);
          this.$store.commit("setSnackbar", {
            active: true,
            text: `Requerimiento "${this.request}" agreado con éxito. # ${ticket}`,
            color: "success"
          });
          this.close();
        } catch (error) {
          console.error(error);
          this.$store.commit("setSnackbar", {
            active: true,
            text: `Error! en el proceso de actualización de "${this.name}".`,
            color: "error"
          });
          this.close();
        }
      }
    },
    selectedRequest() {
      this.technologie = "";
      this.service = "";
      this.services = [];
      this.getRequestsOptions
        .filter(request => request.name === this.request)
        .forEach(r => {
          this.requestClient = r;
        });

      if (this.requestClient.phone) {
        this.phone = "416";
        this.labelPhone = "Línea";
      } else {
        this.phone = null;
        this.labelPhone = "No Aplica";
      }
    },
    selectedTechnologie() {
      if (this.requestClient.service) {
        this.services = this.getServicesOptions.filter(
          service => service.technologie === this.technologie && service.status
        );
      } else {
        this.services = ["No Aplica"];
      }
    }
  }
};
</script>