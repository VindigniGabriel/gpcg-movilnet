<template>
  <!-- App.vue -->
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      color="primary"
      :expand-on-hover="true"
      :mini-variant="mini"
      dark
      clipped
      app
      temporary
    >
      <v-list dense nav class="py-0">
        <v-list-item two-line>
          <v-list-item-content>
            <v-list-item-title>{{getUser.locationName}}</v-list-item-title>
            <v-list-item-subtitle>{{getUser.locationCode}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <template v-if="getMenuFilterSecond.length > 0">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Configuraciones SRC</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-for="item in getMenuFilterSecond" :key="item.text" @click="url(item.url)">
            <v-list-item-icon>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Admin. de usuarios</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-for="item in getMenuFilterThird" :key="item.text" @click="url(item.url)">
            <v-list-item-icon>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Data</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-for="item in getMenuFilterFirst" :key="item.text" @click="url(item.url)">
          <v-list-item-icon>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app fixed color="primary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="getUser.uid"></v-app-bar-nav-icon>

      <v-toolbar-title class="app-font">SRC</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-layout v-if="getUser.uid" justify-end align-center>
        <span class="app-font mr-1">{{getUser.name}}</span>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon @click="logout" v-on="on" dark>power_settings_new</v-icon>
          </template>
          <span>Cerrar Sesión</span>
        </v-tooltip>
      </v-layout>
    </v-app-bar>
    <v-content>
        <transition name="gpcg">
          <router-view/>
        </transition>
        <Snackbar/>
    </v-content>
  </v-app>
</template>

<script>
import { auth } from "@/firebase";
import { mapState, mapGetters } from "vuex";
import Snackbar from "@/components/alerts/Snackbar";
export default {
  name: "App",
  data: () => ({
    mini: false,
    drawer: false
  }),
  components: {
    Snackbar
  },
  computed: {
    ...mapGetters(["getUser", "getMenuFilterFirst", "getMenuFilterSecond", "getMenuFilterThird"])
  },
  methods: {
    url(to) {
      console.log(to);
      this.$router.push({ name: to });
    },
    logout() {
      auth
        .signOut()
        .then(success => {
          this.$store.commit("setUser");
          console.log("Sesión cerrada");
        })
        .catch(error => {
          console.log("Error al cerrar Sesión");
        });
    }
  },
  created() {
    console.log("App.vue");
  }
};
</script>

<style>
* base */ .gpcg {
  backface-visibility: hidden;
  z-index: 1;
}

/* moving */
.gpcg-move {
  transition: all 600ms ease-in-out 50ms;
}

/* appearing */
.gpcg-enter-active {
  transition: all 400ms ease-out;
}

/* disappearing */
.gpcg-leave-active {
  transition: all 200ms ease-in;
  position: absolute;
  z-index: 0;
}

/* appear at / disappear to */
.gpcg-enter,
.gpcg-leave-to {
  opacity: 0;
}
@import url("https://fonts.googleapis.com/css?family=Indie+Flower&display=swap");
.app-font {
  font-family: "Londrina Shadow" !important;
}
</style>

