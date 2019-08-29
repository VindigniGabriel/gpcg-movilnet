<template>
  <v-list dense rounded>
    <v-subheader>Disponibilidad de Aplicativos</v-subheader>
    <v-list-item-group>
      <v-list-item v-for="(aplication, i) in getAplicationsStatus.aplications" :key="i">
        <v-list-item-icon>
            <v-icon v-if="aplication.active">desktop_windows</v-icon>
            <v-icon v-else color="error">desktop_access_disabled</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{aplication.name}}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-switch color="success" v-model="aplication.active" small @change="updatedAplicationsStatus"></v-switch>
        </v-list-item-action>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data: () => ({
    items: []
  }),
  computed: {
    ...mapGetters(["getAplicationsStatus"])
  },
  methods: {
      updatedAplicationsStatus(){
          this.$store.dispatch('updatedAplicationsStatus')
      }
  }
};
</script>