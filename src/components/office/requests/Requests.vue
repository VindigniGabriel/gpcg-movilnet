<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-subheader>Requerimiento(s) </v-subheader>
      <v-progress-linear :indeterminate="getLoadingRequests"></v-progress-linear>
      <v-list two-line v-if="!getLoadingRequests">
        <v-list-item
          v-for="item in getClientRequests"
          :key="item.ticket"
          @click="viewRequest(item)"
        >
          <v-list-item-icon>
            <v-icon>phone_android</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-subtitle># {{item.ticket}}</v-list-item-subtitle>
            <v-list-item-title>{{ item.phone }} - {{ item.request}} - {{ item.technologie }}</v-list-item-title>
            <v-list-item-subtitle>Creado el: {{ item.created }} por OC: {{item.office}}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-action>{{ item.status }}</v-list-item-action>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <new-request></new-request>
    </v-flex>
    <v-flex xs12>
      <div class="text-xs-center">
        <v-dialog v-model="dialogObservations" width="500">
          <v-card>
            <v-card-title primary-title>
              <span class="headline">Observaciones</span>
              <v-spacer></v-spacer>
              <span>{{item + 1}}/{{lengthObservations}}</span>
            </v-card-title>

            <v-card-text>
              <p>Creado el: {{date}}</p>
              <p>{{content}}</p>
              <p>Realizado por: {{author}}</p>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                class="mr-2"
                v-show="(item > 0)"
                color="secondary"
                text
                @click="back()"
                outlined
                small
              >Anterior</v-btn>
              <v-btn
                v-if="(item + 1 < lengthObservations)"
                color="secondary"
                text
                @click="next"
                outlined
                small
              >Siguiente</v-btn>
              <v-btn
                v-else
                color="red lighten-3"
                text
                @click="dialogObservations = false"
                outlined
                small
              >Cerrar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from "vuex";
import NewRequest from "./NewRequest";
export default {
  components: {
    NewRequest
  },
  data() {
    return {
      dialogObservations: false,
      content: "",
      date: "",
      author: "",
      item: 0,
      lengthObservations: "",
      observations: ""
    };
  },
  computed: {
    ...mapGetters(["getClientRequests", "getLoadingRequests"])
  },
  methods: {
    viewRequest(request) {
      this.item = 0;
      this.observations = request.observations;
      this.lengthObservations = this.observations.length;
      (this.content = this.observations[this.item].content),
        (this.date = this.observations[this.item].date),
        (this.author = this.observations[this.item].author),
        (this.dialogObservations = true);
    },
    next() {
      this.item++,
        (this.content = this.observations[this.item].content),
        (this.date = this.observations[this.item].date),
        (this.author = this.observations[this.item].author);
    },
    back() {
      this.item--,
        (this.content = this.observations[this.item].content),
        (this.date = this.observations[this.item].date),
        (this.author = this.observations[this.item].author);
    }
  }
};
</script>