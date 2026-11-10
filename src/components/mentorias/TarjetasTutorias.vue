<script setup>
import { computed } from "vue";

const props = defineProps({
  tutorias: { type: Array, default: () => [] },
  horarios: { type: Array, default: () => [] }, // de /mentorias/horarios/mios
  sesionesRecibidas: { type: Array, default: () => [] },
});
const emit = defineEmits(["abrir"]);

function estadoDe(t) {
  if (t.archivado) return { texto: "Archivada", clase: "badge-subtil" };
  if (!t.activo) return { texto: "Desactivada por admin", clase: "badge-rojo" };
  if (t.pausado) return { texto: "Pausada", clase: "badge-ambar" };
  return { texto: "Activa", clase: "badge-verde" };
}

function contadores(t) {
  const horariosLibres = props.horarios.filter((h) => h.tutor_id === t.id && !h.reservado).length;
  const pendientes = props.sesionesRecibidas.filter((s) => s.tutor_id === t.id && s.estado === "pendiente").length;
  const proximas = props.sesionesRecibidas.filter((s) => s.tutor_id === t.id && s.estado === "aceptada").length;
  return { horariosLibres, pendientes, proximas };
}

// Las archivadas se muestran al final, para no estorbar en la vista normal
const ordenadas = computed(() =>
  [...props.tutorias].sort((a, b) => Number(a.archivado) - Number(b.archivado))
);
</script>

<template>
  <div class="panel-card margin-top">
    <h3>Mis materias ofertadas</h3>
    <p v-if="tutorias.length === 0" class="dato-muted">Aún no te has registrado como tutor en ninguna materia.</p>
    <div v-else class="grid-lista-simple">
      <article
        v-for="t in ordenadas"
        :key="t.id"
        class="tarjeta-simple clicable"
        @click="emit('abrir', t)"
      >
        <div>
          <strong>{{ t.nombre_materia }}</strong>
          <span class="dato-muted"> ({{ t.clave_materia }})</span>
          <div class="contadores-tutoria">
            <span>{{ contadores(t).horariosLibres }} horario(s) libre(s)</span>
            <span v-if="contadores(t).pendientes">· {{ contadores(t).pendientes }} solicitud(es) pendiente(s)</span>
            <span v-if="contadores(t).proximas">· {{ contadores(t).proximas }} próxima(s)</span>
          </div>
        </div>
        <span class="badge" :class="estadoDe(t).clase">{{ estadoDe(t).texto }}</span>
      </article>
    </div>
  </div>
</template>
