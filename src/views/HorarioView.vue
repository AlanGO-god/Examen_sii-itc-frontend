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
    // data.data es un arreglo de periodos; tomamos el horario del periodo actual (el primero)
    clases.value = data.data[0]?.horario || [];
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "No se pudo cargar tu horario.";
  } finally {
    loading.value = false;
  }
});

// Para cada día, nos quedamos solo con las clases que SÍ tienen horario ese día
// (el campo viene en null cuando no hay clase)
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
  }));
});
</script>

<template>
  <h1>Horario</h1>

  <p v-if="loading">Cargando...</p>
  <p v-else-if="errorMsg" style="color:red">{{ errorMsg }}</p>

  <template v-else>
    <div v-for="dia in porDia" :key="dia.etiqueta" style="margin-bottom:16px">
      <h3>{{ dia.etiqueta }}</h3>
      <p v-if="!dia.clases.length">Sin clases.</p>
      <table v-else border="1" cellpadding="6" style="border-collapse:collapse">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Materia</th>
            <th>Salón</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in dia.clases" :key="i">
            <td>{{ c.hora }}</td>
            <td>{{ c.materia }}</td>
            <td>{{ c.salon }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>