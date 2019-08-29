<template>
  <v-container grid-list-md>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm10>
        <v-subheader>
          <v-icon left>group_add</v-icon>Administración de usuarios
        </v-subheader>
      </v-flex>
      <v-flex xs12 sm10>
        <v-card class="elevation-12">
          <v-card-text>
            <v-data-table :headers="headers" class="elevation-1" :items="items" :items-per-page="5">
              <template v-slot:item.management="{item}"></template>
              <template v-slot:item.edit="{item}">
                <v-btn text icon>
                  <v-icon>edit</v-icon>
                </v-btn>
              </template>
              <template v-slot:item.delete="{item}">
                <v-btn text icon >
                  <v-icon>delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
        {{$store.state.user}}
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
      <span>Agregar Usuario</span>
    </v-tooltip>
  </v-container>
</template>

<script>
const firebase = require("firebase");


var functions = firebase.functions()

export default {
  data: () => ({
    dialog: false,
    items: [],
    headers: [
      {
        text: "Nombre",
        align: "center",
        value: "name"
      },
      {
        text: "Correo",
        align: "center",
        value: "email"
      },
      {
        text: "Localidad",
        align: "center",
        value: "location"
      },
      {
        text: "Activo",
        sortable: false,
        align: "center",
        value: "active"
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
  }),
  methods: {
    /* test(){
let messageText = 'llll'
      var addMessage = firebase.functions().httpsCallable('addMessage');
addMessage({text: messageText}).then(function(result) {
  // Read result of the Cloud Function.
  var sanitizedMessage = result.data.text;}).catch(function(error) {
  // Getting the Error details.
  var code = error.code;
  var message = error.message;
  var details = error.details;

  console.log(code)
  // ...
});


    } */
   
    /* listAllUsers(nextPageToken) {
      // List batch of users, 1000 at a time.
      admin
        .auth()
        .listUsers(1000, nextPageToken)
        .then(function(listUsersResult) {
          listUsersResult.users.forEach(function(userRecord) {
            console.log("user", userRecord.toJSON());
          });
          if (listUsersResult.pageToken) {
            // List next batch of users.
            listAllUsers(listUsersResult.pageToken);
          }
        })
        .catch(function(error) {
          console.log("Error listing users:", error);
        });
    } */
  },
  created() {
    //this.listAllUsers()
    //this.test()
  }
};
</script>