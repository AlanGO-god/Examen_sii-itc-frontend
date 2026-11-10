<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { api } from "../services/api.js";
import AppIcon from "../components/icons/AppIcon.vue";
import FormularioOfrecerTutoria from "../components/mentorias/FormularioOfrecerTutoria.vue";
import TarjetasTutorias from "../components/mentorias/TarjetasTutorias.vue";
import VentanaTutoria from "../components/mentorias/VentanaTutoria.vue";
import DetalleSolicitud from "../components/mentorias/DetalleSolicitud.vue";

const seccion = ref("buscar"); // buscar | ofrecerme | enviadas | recibidas | admin
const esAdmin = ref(false);

const tutores = ref([]);
const busqueda = ref("");
const cargando = ref(false);
const error = ref("");

const placeholderAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='8' r='4' fill='%23a2a99d'/%3E%3Cpath d='M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7' fill='%23a2a99d'/%3E%3C/svg%3E";

// Aviso general (reemplaza a los alert() del navegador)
const avisoGlobal = ref("");
let avisoTimer = null;
function mostrarAviso(mensaje) {
  avisoGlobal.value = mensaje;
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => (avisoGlobal.value = ""), 5000);
}

function formatoFecha(fecha) {
  if (!fecha) return "";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function cargarTutores() {
  cargando.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/mentorias/tutores");
    tutores.value = data.tutores || [];
  } catch {
    error.value = "No se pudo cargar la lista de tutores.";
  } finally {
    cargando.value = false;
  }
}

const tutoresFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  if (!texto) return tutores.value;
  return tutores.value.filter(
    (t) =>
      t.nombre_materia?.toLowerCase().includes(texto) ||
      t.clave_materia?.toLowerCase().includes(texto) ||
      t.nombre?.toLowerCase().includes(texto)
  );
});

// --- Detalle del tutor y reserva de horario ---
const tutorSeleccionado = ref(null);
const horariosDetalle = ref([]);
const cargandoHorariosDetalle = ref(false);
const horarioElegido = ref(null);
const mensajeSolicitud = ref("");
const enviandoSolicitud = ref(false);
const avisoSolicitud = ref("");

async function abrirDetalle(tutor) {
  tutorSeleccionado.value = tutor;
  horarioElegido.value = null;
  mensajeSolicitud.value = "";
  avisoSolicitud.value = "";
  cargandoHorariosDetalle.value = true;
  try {
    const { data } = await api.get(`/mentorias/tutores/${tutor.id}/horarios`);
    horariosDetalle.value = data.horarios || [];
  } catch {
    horariosDetalle.value = [];
  } finally {
    cargandoHorariosDetalle.value = false;
  }
}

function cerrarDetalle() {
  tutorSeleccionado.value = null;
  horarioElegido.value = null;
  mensajeSolicitud.value = "";
  avisoSolicitud.value = "";
}

async function enviarSolicitud() {
  if (!horarioElegido.value || !mensajeSolicitud.value.trim()) {
    avisoSolicitud.value = "Escribe un mensaje y selecciona un horario antes de reservar.";
    return;
  }
  enviandoSolicitud.value = true;
  avisoSolicitud.value = "";
  try {
    await api.post("/mentorias/sesiones", {
      horario_id: horarioElegido.value,
      mensaje: mensajeSolicitud.value.trim(),
    });
    avisoSolicitud.value = "¡Solicitud enviada con éxito!";
    setTimeout(cerrarDetalle, 1200);
  } catch (e) {
    avisoSolicitud.value = e.response?.data?.message ?? "No se pudo enviar la solicitud.";
  } finally {
    enviandoSolicitud.value = false;
  }
}

// --- Ofrecerme como Tutor ---
const materiasElegibles = ref([]);
const misTutorias = ref([]);
const misHorarios = ref([]);
const cargandoOfrecerme = ref(false);

const materiasDisponibles = computed(() => {
  const yaOfrecidas = new Set(misTutorias.value.filter((t) => !t.archivado).map((t) => t.clave_materia));
  return materiasElegibles.value.filter((m) => !yaOfrecidas.has(m.clave_materia));
});

async function cargarDatosOfrecerme() {
  cargandoOfrecerme.value = true;
  try {
    const [{ data: elegibles }, { data: mias }, { data: horarios }] = await Promise.all([
      api.get("/mentorias/materias-elegibles"),
      api.get("/mentorias/tutores/mias"),
      api.get("/mentorias/horarios/mios"),
    ]);
    materiasElegibles.value = elegibles.materias || [];
    misTutorias.value = mias.tutores || [];
    misHorarios.value = horarios.horarios || [];
  } catch {
    // Fallback silencioso en error
  } finally {
    cargandoOfrecerme.value = false;
  }
}

// --- Ventana de detalle de una tutoría propia (Resumen / Fechas / Tutorados) ---
const tutoriaAbierta = ref(null);

function abrirVentanaTutoria(t) {
  tutoriaAbierta.value = t;
}
function cerrarVentanaTutoria() {
  tutoriaAbierta.value = null;
}

const horariosDeLaTutoriaAbierta = computed(() =>
  tutoriaAbierta.value ? misHorarios.value.filter((h) => h.tutor_id === tutoriaAbierta.value.id) : []
);
const sesionesDeLaTutoriaAbierta = computed(() =>
  tutoriaAbierta.value ? sesionesRecibidas.value.filter((s) => s.tutor_id === tutoriaAbierta.value.id) : []
);

async function actualizarTrasAccionTutoria() {
  await cargarDatosOfrecerme();
  await cargarRecibidas();
  // Mantiene la ventana abierta sincronizada con los datos frescos
  if (tutoriaAbierta.value) {
    const actualizada = misTutorias.value.find((t) => t.id === tutoriaAbierta.value.id);
    if (actualizada) tutoriaAbierta.value = actualizada;
  }
}

// --- Solicitudes Enviadas / Recibidas ---
const sesionesEnviadas = ref([]);
const sesionesRecibidas = ref([]);
const cargandoEnviadas = ref(false);
const cargandoRecibidas = ref(false);
const solicitudAbierta = ref(null); // { sesion, rol }

function abrirSolicitud(sesion, rol) {
  solicitudAbierta.value = { sesion, rol };
}
function cerrarSolicitud() {
  solicitudAbierta.value = null;
}

async function cargarEnviadas() {
  cargandoEnviadas.value = true;
  try {
    const { data } = await api.get("/mentorias/sesiones/enviadas");
    sesionesEnviadas.value = data.sesiones || [];
  } catch {
    mostrarAviso("No se pudieron cargar tus solicitudes.");
  } finally {
    cargandoEnviadas.value = false;
  }
}

async function cargarRecibidas() {
  cargandoRecibidas.value = true;
  try {
    const { data } = await api.get("/mentorias/sesiones/recibidas");
    sesionesRecibidas.value = data.sesiones || [];
  } catch {
    mostrarAviso("No se pudieron cargar las solicitudes recibidas.");
  } finally {
    cargandoRecibidas.value = false;
  }
}

// --- Admin ---
const adminTutores = ref([]);
const adminSesiones = ref([]);
const cargandoAdminTutores = ref(false);
const cargandoAdminSesiones = ref(false);
const nuevoAdminKey = ref("");
const nuevoAdminNombre = ref("");
const avisoAdmin = ref("");

async function cargarAdminTutores() {
  cargandoAdminTutores.value = true;
  try {
    const { data } = await api.get("/mentorias/admin/tutores");
    adminTutores.value = data.tutores || [];
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo cargar la lista de tutores.");
  } finally {
    cargandoAdminTutores.value = false;
  }
}

async function cargarAdminSesiones() {
  cargandoAdminSesiones.value = true;
  try {
    const { data } = await api.get("/mentorias/admin/sesiones");
    adminSesiones.value = data.sesiones || [];
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudieron cargar las sesiones.");
  } finally {
    cargandoAdminSesiones.value = false;
  }
}

async function desactivarTutor(id) {
  if (!window.confirm("¿Desactivar a este tutor? Dejará de aparecer en las búsquedas.")) return;
  try {
    await api.patch(`/mentorias/admin/tutores/${id}/desactivar`);
  } catch (e) {
    mostrarAviso(e.response?.data?.message ?? "No se pudo desactivar al tutor.");
  }
  await cargarAdminTutores();
}

async function agregarAdmin() {
  avisoAdmin.value = "";
  try {
    await api.post("/mentorias/admin/admins", {
      student_key: nuevoAdminKey.value.trim(),
      nombre: nuevoAdminNombre.value.trim() || null,
    });
    avisoAdmin.value = "Administrador agregado correctamente.";
    nuevoAdminKey.value = "";
    nuevoAdminNombre.value = "";
  } catch (e) {
    avisoAdmin.value = e.response?.data?.message ?? "No se pudo agregar el administrador.";
  }
}

// Cada vez que se entra a una pestaña se vuelve a pedir su información, para
// no mostrar datos viejos (por ejemplo, una solicitud que ya fue aceptada).
watch(seccion, (nuevaSeccion) => {
  if (nuevaSeccion === "buscar") cargarTutores();
  if (nuevaSeccion === "ofrecerme") cargarDatosOfrecerme();
  if (nuevaSeccion === "enviadas") cargarEnviadas();
  if (nuevaSeccion === "recibidas") cargarRecibidas();
  if (nuevaSeccion === "admin" && esAdmin.value) {
    cargarAdminTutores();
    cargarAdminSesiones();
  }
});

onMounted(async () => {
  await cargarTutores();
  try {
    await api.get("/mentorias/admin/ping");
    esAdmin.value = true;
  } catch {
    esAdmin.value = false;
  }
});
</script>

<template>
  <section class="folio">
    <!-- Encabezado de la Sección -->
    <header class="encabezado">
      <div class="encabezado-titulo">
        <AppIcon name="mentoria" class="encabezado-icono" />
        <h1>Mentorías</h1>
      </div>
      <p class="encabezado-sub">Conecta con tutores, solicita asesorías académicas o apoya a tus compañeros.</p>
    </header>

    <p v-if="avisoGlobal" class="aviso-global" role="alert">{{ avisoGlobal }}</p>

    <!-- Navegación por Sub-Pestañas -->
    <nav class="sub-tabs">
      <button :class="{ activo: seccion === 'buscar' }" @click="seccion = 'buscar'">
        <AppIcon name="buscar" class="tab-icon" /> Buscar tutor
      </button>
      <button :class="{ activo: seccion === 'ofrecerme' }" @click="seccion = 'ofrecerme'">Ofrecerme como tutor</button>
      <button :class="{ activo: seccion === 'enviadas' }" @click="seccion = 'enviadas'">Mis solicitudes</button>
      <button :class="{ activo: seccion === 'recibidas' }" @click="seccion = 'recibidas'">Solicitudes recibidas</button>
      <button v-if="esAdmin" :class="{ activo: seccion === 'admin' }" @click="seccion = 'admin'">Administración</button>
    </nav>

    <!-- SECCIÓN: BUSCAR TUTOR -->
    <div v-if="seccion === 'buscar'" class="seccion-contenido">
      <div class="buscador-pill">
        <AppIcon name="buscar" class="buscar-icono" />
        <input v-model="busqueda" type="text" placeholder="Buscar por materia, clave o nombre del tutor..." />
      </div>

      <p v-if="cargando" class="estado-mensaje">Cargando la lista de tutores…</p>
      <p v-else-if="error" class="estado-mensaje error">{{ error }}</p>
      <p v-else-if="tutoresFiltrados.length === 0" class="estado-mensaje">No se encontraron tutores disponibles.</p>

      <!-- Lista de Tutores (Bento Grid Style) -->
      <div v-else class="grid-tutores">
        <article v-for="t in tutoresFiltrados" :key="t.id" class="tarjeta-tutor">
          <div class="tutor-header">
            <img
              :src="t.foto ? `data:image/jpeg;base64,${t.foto}` : placeholderAvatar"
              class="tutor-avatar"
              alt="Foto tutor"
            />
            <div class="tutor-datos-principales">
              <h3>{{ t.nombre }}</h3>
              <p class="subtexto">{{ t.carrera || 'Estudiante ITC' }}</p>
              <div class="tags-row">
                <span class="badge badge-verde">Acreditó con {{ t.calificacion_acreditada }}</span>
              </div>
            </div>
          </div>

          <div class="tutor-materia-box">
            <span class="materia-nombre">{{ t.nombre_materia }}</span>
            <span class="materia-clave">{{ t.clave_materia }}</span>
          </div>

          <p v-if="t.descripcion" class="tutor-descripcion">"{{ t.descripcion }}"</p>

          <div class="tutor-footer">
            <button class="btn-primario" @click="abrirDetalle(t)">
              Ver disponibilidad y reservar
            </button>
          </div>
        </article>
      </div>

      <!-- MODAL DETALLE DE TUTOR -->
      <div v-if="tutorSeleccionado" class="modal-fondo" @click.self="cerrarDetalle">
        <div class="modal-caja modal-detalle">
          <button class="cerrar-x" @click="cerrarDetalle">✕</button>

          <div class="detalle-header">
            <img
              :src="tutorSeleccionado.foto ? `data:image/jpeg;base64,${tutorSeleccionado.foto}` : placeholderAvatar"
              class="avatar-modal"
              alt=""
            />
            <div>
              <h3>{{ tutorSeleccionado.nombre }}</h3>
              <p class="dato-muted">{{ tutorSeleccionado.carrera }}</p>
            </div>
          </div>

          <div class="materia-destacada">
            <strong>{{ tutorSeleccionado.nombre_materia }}</strong> ({{ tutorSeleccionado.clave_materia }})
            <p>Calificación obtenida: <strong>{{ tutorSeleccionado.calificacion_acreditada }} pts</strong></p>
          </div>

          <p v-if="tutorSeleccionado.descripcion" class="detalle-descripcion">{{ tutorSeleccionado.descripcion }}</p>

          <h4 class="seccion-titulo-sm">Horarios disponibles</h4>
          <p v-if="cargandoHorariosDetalle" class="dato-muted">Cargando horarios de atención…</p>
          <p v-else-if="horariosDetalle.length === 0" class="dato-muted">Este tutor no tiene horarios activos publicados.</p>
          <ul v-else class="lista-horarios">
            <li v-for="h in horariosDetalle" :key="h.id">
              <label :class="{ ocupado: !h.disponible, seleccionado: horarioElegido === h.id }" class="horario-card">
                <input type="radio" name="horario" :value="h.id" :disabled="!h.disponible" v-model="horarioElegido" />
                <span>{{ h.fecha }} · {{ h.hora_inicio.slice(0, 5) }} – {{ h.hora_fin.slice(0, 5) }} hrs</span>
                <span v-if="!h.disponible" class="tag-ocupado">Reservado</span>
              </label>
            </li>
          </ul>

          <div v-if="horarioElegido" class="mensaje-reserva-block">
            <label>
              <strong>Mensaje para el tutor:</strong>
              <textarea v-model="mensajeSolicitud" rows="3" placeholder="Describe brevemente los temas o dudas que necesitas revisar..." />
            </label>
          </div>

          <p v-if="avisoSolicitud" class="aviso-alerta">{{ avisoSolicitud }}</p>

          <div class="modal-acciones">
            <button class="btn-secundario" @click="cerrarDetalle">Cancelar</button>
            <button v-if="horarioElegido" class="btn-primario" :disabled="enviandoSolicitud" @click="enviarSolicitud">
              {{ enviandoSolicitud ? "Enviando…" : "Confirmar reserva" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SECCIÓN: OFRECERME COMO TUTOR -->
    <div v-else-if="seccion === 'ofrecerme'" class="seccion-contenido">
      <p v-if="cargandoOfrecerme" class="dato-muted">Cargando tu información de tutor…</p>
      <template v-else>
        <FormularioOfrecerTutoria :materias-disponibles="materiasDisponibles" @publicado="cargarDatosOfrecerme" />
        <TarjetasTutorias
          :tutorias="misTutorias"
          :horarios="misHorarios"
          :sesiones-recibidas="sesionesRecibidas"
          @abrir="abrirVentanaTutoria"
        />
      </template>

      <VentanaTutoria
        v-if="tutoriaAbierta"
        :tutoria="tutoriaAbierta"
        :horarios="horariosDeLaTutoriaAbierta"
        :sesiones="sesionesDeLaTutoriaAbierta"
        @cerrar="cerrarVentanaTutoria"
        @actualizar="actualizarTrasAccionTutoria"
      />
    </div>

    <!-- SECCIÓN: SOLICITUDES ENVIADAS -->
    <div v-else-if="seccion === 'enviadas'" class="seccion-contenido">
      <p v-if="cargandoEnviadas">Cargando solicitudes…</p>
      <p v-else-if="sesionesEnviadas.length === 0">No has solicitado ninguna tutoría todavía.</p>
      <div v-else class="grid-lista-simple">
        <article
          v-for="s in sesionesEnviadas"
          :key="s.id"
          class="tarjeta-simple clicable"
          @click="abrirSolicitud(s, 'solicitante')"
        >
          <div>
            <strong>{{ s.tutores?.nombre_materia }}</strong>
            <p class="subtexto">Tutor: {{ s.tutores?.nombre }}</p>
            <p v-if="s.horarios_tutor" class="subtexto">
              {{ formatoFecha(s.horarios_tutor.fecha) }} · {{ s.horarios_tutor.hora_inicio.slice(0, 5) }} – {{ s.horarios_tutor.hora_fin.slice(0, 5) }} hrs
            </p>
          </div>
          <span class="badge" :class="'estado-' + s.estado">{{ s.estado }}</span>
        </article>
      </div>

      <DetalleSolicitud
        v-if="solicitudAbierta"
        :sesion="solicitudAbierta.sesion"
        :rol="solicitudAbierta.rol"
        @cerrar="cerrarSolicitud"
        @actualizado="cargarEnviadas"
      />
    </div>

    <!-- SECCIÓN: SOLICITUDES RECIBIDAS -->
    <div v-else-if="seccion === 'recibidas'" class="seccion-contenido">
      <p v-if="cargandoRecibidas">Cargando solicitudes recibidas…</p>
      <p v-else-if="sesionesRecibidas.length === 0">No has recibido solicitudes de tutoría.</p>
      <div v-else class="grid-lista-simple">
        <article
          v-for="s in sesionesRecibidas"
          :key="s.id"
          class="tarjeta-simple clicable"
          @click="abrirSolicitud(s, 'tutor')"
        >
          <div>
            <strong>Solicitante: {{ s.solicitante_nombre }}</strong>
            <p class="subtexto">{{ s.tutores?.nombre_materia }}</p>
            <p v-if="s.horarios_tutor" class="subtexto">
              {{ formatoFecha(s.horarios_tutor.fecha) }} · {{ s.horarios_tutor.hora_inicio.slice(0, 5) }} – {{ s.horarios_tutor.hora_fin.slice(0, 5) }} hrs
            </p>
          </div>
          <span class="badge" :class="'estado-' + s.estado">{{ s.estado }}</span>
        </article>
      </div>

      <DetalleSolicitud
        v-if="solicitudAbierta"
        :sesion="solicitudAbierta.sesion"
        :rol="solicitudAbierta.rol"
        @cerrar="cerrarSolicitud"
        @actualizado="cargarRecibidas"
      />
    </div>

    <!-- SECCIÓN: ADMINISTRACIÓN -->
    <div v-else-if="seccion === 'admin'" class="seccion-contenido">
      <div class="panel-card">
        <h3>Panel de Administración - Tutores</h3>
        <p v-if="cargandoAdminTutores">Cargando tutores del sistema…</p>
        <div v-else class="grid-lista-simple">
          <article v-for="t in adminTutores" :key="t.id" class="tarjeta-simple">
            <div>
              <strong>{{ t.nombre_materia }}</strong> ({{ t.clave_materia }})
              <p class="subtexto">{{ t.nombre }} · {{ t.numero_control }}</p>
              <p class="subtexto dato-mono">student_key: {{ t.student_key }}</p>
            </div>
            <div class="acciones-inline">
              <span class="badge" :class="t.activo ? 'badge-verde' : 'badge-rojo'">
                {{ t.activo ? "Activo" : "Inactivo" }}
              </span>
              <button v-if="t.activo" class="btn-sm btn-rojo" @click="desactivarTutor(t.id)">Desactivar</button>
            </div>
          </article>
        </div>
      </div>

      <div class="panel-card margin-top">
        <h3>Agregar nuevo Administrador</h3>
        <form class="form-estilo" @submit.prevent="agregarAdmin">
          <label>
            Student Key (ID de sesión)
            <input v-model="nuevoAdminKey" type="text" placeholder="Identificador de sesión del estudiante" />
          </label>
          <label>
            Nombre (Opcional)
            <input v-model="nuevoAdminNombre" type="text" placeholder="Nombre completo" />
          </label>
          <p v-if="avisoAdmin" class="aviso-alerta">{{ avisoAdmin }}</p>
          <button class="btn-primario" type="submit" :disabled="!nuevoAdminKey">Agregar Admin</button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Contenedor Principal */
.folio {
  max-width: 1080px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: inherit;
}

/* Encabezado */
.encabezado {
  margin-bottom: 1.5rem;
}
.encabezado-titulo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.encabezado-titulo h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--ink, #1f2937);
  margin: 0;
}
.encabezado-sub {
  color: #6b7280;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

/* Navegación por Pestañas */
.sub-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 0.75rem;
}
.sub-tabs button {
  padding: 0.5rem 1.1rem;
  border-radius: 99px;
  border: 1px solid transparent;
  background: var(--paper, #fdfbf7);
  color: var(--ink, #2c3e50);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.sub-tabs button:hover {
  background: rgba(0, 0, 0, 0.08);
}
.sub-tabs button.activo {
  background: #1b382b;
  color: #fdfbf7;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(27, 56, 43, 0.2);
}

/* Buscador */
.buscador-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fdfbf7;
  border: 1px solid #e2ded4;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
.buscador-pill input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 0.95rem;
  outline: none;
}

/* Grid Bento de Tutores */
.grid-tutores {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}
.tarjeta-tutor {
  background: #fdfbf7;
  border: 1px solid #e5e0d8;
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: transform 0.2s, box-shadow 0.2s;
}
.tarjeta-tutor:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.06);
}

/* Header del Tutor */
.tutor-header {
  display: flex;
  gap: 0.85rem;
  align-items: center;
}
.tutor-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #1b382b;
}
.tutor-datos-principales h3 {
  font-size: 1.05rem;
  margin: 0;
  color: #1b382b;
}
.tags-row {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

/* Cajas e Insignias */
.tutor-materia-box {
  background: rgba(27, 56, 43, 0.05);
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  margin: 0.85rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.materia-nombre {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1b382b;
}
.materia-clave {
  font-size: 0.8rem;
  color: #666;
}
.tutor-descripcion {
  font-size: 0.85rem;
  color: #4b5563;
  font-style: italic;
  margin-bottom: 1rem;
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1rem;
}
.tag-ocupado {
  font-size: 0.75rem;
  color: #842029;
}
.mensaje-reserva-block textarea {
  width: 100%;
  margin-top: 0.3rem;
}
.seccion-titulo-sm {
  font-size: 0.95rem;
  margin: 1rem 0 0.5rem;
}
.estado-mensaje {
  color: #6b7280;
  padding: 1rem 0;
}
.estado-mensaje.error {
  color: #842029;
}
.acciones-inline {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.dato-mono {
  font-family: monospace;
  font-size: 0.78rem;
}
</style>
