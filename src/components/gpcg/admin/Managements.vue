<template>
  <v-container grid-list-md>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm10>
        <v-subheader>
          <v-icon left>folder</v-icon>Gerencias
        </v-subheader>
      </v-flex>
      <v-flex xs12 sm10>
        <v-card class="elevation-12">
          <v-card-text>
            <v-data-table :headers="headers" class="elevation-1" :items="items" :items-per-page="5">
              <template v-slot:item.direction="{item}">{{directionAssociated(item.directionId)}}</template>
              <template v-slot:item.edit="{item}">
                <v-btn text icon @click="openDialog(false, item)">
                  <v-icon>edit</v-icon>
                </v-btn>
              </template>
              <template v-slot:item.delete="{item}">
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
                          <p>Ger. Comercial</p>
                          <cleave
                            :options="optionsCleaveGer"
                            class="form-control"
                            color="secondary"
                            v-model="name"
                            type="text"
                          ></cleave>
                        </v-flex>
                        <v-flex xs12>
                          <v-autocomplete
                            v-model="nameDir"
                            :items="dataDir"
                            label="Pertenece a"
                            color="secondary"
                            item-text="name"
                          ></v-autocomplete>
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
      <span>Agregar Gerencia</span>
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
      optionsCleaveGer: {
        prefix: "Ger. ",
        uppercase: true,
        delimiter: "-"
      },
      id: null,
      title: null,
      add: true,
      name: "",
      data: "",
      nameDir: "",
      dataDir: [],
      dialog: false,
      items: [],
      headers: [
        {
          text: "Nombre de la Ger. Comercial",
          align: "center",
          value: "name"
        },
        {
          text: "Pertenece a",
          align: "center",
          value: "direction"
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
    disabledAdd: state =>
      state.name.length < 9 || state.nameDir === "" ? true : false
  },
  methods: {
    directionAssociated(id) {
      let direction = this.dataDir.filter(d => d.id === id);
      if (direction.length > 0) {
        return direction[0].name;
      }
    },
    deleteBtn(data) {
      this.id = data.id;
      this.name = data.name;
      this.$alertify.confirm(
        `Esta acción eliminará a ${data.name}`,
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
          let office = await db
            .collection("officesCommercial")
            .where("managementId", "==", this.id)
            .get();

          if (office.empty) {
            let deleted = await db
              .collection("managementsCommercial")
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
              text: `Error!. La "${this.name}" no puede ser eliminada por tener una o más Oficinas Comerciales asociadas.`,
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
      if (data != null) {
        this.name = data.name;
        this.id = data.id;
      }
      this.add = val;
      this.add
        ? (this.title = "Agregar Gerencia Comercial")
        : (this.title = "Editar Gerencia Comercial");
      this.dialog = true;
    },
    async save() {
      let updated = moment().format("YYYY-MM-DD HH:mm:ss");
      let user = this.$store.state.user.user.name;
      let direction = this.dataDir.filter(d => d.name === this.nameDir);
      if (this.add) {
        try {
          let managements = await db
            .collection("managementsCommercial")
            .where("name", "==", this.name)
            .get();

          if (managements.empty) {
            this.data = {
              name: this.name,
              directionId: direction[0].id
            };
            let set = await db
              .collection("managementsCommercial")
              .add(Object.assign({ updated, user }, this.data));

            this.$store.commit("setSnackbar", {
              active: true,
              text: `"${this.name}" ha sido agregado.`,
              color: "success"
            });
          } else {
            this.$store.commit("setSnackbar", {
              active: true,
              text: `El nombre de la Gerencia Comercial "${this.name}" ya existe`,
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
            .collection("managementsCommercial")
            .doc(this.id)
            .update({
              name: this.name,
              directionId: direction[0].id,
              updated,
              user
            });

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
    },
    init() {
      db.collection("managementsCommercial").onSnapshot(snapshot => {
        this.items = [];
        snapshot.forEach(request => {
          this.items.push(Object.assign({ id: request.id }, request.data()));
        });
      });

      db.collection("directionsCommercial").onSnapshot(snapshot => {
        this.dataDir = [];
        snapshot.forEach(request => {
          this.dataDir.push({
            name: request.data().name,
            id: request.id
          });
        });
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>