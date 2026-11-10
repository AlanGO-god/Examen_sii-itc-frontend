<script setup>
import { ref, computed } from "vue";
import { api } from "../../services/api.js";

const props = defineProps({
  sesion: { type: Object, required: true },
  rol: { type: String, required: true }, // "solicitante" | "tutor"
});
const emit = defineEmits(["cerrar", "actualizado"]);

const aviso = ref("");
const enviando = ref(false);
const lugarOEnlace = ref("");
const motivo = ref("");

const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
const horaActual = () =>
  new Date().toLocaleTimeString("en-GB", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

const horario = computed(() => props.sesion.horarios_tutor);
const materia = computed(() => props.sesion.tutores?.nombre_materia);
const otraPersona = computed(() =>
  props.rol === "solicitante" ? props.sesion.tutores?.nombre : props.sesion.solicitante_nombre
);

const yaPaso = computed(() => {
  if (!horario.value) return false;
  const { fecha, hora_inicio } = horario.value;
  if (fecha < hoy) return true;
  return fecha === hoy && hora_inicio.slice(0, 5) <= horaActual();
});

async function accion(fn) {
  enviando.value = true;
  aviso.value = "";
  try {
    await fn();
    emit("actualizado");
    emit("cerrar");
  } catch (e) {
    aviso.value = e.response?.data?.message ?? "No se pudo completar la acción.";
  } finally {
    enviando.value = false;
  }
}

const cancelarComoSolicitante = () =>
  accion(() => api.patch(`/mentorias/sesiones/${props.sesion.id}/cancelar`));

const aceptar = () =>
  accion(() =>
    api.patch(`/mentorias/sesiones/${props.sesion.id}/estado`, {
      estado: "aceptada",
      lugar_o_enlace: lugarOEnlace.value || "",
    })
  );

const rechazar = () =>
  accion(() => api.patch(`/mentorias/sesiones/${props.sesion.id}/estado`, { estado: "rechazada" }));

const cancelarComoTutor = () =>
  accion(() => api.patch(`/mentorias/sesiones/${props.sesion.id}/cancelar-tutor`, { motivo: motivo.value || "" }));

const concluir = () => accion(() => api.patch(`/mentorias/sesiones/${props.sesion.id}/concluir`));

const ocultar = () => accion(() => api.patch(`/mentorias/sesiones/${props.sesion.id}/ocultar`));

function enlaceContacto() {
  const asunto = encodeURIComponent(`Mentoría: ${materia.value ?? ""}`);
  const correo = props.rol === "solicitante" ? props.sesion.tutores?.email : props.sesion.solicitante_email;
  return correo ? `mailto:${correo}?subject=${asunto}` : null;
}
</script>

<template>
  <div class="modal-fondo" @click.self="emit('cerrar')">
    <div class="modal-caja">
      <button class="cerrar-x" @click="emit('cerrar')">✕</button>

      <div class="materia-destacada">
        <strong>{{ materia }}</strong>
        <p v-if="otraPersona">{{ rol === "solicitante" ? "Tutor" : "Solicitante" }}: {{ otraPersona }}</p>
        <p v-if="horario">{{ horario.fecha }} · {{ horario.hora_inicio.slice(0, 5) }}–{{ horario.hora_fin.slice(0, 5) }}</p>
      </div>

      <span class="badge" :class="'estado-' + sesion.estado">{{ sesion.estado }}</span>

      <p class="margin-top"><strong>Mensaje:</strong> "{{ sesion.mensaje }}"</p>

      <div v-if="sesion.estado === 'aceptada' && sesion.lugar_o_enlace" class="contacto-caja">
        <strong>Lugar / enlace:</strong> {{ sesion.lugar_o_enlace }}
      </div>

      <p v-if="sesion.motivo_cancelacion" class="dato-muted">Motivo de cancelación: {{ sesion.motivo_cancelacion }}</p>

      <p v-if="aviso" class="aviso-alerta">{{ aviso }}</p>

      <!-- SOLICITANTE -->
      <div v-if="rol === 'solicitante'" class="btn-group margin-top">
        <a v-if="sesion.estado === 'aceptada' && enlaceContacto()" class="btn-secundario" :href="enlaceContacto()">
          Contactar al tutor
        </a>
        <button
          v-if="['pendiente', 'aceptada'].includes(sesion.estado)"
          class="btn-sm btn-rojo"
          :disabled="enviando"
          @click="cancelarComoSolicitante"
        >
          Cancelar
        </button>
        <button
          v-if="['rechazada', 'cancelada', 'completada'].includes(sesion.estado)"
          class="btn-sm btn-gris"
          :disabled="enviando"
          @click="ocultar"
        >
          Quitar de mi lista
        </button>
      </div>

      <!-- TUTOR -->
      <div v-else class="margin-top">
        <div v-if="sesion.estado === 'pendiente'">
          <label>
            Lugar, enlace o WhatsApp para compartir si aceptas (opcional)
            <input v-model="lugarOEnlace" type="text" placeholder="Ej. Sala 4, o un enlace de videollamada" />
          </label>
          <div class="btn-group margin-top">
            <button class="btn-sm btn-verde" :disabled="enviando" @click="aceptar">Aceptar</button>
            <button class="btn-sm btn-rojo" :disabled="enviando" @click="rechazar">Rechazar</button>
          </div>
        </div>
        <div v-else-if="sesion.estado === 'aceptada'" class="btn-group">
          <a v-if="enlaceContacto()" class="btn-secundario" :href="enlaceContacto()">Contactar al estudiante</a>
          <button v-if="yaPaso" class="btn-sm btn-verde" :disabled="enviando" @click="concluir">Marcar concluida</button>
          <button class="btn-sm btn-rojo" :disabled="enviando" @click="cancelarComoTutor">Cancelar</button>
        </div>
        <div v-else-if="['rechazada', 'cancelada', 'completada'].includes(sesion.estado)">
          <button class="btn-sm btn-gris" :disabled="enviando" @click="ocultar">Quitar de mi lista</button>
        </div>
      </div>
    </div>
  </div>
</template>
