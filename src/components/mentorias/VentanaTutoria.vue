<script setup>
import { ref, computed } from "vue";
import { api } from "../../services/api.js";

const props = defineProps({
  tutoria: { type: Object, required: true },
  horarios: { type: Array, default: () => [] }, // ya filtrados a esta tutoría
  sesiones: { type: Array, default: () => [] }, // ya filtradas a esta tutoría
});
const emit = defineEmits(["cerrar", "actualizar"]);

const tab = ref("resumen");
const aviso = ref("");
const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
const horaActual = () =>
  new Date().toLocaleTimeString("en-GB", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

function yaPaso(fecha, horaInicio) {
  if (fecha < hoy) return true;
  return fecha === hoy && horaInicio.slice(0, 5) <= horaActual();
}

function mostrarAviso(mensaje) {
  aviso.value = mensaje;
  setTimeout(() => (aviso.value = ""), 4000);
}

// ------------------------- Resumen -------------------------
const descripcion = ref(props.tutoria.descripcion || "");
const carrera = ref(props.tutoria.carrera || "");
const guardandoResumen = ref(false);
const cambiandoPausa = ref(false);
const eliminando = ref(false);

async function guardarResumen() {
  guardandoResumen.value = true;
  try {
    await api.patch(`/mentorias/tutores/${props.tutoria.id}`, {
      descripcion: descripcion.value.trim() || null,
      carrera: carrera.value.trim() || null,
    });
    mostrarAviso("Guardado.");
    emit("actualizar");
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo guardar.");
  } finally {
    guardandoResumen.value = false;
  }
}

async function alternarPausa() {
  cambiandoPausa.value = true;
  try {
    const accion = props.tutoria.pausado ? "activar" : "pausar";
    await api.patch(`/mentorias/tutores/${props.tutoria.id}/${accion}`);
    emit("actualizar");
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo cambiar el estado.");
  } finally {
    cambiandoPausa.value = false;
  }
}

async function eliminarTutoria() {
  if (!window.confirm("¿Eliminar esta tutoría? Quedará archivada: ya no aparecerá en búsquedas, pero tu historial con tus tutorados se conserva.")) return;
  eliminando.value = true;
  try {
    await api.delete(`/mentorias/tutores/${props.tutoria.id}`);
    emit("actualizar");
    emit("cerrar");
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo eliminar.");
  } finally {
    eliminando.value = false;
  }
}

// ------------------------- Fechas -------------------------
const fecha = ref("");
const horaInicio = ref("");
const horaFin = ref("");
const agregandoHorario = ref(false);
const editandoId = ref(null);
const edicion = ref({ fecha: "", hora_inicio: "", hora_fin: "" });

async function agregarHorario() {
  if (!fecha.value || !horaInicio.value || !horaFin.value) return;
  agregandoHorario.value = true;
  try {
    await api.post(`/mentorias/tutores/${props.tutoria.id}/horarios`, {
      fecha: fecha.value,
      hora_inicio: horaInicio.value,
      hora_fin: horaFin.value,
    });
    fecha.value = "";
    horaInicio.value = "";
    horaFin.value = "";
    emit("actualizar");
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo agregar el horario.");
  } finally {
    agregandoHorario.value = false;
  }
}

function empezarEdicion(h) {
  editandoId.value = h.id;
  edicion.value = { fecha: h.fecha, hora_inicio: h.hora_inicio.slice(0, 5), hora_fin: h.hora_fin.slice(0, 5) };
}

function cancelarEdicion() {
  editandoId.value = null;
}

async function guardarEdicion(id) {
  try {
    await api.patch(`/mentorias/horarios/${id}`, edicion.value);
    editandoId.value = null;
    emit("actualizar");
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo editar el horario.");
  }
}

async function eliminarHorario(id) {
  if (!window.confirm("¿Eliminar este horario?")) return;
  try {
    await api.delete(`/mentorias/horarios/${id}`);
    emit("actualizar");
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo eliminar el horario.");
  }
}

// ------------------------- Tutorados -------------------------
const lugarPorSesion = ref({}); // { [sesionId]: texto }
const motivoPorSesion = ref({});

const pendientes = computed(() => props.sesiones.filter((s) => s.estado === "pendiente"));
const confirmadas = computed(() => props.sesiones.filter((s) => s.estado === "aceptada"));
const historial = computed(() => props.sesiones.filter((s) => ["completada", "cancelada", "rechazada"].includes(s.estado)));

async function responder(s, estado) {
  try {
    await api.patch(`/mentorias/sesiones/${s.id}/estado`, {
      estado,
      lugar_o_enlace: estado === "aceptada" ? (lugarPorSesion.value[s.id] || "") : undefined,
    });
    emit("actualizar");
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo actualizar la solicitud.");
  }
}

async function cancelarComoTutor(s) {
  if (!window.confirm("¿Cancelar esta sesión? Se avisará al estudiante.")) return;
  try {
    await api.patch(`/mentorias/sesiones/${s.id}/cancelar-tutor`, { motivo: motivoPorSesion.value[s.id] || "" });
    emit("actualizar");
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo cancelar la sesión.");
  }
}

async function concluir(s) {
  try {
    await api.patch(`/mentorias/sesiones/${s.id}/concluir`);
    emit("actualizar");
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo marcar como concluida.");
  }
}

async function ocultar(s) {
  try {
    await api.patch(`/mentorias/sesiones/${s.id}/ocultar`);
    emit("actualizar");
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo quitar de tu lista.");
  }
}
</script>

<template>
  <div class="modal-fondo" @click.self="emit('cerrar')">
    <div class="modal-caja">
      <button class="cerrar-x" @click="emit('cerrar')">✕</button>
      <h3>{{ tutoria.nombre_materia }}</h3>
      <p class="dato-muted">{{ tutoria.clave_materia }} · acreditada con {{ tutoria.calificacion_acreditada }}</p>

      <p v-if="aviso" class="aviso-alerta">{{ aviso }}</p>

      <nav class="ventana-tabs">
        <button :class="{ activo: tab === 'resumen' }" @click="tab = 'resumen'">Resumen</button>
        <button :class="{ activo: tab === 'fechas' }" @click="tab = 'fechas'">Fechas</button>
        <button :class="{ activo: tab === 'tutorados' }" @click="tab = 'tutorados'">
          Tutorados
          <span v-if="pendientes.length">({{ pendientes.length }})</span>
        </button>
      </nav>

      <!-- RESUMEN -->
      <div v-if="tab === 'resumen'" class="form-estilo">
        <label>
          Metodología / descripción
          <textarea v-model="descripcion" rows="3" />
        </label>
        <label>
          Carrera
          <input v-model="carrera" type="text" />
        </label>
        <button class="btn-primario" :disabled="guardandoResumen" @click="guardarResumen">
          {{ guardandoResumen ? "Guardando…" : "Guardar cambios" }}
        </button>

        <div class="btn-group margin-top">
          <button
            v-if="tutoria.activo && !tutoria.archivado"
            class="btn-secundario"
            :disabled="cambiandoPausa"
            @click="alternarPausa"
          >
            {{ tutoria.pausado ? "Reactivar" : "Pausar" }}
          </button>
          <button
            v-if="!tutoria.archivado"
            class="btn-sm btn-rojo"
            :disabled="eliminando"
            @click="eliminarTutoria"
          >
            Eliminar tutoría
          </button>
        </div>
        <p v-if="!tutoria.activo" class="dato-muted">Un administrador desactivó esta tutoría.</p>
      </div>

      <!-- FECHAS -->
      <div v-else-if="tab === 'fechas'">
        <div class="fila-horario-nueva">
          <input v-model="fecha" type="date" :min="hoy" />
          <input v-model="horaInicio" type="time" />
          <input v-model="horaFin" type="time" />
          <button class="btn-secundario" :disabled="agregandoHorario" @click="agregarHorario">Agregar</button>
        </div>

        <p v-if="horarios.length === 0" class="dato-muted">No has publicado horarios para esta tutoría.</p>
        <ul v-else class="lista-horarios">
          <li v-for="h in horarios" :key="h.id" class="horario-card">
            <template v-if="editandoId === h.id">
              <input v-model="edicion.fecha" type="date" :min="hoy" />
              <input v-model="edicion.hora_inicio" type="time" />
              <input v-model="edicion.hora_fin" type="time" />
              <div class="btn-group">
                <button class="btn-sm btn-verde" @click="guardarEdicion(h.id)">Guardar</button>
                <button class="btn-sm btn-gris" @click="cancelarEdicion">Cancelar</button>
              </div>
            </template>
            <template v-else>
              <span>{{ h.fecha }} · {{ h.hora_inicio.slice(0, 5) }}–{{ h.hora_fin.slice(0, 5) }}</span>
              <span v-if="h.reservado" class="badge badge-verde">Reservado</span>
              <div v-else class="btn-group">
                <button class="btn-sm btn-gris" @click="empezarEdicion(h)">Editar</button>
                <button class="btn-sm btn-rojo" @click="eliminarHorario(h.id)">Eliminar</button>
              </div>
            </template>
          </li>
        </ul>
      </div>

      <!-- TUTORADOS -->
      <div v-else>
        <h4>Pendientes</h4>
        <p v-if="pendientes.length === 0" class="dato-muted">No tienes solicitudes pendientes.</p>
        <div v-else class="grid-lista-simple">
          <article v-for="s in pendientes" :key="s.id" class="tarjeta-simple">
            <div>
              <strong>{{ s.solicitante_nombre }}</strong>
              <p v-if="s.horarios_tutor" class="subtexto">
                {{ s.horarios_tutor.fecha }} · {{ s.horarios_tutor.hora_inicio.slice(0, 5) }}–{{ s.horarios_tutor.hora_fin.slice(0, 5) }}
              </p>
              <p class="subtexto">"{{ s.mensaje }}"</p>
              <input
                v-model="lugarPorSesion[s.id]"
                type="text"
                placeholder="Lugar, link de videollamada, etc. (opcional)"
                style="margin-top: 0.4rem; padding: 0.4rem; border-radius: 6px; border: 1px solid #ccc; width: 100%"
              />
            </div>
            <div class="btn-group">
              <button class="btn-sm btn-verde" @click="responder(s, 'aceptada')">Aceptar</button>
              <button class="btn-sm btn-rojo" @click="responder(s, 'rechazada')">Rechazar</button>
            </div>
          </article>
        </div>

        <h4 class="margin-top">Confirmadas</h4>
        <p v-if="confirmadas.length === 0" class="dato-muted">No tienes sesiones confirmadas.</p>
        <div v-else class="grid-lista-simple">
          <article v-for="s in confirmadas" :key="s.id" class="tarjeta-simple">
            <div>
              <strong>{{ s.solicitante_nombre }}</strong>
              <p v-if="s.horarios_tutor" class="subtexto">
                {{ s.horarios_tutor.fecha }} · {{ s.horarios_tutor.hora_inicio.slice(0, 5) }}–{{ s.horarios_tutor.hora_fin.slice(0, 5) }}
              </p>
            </div>
            <div class="btn-group">
              <button
                v-if="s.horarios_tutor && yaPaso(s.horarios_tutor.fecha, s.horarios_tutor.hora_inicio)"
                class="btn-sm btn-verde"
                @click="concluir(s)"
              >
                Marcar concluida
              </button>
              <button class="btn-sm btn-rojo" @click="cancelarComoTutor(s)">Cancelar</button>
            </div>
          </article>
        </div>

        <h4 class="margin-top">Historial</h4>
        <p v-if="historial.length === 0" class="dato-muted">Sin sesiones concluidas, rechazadas o canceladas todavía.</p>
        <div v-else class="grid-lista-simple">
          <article v-for="s in historial" :key="s.id" class="tarjeta-simple">
            <div>
              <strong>{{ s.solicitante_nombre }}</strong>
              <span class="badge" :class="'estado-' + s.estado" style="margin-left: 0.4rem">{{ s.estado }}</span>
              <p v-if="s.motivo_cancelacion" class="subtexto">Motivo: {{ s.motivo_cancelacion }}</p>
            </div>
            <button class="btn-sm btn-gris" @click="ocultar(s)">Quitar de mi lista</button>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>
