<script setup>
import { ref, onMounted } from "vue";
import { api } from "../services/api.js";

const kardex = ref([]);
const porcentajeAvance = ref(null);
const loading = ref(true);
const errorMsg = ref("");

onMounted(async () => {
  try {
    const { data } = await api.get("/estudiante/kardex");
    kardex.value = data.data.kardex;
    porcentajeAvance.value = data.data.porcentaje_avance;
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "No se pudo cargar tu kardex.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <h1>Kardex</h1>
  <p v-if="porcentajeAvance !== null">Avance de la carrera: {{ porcentajeAvance }}%</p>

  <p v-if="loading">Cargando...</p>
  <p v-else-if="errorMsg" style="color:red">{{ errorMsg }}</p>

  <table v-else border="1" cellpadding="6" style="border-collapse:collapse">
    <thead>
      <tr>
        <th>Materia</th>
        <th>Clave</th>
        <th>Periodo</th>
        <th>Semestre</th>
        <th>Créditos</th>
        <th>Calificación</th>
        <th>Descripción</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(m, i) in kardex" :key="i">
        <td>{{ m.nombre_materia }}</td>
        <td>{{ m.clave_materia }}</td>
        <td>{{ m.periodo }}</td>
        <td>{{ m.semestre }}</td>
        <td>{{ m.creditos }}</td>
        <td>{{ m.calificacion }}</td>
        <td>{{ m.descripcion }}</td>
      </tr>
    </tbody>
  </table>
</template>