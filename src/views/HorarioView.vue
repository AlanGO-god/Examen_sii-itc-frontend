<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "../services/api.js";

const clases = ref([]);
const loading = ref(true);
const errorMsg = ref("");

const DIAS = [
  { campo: "lunes", etiqueta: "Lunes" },
  { campo: "martes", etiqueta: "Martes" },
  { campo: "miercoles", etiqueta: "Miércoles" },
  { campo: "jueves", etiqueta: "Jueves" },
  { campo: "viernes", etiqueta: "Viernes" },
  { campo: "sabado", etiqueta: "Sábado" },
];

onMounted(async () => {
  try {
    const { data } = await api.get("/estudiante/horarios");
    clases.value = data.data[0]?.horario || [];
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "No se pudo cargar tu horario.";
  } finally {
    loading.value = false;
  }
});

const porDia = computed(() => {
  return DIAS.map(({ campo, etiqueta }) => ({
    etiqueta,
    clases: clases.value
      .filter((c) => c[campo] !== null)
      .map((c) => ({
        materia: c.nombre_materia,
        hora: c[campo],
        salon: c[`${campo}_clave_salon`],
      })),
  })).filter((dia) => dia.clases.length > 0);
});
</script>

<template>
  <div class="folio">
    <h1>Horario</h1>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="errorMsg" class="error">{{ errorMsg }}</p>

    <template v-else>
      <p v-if="!porDia.length" class="dato-muted">Sin clases registradas este periodo.</p>

      <section v-for="dia in porDia" :key="dia.etiqueta" class="dia">
        <h3 class="dia-nombre">{{ dia.etiqueta }}</h3>
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Materia</th>
              <th>Salón</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, i) in dia.clases" :key="i">
              <td class="dato-mono">{{ c.hora }}</td>
              <td class="materia">{{ c.materia }}</td>
              <td class="dato-mono">{{ c.salon }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<style scoped>
.dia {
  margin-bottom: 28px;
}

.dia-nombre {
  border-bottom: 2px solid var(--gold);
  padding-bottom: 6px;
  margin-bottom: 10px;
}

.materia {
  font-family: "Source Serif 4", serif;
}

.error {
  color: var(--stamp);
}
</style>