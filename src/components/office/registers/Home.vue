<template>
  <v-container grid-list-md fill-height>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm6 md4 lg2>
        <form @submit.prevent="searchClient">
          <v-select
            :items="nacionality"
            color="dark"
            v-model="selectNacionality"
            label="Seleccione nacionalidad"
            @change="changeNacionality"
          ></v-select>
          <cleave
            :options="optionsCleaveIdentify"
            class="form-control"
            color="deep-orange lighten-1"
            v-model.number="identify"
            type="tel"
          ></cleave>
          <v-btn
            class="mt-2"
            type="submit"
            outlined
            color="primary"
            block
            small
            :disabled="verifySearch"
          >Registrar</v-btn>
        </form>
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
import { mapGetters } from "vuex";
import Cleave from "vue-cleave-component";
export default {
  components: {
    Cleave
  },
  data: () => ({
    nacionality: ["Venezolana", "Extranjero"],
    selectNacionality: "Venezolana",
    identify: "",
    optionsCleaveIdentify: {
      numeral: true,
      numeralDecimalMark: ",",
      delimiter: ".",
      prefix: "V"
    }
  }),
  computed: {
    ...mapGetters(["getClient"]),
    verifySearch: state => (state.identify.length > 6 ? false : true)
  },
  methods: {
    changeNacionality() {
      this.identify = "";
      this.optionsCleaveIdentify.prefix = this.selectNacionality.substr(0, 1);
    },
    searchClient() {
      this.$store.dispatch("searchClient", this.identify);
    }
  }
};
</script>