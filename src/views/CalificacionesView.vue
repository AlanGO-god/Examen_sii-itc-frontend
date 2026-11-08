<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "../services/api.js";
import AppIcon from "../components/icons/AppIcon.vue";

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

const filas = computed(() => {
  const resultado = [];
  for (const periodo of periodos.value) {
    for (const m of periodo.materias) {
      // Los 4 parciales, en orden (1 a 4); si alguno no existe o no se ha
      // capturado todavía, queda como null.
      const parciales = [1, 2, 3, 4].map((n) => {
        const c = m.calificaiones.find((x) => x.numero_calificacion === n);
        return c ? c.calificacion : null;
      });
      resultado.push({
        periodo: periodo.periodo.descripcion_periodo,
        materia: m.materia.nombre_materia,
        grupo: m.materia.letra_grupo,
        parciales,
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
  if (calificacion === null) return "sin-datos";
  const val = Number(calificacion);
  return Number.isNaN(val) ? "sin-datos" : val >= 70 ? "aprobada" : "reprobada";
}
</script>

<template>
  <div class="folio">
    <div class="encabezado">
      <div class="encabezado-icono"><AppIcon name="calificaciones" /></div>
      <h1>Calificaciones</h1>
    </div>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="errorMsg" class="error">{{ errorMsg }}</p>

    <template v-else>
      <div class="buscador-pill">
        <AppIcon name="buscar" />
        <input v-model="search" type="text" placeholder="Buscar por materia o periodo..." />
      </div>

      <table>
        <thead>
          <tr>
            <th>Materia</th>
            <th>Grupo</th>
            <th>Periodo</th>
            <th>P1</th>
            <th>P2</th>
            <th>P3</th>
            <th>P4</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(f, i) in filtradas" :key="i">
            <td class="materia">{{ f.materia }}</td>
            <td>{{ f.grupo }}</td>
            <td>{{ f.periodo }}</td>
            <td v-for="(p, j) in f.parciales" :key="j" class="nota" :class="nivel(p)">{{ p ?? "—" }}</td>
          </tr>
          <tr v-if="!filtradas.length">
            <td colspan="7">Sin resultados.</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.materia {
  font-family: "Source Serif 4", serif;
}

.nota {
  font-weight: 600;
  text-align: center;
  border-left: 3px solid transparent;
  padding-left: 12px !important;
}

.nota.aprobada { color: var(--pass); border-left-color: var(--pass); }
.nota.reprobada { color: var(--stamp); border-left-color: var(--stamp); }
.nota.sin-datos { color: var(--ink-soft); }

.error { color: var(--stamp); }
</style>