<template>
  <v-container grid-list-md>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm10>
        <v-subheader>
          <v-icon left>settings</v-icon>Requerimientos
        </v-subheader>
      </v-flex>
      <v-flex xs12 sm10>
        <v-card class="elevation-12">
          <v-card-text>
            <v-data-table
              :headers="headersRequest"
              :items="getRequestsOptions"
              class="elevation-1"
              :items-per-page="5"
            >
              <template v-slot:item.status="{ item }">
                <v-switch
                  small
                  color="success"
                  v-model="item.active"
                  @change="changeStatus(item.id, item.active, item.name)"
                ></v-switch>
              </template>
              <template v-slot:item.edit="{ item }">
                <v-btn text icon @click="dialogRequestEdit(item)">
                  <v-icon>edit</v-icon>
                </v-btn>
              </template>
              <template v-slot:item.delete="{ item }">
                <v-btn text icon @click="deleteBtn(item)">
                  <v-icon>delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
        <DialogRequests />
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
          @click="dialogRequestNew()"
        >
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <span>Agregar Requerimiento</span>
    </v-tooltip>
  </v-container>
</template>

<script>
import moment from "moment";
import { db } from "@/firebase";
import DialogRequests from "./DialogRequests";
import { mapGetters } from "vuex";
export default {
  components: {
    DialogRequests
  },
  data() {
    return {
      headersRequest: [
        {
          text: "Requerimiento",
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
    };
  },
  computed: {
    ...mapGetters(['getRequestsOptions'])
  },
  methods: {
    dialogRequestNew() {
      this.$store.commit("setRequestDialog", {
        edit: false,
        open: true
      });
    },
    dialogRequestEdit(payload) {
      this.$store.commit("setRequestDialog", {
        edit: true,
        data: payload,
        open: true
      });
    },
    deleteBtn(data) {
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
        .collection("clientsRequests")
        .where("request", "==", data.name)
        .get();
      if (deleted.empty) {
        try {
          let processed = await db
            .collection("optionsRequests")
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
    async changeStatus(id, active, name) {
      console.log(active);
      let updated = moment().format("YYYY-MM-DD HH:mm:ss");
      let user = this.$store.state.user.user.name;
      try {
        let update = await db
          .collection("optionsRequests")
          .doc(id)
          .update({
            active,
            updated,
            user
          });

        var msj = status ? "Activo" : "Inactivo";

        this.$store.commit("setSnackbar", {
          active: true,
          text: `"${name}" ha sido actualizado a ${msj}`,
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
  }
};
</script>