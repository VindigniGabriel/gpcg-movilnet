<template>
  <v-container grid-list-md>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm10>
        <v-subheader>
          <v-icon left>settings</v-icon>Planes
        </v-subheader>
      </v-flex>
      <v-flex xs12 sm10>
        <v-card class="elevation-12">
          <v-card-text>
            <v-tabs dark color="primary" centered show-arrows v-model="tab">
              <v-tab
                v-for="(data, i) in dataTable"
                :key="i"
                :href="'#tab-' + i"
              >{{data.technologie}}</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item v-for="(data, i) in dataTable" :key="i" :value="'tab-' + i">
                <v-data-table
                  :headers="headersServices"
                  :items="data.services"
                  class="elevation-1 mt-4"
                  dense
                  :items-per-page="5"
                >
                  <template v-slot:item.status="{ item }">
                    <v-switch
                      small
                      color="success"
                      v-model="item.status"
                      @change="changeStatus(item.id, item.status, item.name)"
                    ></v-switch>
                  </template>
                  <template v-slot:item.edit="{ item }">
                    <v-btn
                      text
                      icon
                      @click="add({
                        data: item,
                        edit: true
                        })"
                    >
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <template v-slot:item.delete="{ item }">
                    <v-btn text icon @click="deleteBtn(item)">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
        <DialogServices />
      </v-flex>
    </v-layout>
    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          color="primary"
          fab
          dark
          small
          fixed
          bottom
          right
          @click="add({
          data: {
            id: null,
            technologie: selected.technologie,
            status: null,
            name: null,
          },
          edit: false
        })"
        >
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <span>Agregar Plan</span>
    </v-tooltip>
  </v-container>
</template>

<script>
import { db } from "@/firebase";
import DialogServices from "./DialogServices";
import moment from "moment";
import { mapGetters } from "vuex";
export default {
  components: {
    DialogServices
  },
  data() {
    return {
      tab: "tab-" + 0,
      headersServices: [
        {
          text: "Plan",
          align: "left",
          sortable: true,
          value: "name"
        },
        {
          text: "Activo",
          sortable: false,
          align: "left",
          value: "status"
        },
        {
          text: "Editar",
          sortable: false,
          align: "center",
          value: "edit"
        },
        {
          text: "Eliminar",
          sortable: false,
          align: "center",
          value: "delete"
        },
        {
          text: "Actualizado",
          sortable: false,
          align: "center",
          value: "updated"
        },
        {
          text: "Usuario",
          sortable: false,
          align: "center",
          value: "user"
        }
      ],
      dataTable: []
    };
  },
  computed: {
    ...mapGetters(["getServicesOptions", "getTechnologiesOptions"]),
    selected: state => state.dataTable[state.tab.substr(-1)]
  },
  watch: {
    getServicesOptions() {
      this.buildDataTable();
    }
  },
  methods: {
    buildDataTable() {
      this.dataTable = [];
      var services = "";
      this.getTechnologiesOptions.forEach(t => {
        services = this.getServicesOptions.filter(
          service => service.technologie === t.name
        );
        this.dataTable.push({
          technologie: t.name,
          services
        });
      });
    },
    add(data) {
      this.$store.commit("setService", data);
    },
    async deleteBtn(data) {
      this.$alertify.confirm(
        `Esta acción eliminará a "${data.name}"`,
        () => {
          this.completedDelete(data);
        },
        () => {
          this.$alertify.error("Operación cancelada.");
        }
      );
    },
    async completedDelete(data) {
      let deleted = await db
        .collection("clientRequests")
        .where("subOption", "==", data.id)
        .get();
      if (deleted.empty) {
        try {
          let processed = await db
            .collection("services")
            .doc(data.id)
            .delete();
          this.$store.commit("setSnackbar", {
            active: true,
            text: `"${data.name}" ha sido eliminado.`,
            color: "warning"
          });
        } catch (error) {
          this.$store.commit("setSnackbar", {
            active: true,
            text: `Error. "${data.name}" no logró ser eliminado`,
            color: "error"
          });
        }
      } else {
        this.$store.commit("setSnackbar", {
          active: true,
          text: `Error. "${data.name}" no puede ser eliminado`,
          color: "error"
        });
      }
    },
    async changeStatus(id, status, name) {
      let updated = moment().format("YYYY-MM-DD HH:mm:ss");
      let user = this.$store.state.user.user.name;
      try {
        let update = await db
          .collection("services")
          .doc(id)
          .update({
            status,
            updated,
            user
          });

        var msj = status ? "Activo" : "Inactivo";

        this.$store.commit("setSnackbar", {
          active: true,
          text: `"${name}" ha sido actualizado a "${msj}"`,
          color: "success"
        });
      } catch (error) {
        console.error(error);
        this.$store.commit("setSnackbar", {
          active: true,
          text: `Error. "${name}" no puede ser actualizado`,
          color: "error"
        });
      }
    }
  },
  created() {
    this.buildDataTable();
  }
};
</script>