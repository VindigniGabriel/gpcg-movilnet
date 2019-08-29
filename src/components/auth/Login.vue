<template>
  <v-container fill-height grid-list-lg>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm8 md6 lg5 xl4>
        <v-alert
          :value="alert"
          color="error"
          dark
          border="top"
          icon="mdi-home"
          transition="scale-transition"
        >{{msjAlert}}</v-alert>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Inicio de sesión</v-toolbar-title>
          </v-toolbar>
          <v-form @submit.prevent="login">
            <v-card-text>
              <v-text-field color="secondary" v-model="email" label="Correo" outlined shaped></v-text-field>
              <v-text-field
                color="secondary"
                v-model="password"
                label="Contraseña"
                outlined
                type="password"
                shaped
              ></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-layout justify-end align-center>
                <v-btn outlined small color="primary" type="submit">Entrar</v-btn>
              </v-layout>
            </v-card-text>
          </v-form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import { auth, db } from "@/firebase";
import { mapState, mapMutations } from "vuex";
export default {
  data: () => ({
    dd: "",
    msjAlert: "",
    alert: false,
    email: "",
    password: ""
  }),
  computed: {
    ...mapState(["user"])
  },
  watch: {
    email(val) {
      this.alert = false;
    },
    password(val) {
      this.alert = false;
    }
  },
  methods: {
    ...mapMutations(["setUser"]),
    async login() {
      this.alert = false;
      this.msjAlert = "";
      try {
        await auth.signInWithEmailAndPassword(this.email, this.password);
        if (auth.currentUser) {
          auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
          this.$store.dispatch("signIn", auth.currentUser);
        }
      } catch (error) {
        this.alert = true;
        let errorCode = error.code;
        this.msjAlert = "";
        switch (error.code) {
          case "auth/user-not-found":
            this.msjAlert = "Email no se encuentra registrado";
            break;
          case "auth/wrong-password":
            this.msjAlert = "Error en contraseña.";
            break;
          case "auth/network-request-failed":
            this.msjAlert = "Se ha producido un error de red";
            break;
          case "auth/invalid-email":
            this.msjAlert = "Error en email";
            break;
          default:
            console.log(error);
            break;
        }
      }
    }
  },
  created() {
    console.log("Login.vue");
  }
};
</script>