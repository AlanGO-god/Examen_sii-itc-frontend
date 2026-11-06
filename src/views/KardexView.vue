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

function nivel(calificacion) {
  const val = Number(calificacion);
  if (Number.isNaN(val) || val === 0) return "sin-datos";
  return val >= 70 ? "aprobada" : "reprobada";
}
</script>

<template>
  <div class="folio">
    <h1>Kardex</h1>

    <div v-if="porcentajeAvance !== null" class="ficha avance">
      <span class="dato-muted">Avance de la carrera</span>
      <span class="dato-mono avance-num">{{ porcentajeAvance }}%</span>
    </div>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="errorMsg" class="error">{{ errorMsg }}</p>

    <table v-else>
      <thead>
        <tr>
          <th>Materia</th>
          <th>Clave</th>
          <th>Periodo</th>
          <th>Sem.</th>
          <th>Créd.</th>
          <th>Calif.</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(m, i) in kardex" :key="i">
          <td class="materia">{{ m.nombre_materia }}</td>
          <td>{{ m.clave_materia }}</td>
          <td>{{ m.periodo }}</td>
          <td>{{ m.semestre }}</td>
          <td>{{ m.creditos }}</td>
          <td class="nota" :class="nivel(m.calificacion)">{{ m.calificacion }}</td>
          <td>{{ m.descripcion }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.avance {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.avance-num {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--stamp);
}

.materia {
  font-family: "Source Serif 4", serif;
}

.nota {
  font-weight: 600;
  border-left: 3px solid transparent;
  padding-left: 12px !important;
}

.nota.aprobada {
  color: var(--pass);
  border-left-color: var(--pass);
}

.nota.reprobada {
  color: var(--stamp);
  border-left-color: var(--stamp);
}

.nota.sin-datos {
  color: var(--ink-soft);
}

.error {
  color: var(--stamp);
}
</style>