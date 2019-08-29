<template>
  <v-container grid-list-md>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm10>
        <v-subheader>
          <v-icon left>folder</v-icon>Direcciones
        </v-subheader>
      </v-flex>
      <v-flex xs12 sm10>
        <v-card class="elevation-12">
          <v-card-text>
            <v-data-table :headers="headers" class="elevation-1" :items="items" :items-per-page="5">
              <template v-slot:item.edit="{ item }">
                <v-btn text icon @click="openDialog(false, item)">
                  <v-icon>edit</v-icon>
                </v-btn>
              </template>
              <template v-slot:item.delete="{ item }">
                <v-btn text icon @click="deleteBtn(item)">
                  <v-icon>delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
            <v-dialog v-model="dialog" max-width="500px">
              <v-card>
                <v-form lazy-validation @submit.prevent="save">
                  <v-card-title>
                    <span class="headline">{{title}}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs12>
                          <p>Dir. Comercial</p>
                          <cleave
                            :options="optionsCleaveDir"
                            class="form-control"
                            color="secondary"
                            v-model="name"
                            type="text"
                          ></cleave>
                        </v-flex>
                        <v-flex xs12 v-show="!add">
                          <span
                            class="font-weight-thin font-italic text-center"
                          >Esta acción actualizará la infromación de todas las Gerencias Comerciales asociadas a esta Dir. Comercial.</span>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-layout justify-space-around wrap class="text-center">
                      <v-flex xs12 sm4 class="ma-1">
                        <v-btn outlined color="red" small @click="close">Cancelar</v-btn>
                      </v-flex>
                      <v-flex xs12 sm4 class="ma-1">
                        <v-btn outlined color="primary" small type="submit" :disabled="disabledAdd">
                          <v-icon left>check</v-icon>
                          {{!add? 'Actualizar' : 'Agregar'}}
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
          </v-card-text>
        </v-card>
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
          @click="openDialog(true)"
        >
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <span>Agregar Dirección</span>
    </v-tooltip>
  </v-container>
</template>

<script>
import moment from "moment";
import { db } from "@/firebase";
import Cleave from "vue-cleave-component";
export default {
  components: {
    Cleave
  },
  data() {
    return {
      optionsCleaveDir: {
        prefix: "Dir. ",
        uppercase: true,
        delimiter: "-"
      },
      id: null,
      title: null,
      add: true,
      name: "",
      data: "",
      dialog: false,
      items: [],
      headers: [
        {
          text: "Nombre de la Dir. Comercial",
          align: "center",
          value: "name"
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
      ]
    };
  },
  computed: {
    disabledAdd: state => (state.name.length < 9 ? true : false)
  },
  methods: {
    deleteBtn(data) {
      this.id = data.id;
      this.name = data.name;
      this.$alertify.confirm(
        `Esta acción eliminará a "${this.name}"`,
        () => {
          this.completedDelete();
        },
        () => {
          this.$alertify.error("Operación cancelada.");
        }
      );
    },
    async completedDelete() {
      try {
        let users = await db
          .collection("usersApp")
          .where("locationId", "==", this.id)
          .get();

        if (users.empty) {
          let managements = await db
            .collection("managementsCommercial")
            .where("directionId", "==", this.id)
            .get();

          if (managements.empty) {
            let deleted = await db
              .collection("directionsCommercial")
              .doc(this.id)
              .delete();

            this.$store.commit("setSnackbar", {
              active: true,
              text: `La "${this.name}" ha sido eliminada.`,
              color: "warning"
            });
          } else {
            this.$store.commit("setSnackbar", {
              active: true,
              text: `Error!. La "${this.name}" no puede ser eliminada por tener una o más Gerencias Comerciales asociadas.`,
              color: "error"
            });
          }
        } else {
          this.$store.commit("setSnackbar", {
            active: true,
            text: `Error!. La "${this.name}" no puede ser eliminada por tener uno o más usuarios asociados.`,
            color: "error"
          });
        }
      } catch (error) {
        console.log(error);
        this.$store.commit("setSnackbar", {
          active: true,
          text: `Error!. La "${this.name}" no logró ser eliminada.`,
          color: "error"
        });
      }
    },
    openDialog(val, data = null) {
      this.add = val;
      this.add
        ? (this.title = "Agregar Dirección Comercial")
        : (this.title = "Editar Dirección Comercial");

      if (data != null) {
        this.name = "";
        this.id = "";
        console.log(data);
        this.name = data.name;
        this.id = data.id;
        this.dialog = true;
      } else {
        this.dialog = true;
      }
    },
    async save() {
      let updated = moment().format("YYYY-MM-DD HH:mm:ss");
      let user = this.$store.state.user.user.name;
      if (this.add) {
        try {
          let set = await db
            .collection("directionsCommercial")
            .where("name", "==", this.name)
            .get();

          if (set.empty) {
            let add = await db
              .collection("directionsCommercial")
              .add({ name: this.name, updated, user });

            this.$store.commit("setSnackbar", {
              active: true,
              text: `"${this.name}" ha sido agregado.`,
              color: "success"
            });
          } else {
            this.$store.commit("setSnackbar", {
              active: true,
              text: `El nombre de la Dirección Comercial "${this.name}" ya existe`,
              color: "error"
            });
          }
        } catch (error) {
          console.log(error);
          this.$store.commit("setSnackbar", {
            active: true,
            text: `Error. "${this.name}" no logró ser agregado`,
            color: "error"
          });
        }
      } else {
        try {
          let edit = await db
            .collection("directionsCommercial")
            .doc(this.id)
            .update({ name: this.name, updated, user });

          this.$store.commit("setSnackbar", {
            active: true,
            text: `"${this.name}" ha sido actualizado.`,
            color: "success"
          });
        } catch (error) {
          console.log(error);
          this.$store.commit("setSnackbar", {
            active: true,
            text: `Error. "${this.name}" no logró ser actualizado`,
            color: "error"
          });
        }
      }
      this.close();
    },
    close() {
      this.dialog = false;
      this.name = "";
      this.id = "";
    },
    init() {
      db.collection("directionsCommercial").onSnapshot(snapshot => {
        this.items = [];
        snapshot.forEach(direction => {
          this.items.push(
            Object.assign({ id: direction.id }, direction.data())
          );
        });
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>