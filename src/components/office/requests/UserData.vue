<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-subheader>
      Información del usuario
      <v-spacer></v-spacer>
      <v-btn text icon @click="editUserData" v-if="edit">
        <v-icon>edit</v-icon>
      </v-btn>
      <v-btn text icon @click="saveUserData" v-else :disabled="!valid || validIdentify">
        <v-icon>save</v-icon>
      </v-btn>
    </v-subheader>
    <v-divider></v-divider>

    <p v-if="edit">Nombre: {{getClient.name}}</p>
    <v-text-field
      v-else
      :rules="nameRules"
      label="Nombre"
      color="deep-orange lighten-1"
      :value="getClient.name"
      required
      v-model="getClient.name"
    ></v-text-field>
    <p v-if="edit">Cédula: {{getClient.identify}}</p>
    <cleave
      v-else
      required
      :options="optionsCleaveIdentify"
      class="form-control"
      color="deep-orange lighten-1"
      type="tel"
      :value="getClient.identify"
      :rules="identifyRules"
      v-model="getClient.identify"
    ></cleave>
    <p v-if="edit">Contacto 1: {{getClient.contact1}}</p>
    <v-text-field
      v-else
      required
      v-model="getClient.contact1"
      label="Tél. Contacto 1 (212)xxx-xxxx"
      v-mask="mask"
      color="dark"
      type="tel"
      :rules="contactRules"
    ></v-text-field>
    <p v-if="edit">Contacto 2: {{getClient.contact2}}</p>
    <v-text-field
      v-else
      v-model="getClient.contact2"
      label="Tél. Contacto 2 (212)xxx-xxxx"
      v-mask="mask"
      color="dark"
      type="tel"
    ></v-text-field>
    <span
      class="caption font-weight-light font-italic"
    >* Los campos: Nombre, Cédula y Contacto 1, son requeridos para agregar un requerimiento.</span>
  </v-form>
</template>

<script>
import Cleave from "vue-cleave-component";
import { mapState, mapMutations, mapGetters } from "vuex";
export default {
  components: {
    Cleave
  },
  data() {
    return {
      optionsCleaveIdentify: {
        numeral: true,
        numeralDecimalMark: ",",
        delimiter: ".",
        prefix: "V"
      },
      mask: '(###) ###-####',
      valid: false,
      edit: true,
      nameRules: [v => !!v || "Nombre requerido"],
      identifyRules: [v => (v.length = 6 || "Cédula requerido")],
      contactRules: [v => v.length === 14 || "Tél. contacto requerido"]
    };
  },
  computed: {
    ...mapState(["client"]),
    ...mapGetters(["getClient"]),
    validIdentify: state => {
      if (
        state.getClient.identify.length < 7 ||
        state.getClient.name === null ||
        state.getClient.contact1.length < 10
      ) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    editUserData() {
      this.edit = false;
    },
    async saveUserData() {
      this.edit = true;
      let agregate = await this.$store.dispatch("agregateClient");
      if (agregate) {
        this.$store.commit("setClientRegister", true);
        this.$store.commit("setSnackbar", {
          active: true,
          text: `Usuario actualizado con éxito.`,
          color: "success"
        });
      } else {
        this.$store.commit("setSnackbar", {
          active: true,
          text: `Error!. Usuario no logró ser actualizado.`,
          color: "error"
        });
      }
    }
  }
};
</script>
