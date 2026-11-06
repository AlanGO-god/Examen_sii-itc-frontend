<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "../services/api.js";

const periodos = ref([]);
const loading = ref(true);
const errorMsg = ref("");
const search = ref("");

onMounted(async () => {
  try {
    const { data } = await api.get("/estudiante/calificaciones");
    periodos.value = data.data;
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "No se pudieron cargar tus calificaciones.";
  } finally {
    loading.value = false;
  }
});

// Aplanamos periodos -> materias en una sola lista para poder filtrarla y
// mostrarla como tabla (en vez de anidar tablas dentro de tablas).
const filas = computed(() => {
  const resultado = [];
  for (const periodo of periodos.value) {
    for (const m of periodo.materias) {
      const ultimaCalif = [...m.calificaiones].reverse().find((c) => c.calificacion !== null);
      resultado.push({
        periodo: periodo.periodo.descripcion_periodo,
        materia: m.materia.nombre_materia,
        grupo: m.materia.letra_grupo,
        calificacion: ultimaCalif ? ultimaCalif.calificacion : null,
      });
    }
  }
  return resultado;
});

const filtradas = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return filas.value;
  return filas.value.filter(
    (f) => f.materia.toLowerCase().includes(q) || f.periodo.toLowerCase().includes(q)
  );
});

function nivel(calificacion) {
  const val = Number(calificacion);
  if (calificacion === null || Number.isNaN(val)) return "sin-datos";
  if (val >= 80) return "bien";
  if (val >= 70) return "regular";
  return "mal";
}
</script>

<template>
  <h1>Calificaciones</h1>

  <p v-if="loading">Cargando...</p>
  <p v-else-if="errorMsg" style="color:red">{{ errorMsg }}</p>

  <template v-else>
    <input v-model="search" type="text" placeholder="Buscar por materia o periodo..." />

    <table border="1" cellpadding="6" style="margin-top:10px; border-collapse:collapse">
      <thead>
        <tr>
          <th>Materia</th>
          <th>Grupo</th>
          <th>Periodo</th>
          <th>Calificación</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(f, i) in filtradas" :key="i">
          <td>{{ f.materia }}</td>
          <td>{{ f.grupo }}</td>
          <td>{{ f.periodo }}</td>
          <td :class="nivel(f.calificacion)">{{ f.calificacion ?? "—" }}</td>
        </tr>
        <tr v-if="!filtradas.length">
          <td colspan="4">Sin resultados.</td>
        </tr>
      </tbody>
    </table>
  </template>
</template>

<style scoped>
.bien { background: #d4f8d4; }
.regular { background: #fff3cd; }
.mal { background: #f8d4d4; }
.sin-datos { background: #eee; }
</style>