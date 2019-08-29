<template>
  <v-container grid-list-md fill-height>
    <v-layout justify-center align-center wrap>
      <v-flex xs12>
        <v-container grid-list-lg>
          <v-layout wrap>
            <v-flex xs12>
              <v-subheader>
                Usuario
                <v-icon medium color="primary">add</v-icon>requerimientos
              </v-subheader>
              <v-divider></v-divider>
            </v-flex>
            <v-flex xs12>
              <v-btn text color="secondary" @click="back">
                <v-icon>reply</v-icon>Volver
              </v-btn>
            </v-flex>
            <v-flex xs12 md4>
              <UserData />
            </v-flex>
            <v-flex xs12 md8>
              <Requests />
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <v-btn
          v-show="getAddRequest"
          v-on="on"
          color="primary"
          fab
          dark
          small
          fixed
          bottom
          right
          @click="add"
        >
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <span>Agregar Requerimiento</span>
    </v-tooltip>
  </v-container>
</template>

<script>
import UserData from "./UserData";
import Requests from "./Requests";
import { mapGetters } from "vuex";
export default {
  components: {
    UserData,
    Requests
  },
  computed: {
    ...mapGetters(["getAddRequest"])
  },
  methods: {
    add() {
      this.$store.commit("setDialogNewRequest", true);
    },
    back() {
      this.$router.go(-1);
    }
  },
};
</script>