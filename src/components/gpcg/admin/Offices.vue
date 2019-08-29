<template>
  <v-container grid-list-lg>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm10>
        <v-subheader>
          <v-icon left>folder</v-icon>Oficinas
        </v-subheader>
      </v-flex>
      <v-flex xs12 sm10>
        <v-card class="elevation-12">
          <v-card-text>
            <v-data-table :headers="headers" class="elevation-1" :items="items" :items-per-page="5">
              <template v-slot:item.management="{item}">{{managementAssociated(item.managementId)}}</template>
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
                        <v-flex xs12 sm8>
                          <p>OCM Comercial</p>
                          <cleave
                            :options="optionsCleaveOcm"
                            class="form-control"
                            color="secondary"
                            v-model="name"
                            type="text"
                          ></cleave>
                        </v-flex>
                        <v-flex xs12 sm4>
                          <p>Codigo</p>
                          <cleave
                            :options="optionsCleaveOcmCode"
                            class="form-control"
                            color="secondary"
                            v-model="code"
                            type="tel"
                          ></cleave>
                        </v-flex>
                        <v-flex xs12>
                          <v-autocomplete
                            v-model="nameGer"
                            :items="dataGer"
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
      <span>Agregar OC</span>
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
      optionsCleaveOcm: {
        prefix: "OC. ",
        uppercase: true,
        delimiter: "-"
      },

      optionsCleaveOcmCode: {
        prefix: "OC",
        delimiter: "-",
        blocks: [2, 2],
        numericOnly: true
      },
      code: "",
      id: null,
      title: null,
      add: true,
      name: "",
      holder: "",
      data: "",
      nameGer: "",
      dataGer: [],
      dialog: false,
      items: [],
      headers: [
        {
          text: "Nombre de la OCM. Comercial",
          align: "center",
          value: "name"
        },
        {
          text: "Pertenece a",
          align: "center",
          value: "management"
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
      state.name.length < 9 || state.code.length < 4 || state.nameGer === ""
        ? true
        : false
  },
  methods: {
    managementAssociated(id) {
      let management = this.dataGer.filter(m => m.id === id);
      if (management.length > 0) {
        return management[0].name;
      }
    },
    deleteBtn(data) {
      this.id = data.id;
      this.name = data.name;
      this.$alertify.confirm(
        `Esta acción eliminará a "${data.name}"`,
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
          let requests = await db
            .collection("clientsRequests")
            .where("officeId", "==", this.id)
            .get();
          if (requests.empty) {
            let deleted = await db
              .collection("officesCommercial")
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
              text: `Error!. La "${this.name}" no puede ser eliminada por tener uno o más requerimientos asociados.`,
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
        let management = this.dataGer.filter(m => m.id === data.managementId);
        this.name = data.name;
        this.id = data.id;
        this.code = data.code;
        this.nameGer = management[0].name;
      } else {
        this.name = "";
        this.id = "";
        this.code = "";
        this.nameGer = "";
      }
      this.add = val;
      this.add
        ? (this.title = "Agregar Oficina Comercial")
        : (this.title = "Editar Oficina Comercial");
      this.dialog = true;
    },
    async save() {
      let updated = moment().format("YYYY-MM-DD HH:mm:ss");
      let user = this.$store.state.user.user.name;
      let management = this.dataGer.filter(m => m.name === this.nameGer);
      if (this.add) {
        try {
          let office = await db
            .collection("officesCommercial")
            .where("name", "==", this.name)
            .get();
          if (office.empty) {
            this.data = {
              name: this.name,
              managementId: management[0].id,
              code: this.code
            };
            let set = await db
              .collection("officesCommercial")
              .add(Object.assign({ user, updated }, this.data));
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
            .collection("officesCommercial")
            .doc(this.id)
            .update({
              name: this.name,
              managementId: management[0].id,
              code: this.code,
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
      db.collection("officesCommercial").onSnapshot(snapshot => {
        this.items = [];
        snapshot.forEach(request => {
          this.items.push(Object.assign({ id: request.id }, request.data()));
        });
      });

      db.collection("managementsCommercial").onSnapshot(snapshot => {
        this.dataGer = [];
        snapshot.forEach(request => {
          this.dataGer.push({
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
