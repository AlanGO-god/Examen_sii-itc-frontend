<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "../services/api.js";
import AppIcon from "../components/icons/AppIcon.vue";

const kardex = ref([]);
const porcentajeAvance = ref(null);
const loading = ref(true);
const errorMsg = ref("");
const search = ref("");

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

// Busca el texto en las 4 columnas de texto a la vez (materia, clave,
// periodo, descripción), no solo en una.
const filtrado = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return kardex.value;
  return kardex.value.filter((m) =>
    [m.nombre_materia, m.clave_materia, m.periodo, m.descripcion].some((campo) =>
      String(campo ?? "").toLowerCase().includes(q)
    )
  );
});

function nivel(calificacion) {
  const val = Number(calificacion);
  if (Number.isNaN(val) || val === 0) return "sin-datos";
  return val >= 70 ? "aprobada" : "reprobada";
}
</script>

<template>
  <div class="folio">
    <div class="encabezado">
      <div class="encabezado-icono"><AppIcon name="kardex" /></div>
      <h1>Kardex</h1>
    </div>

    <div v-if="porcentajeAvance !== null" class="ficha avance">
      <span class="dato-muted">Avance de la carrera</span>
      <span class="dato-mono avance-num">{{ porcentajeAvance }}%</span>
    </div>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="errorMsg" class="error">{{ errorMsg }}</p>

    <template v-else>
      <div class="buscador-pill">
        <AppIcon name="buscar" />
        <input v-model="search" type="text" placeholder="Buscar en cualquier columna..." />
      </div>

      <table>
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
          <tr v-for="(m, i) in filtrado" :key="i">
            <td class="materia">{{ m.nombre_materia }}</td>
            <td>{{ m.clave_materia }}</td>
            <td>{{ m.periodo }}</td>
            <td>{{ m.semestre }}</td>
            <td>{{ m.creditos }}</td>
            <td class="nota" :class="nivel(m.calificacion)">{{ m.calificacion }}</td>
            <td>{{ m.descripcion }}</td>
          </tr>
          <tr v-if="!filtrado.length">
            <td colspan="7">Sin resultados.</td>
          </tr>
        </tbody>
      </table>
    </template>
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

.nota.aprobada { color: var(--pass); border-left-color: var(--pass); }
.nota.reprobada { color: var(--stamp); border-left-color: var(--stamp); }
.nota.sin-datos { color: var(--ink-soft); }

.error { color: var(--stamp); }
</style>