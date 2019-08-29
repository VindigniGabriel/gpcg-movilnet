<template>
  <v-layout>
    <v-flex xs12>
      <v-snackbar v-model="getSnackbar.active" :multi-line="true" :color="getSnackbar.color">
        {{ getSnackbar.text }}
        <v-btn color="secondary" text @click="close">Cerrar</v-btn>
      </v-snackbar>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters(["getSnackbar"])
  },
  methods: {
    close() {
      this.$store.commit("setSnackbar");
    }
  }
};
</script>