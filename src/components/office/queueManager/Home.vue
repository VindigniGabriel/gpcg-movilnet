<template>
  <v-container grid-list-lg fill-height>
    <v-layout justify-center wrap>
      <v-flex xs12>
        <v-subheader>Gestión de Cola</v-subheader>
        <v-divider></v-divider>
      </v-flex>
      <v-flex xs12 md4>
        <TableAplications />
      </v-flex>
      <v-flex xs12 md8>
        <Table />
      </v-flex>
      <v-flex xs12>
        <QueueMFace />
      </v-flex>
    </v-layout>
    <QueueMFaceNot />
  </v-container>
</template>

<script>
import QueueMFaceNot from "./QueueMFaceNot";
import QueueMFace from "./QueueMFace";
import Table from "./Table";
import TableAplications from "@/components/aplications/TableAplications";
export default {
  components: {
    QueueMFaceNot,
    QueueMFace,
    Table,
    TableAplications
  }
};
</script>