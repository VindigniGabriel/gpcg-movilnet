<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialogService" width="500" persistent>
      <v-card>
        <v-card-title>
          <v-subheader>{{edit? 'Editar': 'Agregar'}} plan en {{service.technologie}}</v-subheader>
        </v-card-title>
        <form @submit.prevent="save">
          <v-card-text>
            <v-text-field
              color="secondary"
              v-model="serviceObj.name"
              :error-messages="nameErrors"
              label="Nombre del plan"
              required
              @input="$v.name.$touch()"
              @blur="$v.name.$touch()"
              outlined
              shaped
            ></v-text-field>
            <v-autocomplete
              outlined
              shaped
              v-show="edit"
              v-model="serviceObj.technologie"
              :items="technologies"
              label="Técnologia"
              persistent-hint
              color="secondary"
              :error-messages="technologieErrors"
              @input="$v.technologie.$touch()"
              @blur="$v.technologie.$touch()"
              item-text="name"
            ></v-autocomplete>
          </v-card-text>
          <v-card-actions>
            <v-layout justify-space-around wrap class="text-center">
              <v-flex xs12 sm4 class="ma-1">
                <v-btn outlined color="red" small @click="close">Cancelar</v-btn>
              </v-flex>
              <v-flex xs12 sm4 class="ma-1">
                <v-btn outlined color="success" small type="submit" :disabled="disabledBtn">
                  <v-icon left>check</v-icon>
                  {{edit? 'Actualizar' : 'Agregar'}}
                </v-btn>
              </v-flex>
            </v-layout>
          </v-card-actions>
          <v-container v-if="edit">
            <span
              class="caption font-weight-regular font-italic"
            >* Los registros de requerimientos serán actualizados con los nuevos cambios.</span>
          </v-container>
        </form>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import moment from "moment";
import { db } from "@/firebase";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import { mapState, mapMutations, mapGetters } from "vuex";
export default {
  mixins: [validationMixin],

  validations: {
    name: { required },
    technologie: { required }
  },
  data() {
    return {
      serviceObj: {
        id: null,
        name: null,
        status: true,
        technologie: null
      },
      technologies: []
    };
  },
  computed: {
    ...mapGetters(["dialogService", "service", "edit"]),
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push("Asigne un nombre al plan.");
      return errors;
    },
    technologieErrors() {
      const errors = [];
      if (!this.$v.technologie.$dirty) return errors;
      !this.$v.technologie.required &&
        errors.push("Asigne una técnologia al plan.");
      return errors;
    },
    disabledBtn() {
      return this.$v.$invalid;
    },
    name: state => state.serviceObj.name,
    technologie: state => state.serviceObj.technologie
  },
  watch: {
    service(val) {
      this.serviceObj = val;
    }
  },
  methods: {
    async save() {
      let updated = moment().format("YYYY-MM-DD HH:mm:ss");
      let user = this.$store.state.user.user.name
      if (this.edit) {
        try {
          let update = await db
            .collection("services")
            .doc(this.serviceObj.id)
            .update(Object.assign({ updated, user }, this.serviceObj));
          this.$store.commit("setSnackbar", {
            active: true,
            text: `"${this.name}" ha sido actualizado con éxito.`,
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
      } else {
        let check = await db
          .collection("services")
          .where("name", "==", this.name)
          .where("technologie", "==", this.serviceObj.technologie)
          .get();
        if (check.empty) {
          try {
            let set = db
              .collection("services")
              .add(Object.assign({ updated, user }, this.serviceObj));
            this.$store.commit("setSnackbar", {
              active: true,
              text: `"${this.name}" ha sido creado con éxito.`,
              color: "success"
            });
            this.close();
          } catch (error) {
            console.error(error);
            this.$store.commit("setSnackbar", {
              active: true,
              text: `Error! en el proceso de creacíon de "${this.name}".`,
              color: "error"
            });
            this.close();
          }
        } else {
          this.$store.commit("setSnackbar", {
            active: true,
            text: `Error! El nombre "${this.name}" ya éxiste.`,
            color: "error"
          });
          this.close();
        }
      }
    },
    close() {
      (this.serviceObj = {
        id: null,
        name: null,
        status: true,
        technologie: null
      }),
        this.$v.$reset();
      this.$store.commit("setService");
    }
  },
  mounted() {
    db.collection("typeLine")
      .get()
      .then(t => {
        this.technologies = [];
        t.forEach(technologie => {
          this.technologies.push(technologie.data());
        });
      });
  }
};
</script>
