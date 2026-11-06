<script setup>
import { ref, onMounted } from "vue";
import { api } from "../services/api.js";

const perfil = ref(null);
const loading = ref(true);
const errorMsg = ref("");

onMounted(async () => {
  try {
    const { data } = await api.get("/estudiante");
    perfil.value = data.data;
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "No se pudo cargar tu perfil.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <h1>Mi perfil</h1>

  <p v-if="loading">Cargando...</p>
  <p v-else-if="errorMsg" style="color:red">{{ errorMsg }}</p>

  <div v-else>
    <p><strong>{{ perfil.persona }}</strong> — N.º de control: {{ perfil.numero_control }}</p>
    <p>Correo: {{ perfil.email }}</p>
    <p>Semestre: {{ perfil.semestre }}</p>
    <p>Promedio ponderado: {{ perfil.promedio_ponderado }}</p>
    <p>Promedio aritmético: {{ perfil.promedio_aritmetico }}</p>
    <p>Materias cursadas: {{ perfil.materias_cursadas }} — Aprobadas: {{ perfil.materias_aprobadas }} — Reprobadas: {{ perfil.materias_reprobadas }}</p>
    <p>Porcentaje de avance: {{ perfil.porcentaje_avance }}%</p>
  </div>
</template>