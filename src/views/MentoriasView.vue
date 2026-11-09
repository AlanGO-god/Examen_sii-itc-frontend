<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { api } from "../services/api.js";
import AppIcon from "../components/icons/AppIcon.vue";

const seccion = ref("buscar"); // buscar | ofrecerme | enviadas | recibidas | admin
const esAdmin = ref(false);

const tutores = ref([]);
const busqueda = ref("");
const cargando = ref(false);
const error = ref("");

const placeholderAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='8' r='4' fill='%23a2a99d'/%3E%3Cpath d='M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7' fill='%23a2a99d'/%3E%3C/svg%3E";

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
const cargandoElegibles = ref(false);
const materiaElegida = ref("");
const descripcionOfrecerme = ref("");
const enviandoOfrecerme = ref(false);
const avisoOfrecerme = ref("");

const materiasDisponibles = computed(() => {
  const yaOfrecidas = new Set(misTutorias.value.map((t) => t.clave_materia));
  return materiasElegibles.value.filter((m) => !yaOfrecidas.has(m.clave_materia));
});

async function cargarDatosOfrecerme() {
  cargandoElegibles.value = true;
  try {
    const [{ data: elegibles }, { data: mias }] = await Promise.all([
      api.get("/mentorias/materias-elegibles"),
      api.get("/mentorias/tutores/mias"),
    ]);
    materiasElegibles.value = elegibles.materias || [];
    misTutorias.value = mias.tutores || [];
  } catch {
    // Fallback silencioso en error
  } finally {
    cargandoElegibles.value = false;
  }
}

async function ofrecerme() {
  enviandoOfrecerme.value = true;
  avisoOfrecerme.value = "";
  try {
    await api.post("/mentorias/tutores", {
      clave_materia: materiaElegida.value,
      descripcion: descripcionOfrecerme.value.trim() || null,
    });
    materiaElegida.value = "";
    descripcionOfrecerme.value = "";
    await cargarDatosOfrecerme();
  } catch (e) {
    avisoOfrecerme.value = e.response?.data?.message ?? "No se pudo completar el registro.";
  } finally {
    enviandoOfrecerme.value = false;
  }
}

// --- Mis horarios (como tutor) ---
const misHorarios = ref([]);
const tutoriaParaHorario = ref("");
const fechaHorario = ref("");
const horaInicioHorario = ref("");
const horaFinHorario = ref("");
const avisoHorario = ref("");
const cargandoHorarios = ref(false);

async function cargarMisHorarios() {
  cargandoHorarios.value = true;
  try {
    const { data } = await api.get("/mentorias/horarios/mios");
    misHorarios.value = data.horarios || [];
  } catch {
    misHorarios.value = [];
  } finally {
    cargandoHorarios.value = false;
  }
}

async function agregarHorario() {
  avisoHorario.value = "";
  try {
    await api.post(`/mentorias/tutores/${tutoriaParaHorario.value}/horarios`, {
      fecha: fechaHorario.value,
      hora_inicio: horaInicioHorario.value,
      hora_fin: horaFinHorario.value,
    });
    fechaHorario.value = "";
    horaInicioHorario.value = "";
    horaFinHorario.value = "";
    await cargarMisHorarios();
  } catch (e) {
    avisoHorario.value = e.response?.data?.message ?? "No se pudo agregar el horario.";
  }
}

async function eliminarHorario(id) {
  try {
    await api.delete(`/mentorias/horarios/${id}`);
    await cargarMisHorarios();
  } catch (e) {
    alert(e.response?.data?.message ?? "No se pudo eliminar el horario.");
  }
}

// --- Solicitudes Enviadas / Recibidas ---
const sesionesEnviadas = ref([]);
const sesionesRecibidas = ref([]);
const cargandoEnviadas = ref(false);
const cargandoRecibidas = ref(false);

async function cargarEnviadas() {
  cargandoEnviadas.value = true;
  try {
    const { data } = await api.get("/mentorias/sesiones/enviadas");
    sesionesEnviadas.value = data.sesiones || [];
  } finally {
    cargandoEnviadas.value = false;
  }
}

async function cargarRecibidas() {
  cargandoRecibidas.value = true;
  try {
    const { data } = await api.get("/mentorias/sesiones/recibidas");
    sesionesRecibidas.value = data.sesiones || [];
  } finally {
    cargandoRecibidas.value = false;
  }
}

async function responderSesion(id, estado) {
  try {
    await api.patch(`/mentorias/sesiones/${id}/estado`, { estado });
    await cargarRecibidas();
  } catch (e) {
    alert(e.response?.data?.message ?? "No se pudo actualizar la sesión.");
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
  } finally {
    cargandoAdminTutores.value = false;
  }
}

async function cargarAdminSesiones() {
  cargandoAdminSesiones.value = true;
  try {
    const { data } = await api.get("/mentorias/admin/sesiones");
    adminSesiones.value = data.sesiones || [];
  } finally {
    cargandoAdminSesiones.value = false;
  }
}

async function desactivarTutor(id) {
  await api.patch(`/mentorias/admin/tutores/${id}/desactivar`);
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

// Carga perezosa (Lazy loading) según sub-pestaña seleccionada
watch(seccion, (nuevaSeccion) => {
  if (nuevaSeccion === "ofrecerme") {
    if (materiasElegibles.value.length === 0) cargarDatosOfrecerme();
    if (misHorarios.value.length === 0) cargarMisHorarios();
  }
  if (nuevaSeccion === "enviadas" && sesionesEnviadas.value.length === 0) cargarEnviadas();
  if (nuevaSeccion === "recibidas" && sesionesRecibidas.value.length === 0) cargarRecibidas();
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
              <p class="dato-muted">No. Control: {{ tutorSeleccionado.numero_control }}</p>
              <p v-if="tutorSeleccionado.email" class="dato-muted">{{ tutorSeleccionado.email }}</p>
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
      <div class="panel-card">
        <h3>Ofrecer nueva tutoría</h3>
        <p class="subtexto">Materias aprobadas en tu expediente que califican para impartir mentoría.</p>

        <p v-if="cargandoElegibles">Consultando materias elegibles…</p>
        <p v-else-if="materiasDisponibles.length === 0">
          No tienes materias disponibles pendientes por ofrecer (o tus calificaciones aún no alcanzan el promedio mínimo requerido).
        </p>
        <form v-else class="form-estilo" @submit.prevent="ofrecerme">
          <label>
            Materia a impartir
            <select v-model="materiaElegida">
              <option value="" disabled>Selecciona una materia elegible</option>
              <option v-for="m in materiasDisponibles" :key="m.clave_materia" :value="m.clave_materia">
                {{ m.nombre_materia }} (Acreditada con {{ m.calificacion }})
              </option>
            </select>
          </label>
          <label>
            Metodología o descripción corta
            <textarea v-model="descripcionOfrecerme" rows="3" placeholder="Ej. Ayudo con ejercicios prácticos, preparación para exámenes..." />
          </label>
          <p v-if="avisoOfrecerme" class="aviso-alerta">{{ avisoOfrecerme }}</p>
          <button class="btn-primario" type="submit" :disabled="!materiaElegida || enviandoOfrecerme">
            {{ enviandoOfrecerme ? "Guardando…" : "Publicar como Tutor" }}
          </button>
        </form>
      </div>

      <div class="panel-card margin-top">
        <h3>Mis materias ofertadas</h3>
        <p v-if="misTutorias.length === 0">Aún no te has registrado como tutor en ninguna materia.</p>
        <div v-else class="grid-lista-simple">
          <article v-for="t in misTutorias" :key="t.id" class="tarjeta-simple">
            <div>
              <strong>{{ t.nombre_materia }}</strong>
              <span class="dato-muted"> ({{ t.clave_materia }})</span>
            </div>
            <span v-if="!t.activo" class="badge badge-rojo">Desactivada por admin</span>
            <span v-else class="badge badge-verde">Activa</span>
          </article>
        </div>
      </div>

      <div class="panel-card margin-top">
        <h3>Mis horarios de atención</h3>
        <p class="subtexto">Publica fechas y horas concretas en las que puedes dar tutoría.</p>

        <form class="form-estilo" @submit.prevent="agregarHorario">
          <label>
            Tutoría
            <select v-model="tutoriaParaHorario">
              <option value="" disabled>Selecciona una de tus tutorías</option>
              <option v-for="t in misTutorias.filter((t) => t.activo)" :key="t.id" :value="t.id">
                {{ t.nombre_materia }}
              </option>
            </select>
          </label>
          <label>
            Fecha
            <input v-model="fechaHorario" type="date" />
          </label>
          <label>
            Hora de inicio
            <input v-model="horaInicioHorario" type="time" />
          </label>
          <label>
            Hora de fin
            <input v-model="horaFinHorario" type="time" />
          </label>
          <p v-if="avisoHorario" class="aviso-alerta">{{ avisoHorario }}</p>
          <button
            class="btn-primario"
            type="submit"
            :disabled="!tutoriaParaHorario || !fechaHorario || !horaInicioHorario || !horaFinHorario"
          >
            Agregar horario
          </button>
        </form>

        <p v-if="cargandoHorarios" class="dato-muted">Cargando tus horarios…</p>
        <p v-else-if="misHorarios.length === 0" class="dato-muted">No has publicado ningún horario todavía.</p>
        <div v-else class="grid-lista-simple">
          <article v-for="h in misHorarios" :key="h.id" class="tarjeta-simple">
            <div>
              <strong>{{ h.tutores?.nombre_materia }}</strong>
              <p class="subtexto">{{ h.fecha }} · {{ h.hora_inicio.slice(0, 5) }}–{{ h.hora_fin.slice(0, 5) }}</p>
            </div>
            <span v-if="h.reservado" class="badge badge-verde">Reservado</span>
            <button v-else class="btn-sm btn-rojo" @click="eliminarHorario(h.id)">Eliminar</button>
          </article>
        </div>
      </div>
    </div>

    <!-- SECCIÓN: SOLICITUDES ENVIADAS -->
    <div v-else-if="seccion === 'enviadas'" class="seccion-contenido">
      <p v-if="cargandoEnviadas">Cargando solicitudes…</p>
      <p v-else-if="sesionesEnviadas.length === 0">No has solicitado ninguna tutoría todavía.</p>
      <div v-else class="grid-lista-simple">
        <article v-for="s in sesionesEnviadas" :key="s.id" class="tarjeta-simple">
          <div>
            <strong>{{ s.tutores?.nombre_materia }}</strong>
            <p class="subtexto">Tutor: {{ s.tutores?.nombre }}</p>
            <p class="mensaje-cuerpo">"{{ s.mensaje }}"</p>
          </div>
          <span class="badge" :class="'estado-' + s.estado">{{ s.estado }}</span>
        </article>
      </div>
    </div>

    <!-- SECCIÓN: SOLICITUDES RECIBIDAS -->
    <div v-else-if="seccion === 'recibidas'" class="seccion-contenido">
      <p v-if="cargandoRecibidas">Cargando solicitudes recibidas…</p>
      <p v-else-if="sesionesRecibidas.length === 0">No has recibido solicitudes de tutoría.</p>
      <div v-else class="grid-lista-simple">
        <article v-for="s in sesionesRecibidas" :key="s.id" class="tarjeta-simple">
          <div>
            <strong>Solicitante: {{ s.solicitante_nombre }}</strong>
            <p class="mensaje-cuerpo">"{{ s.mensaje }}"</p>
          </div>
          <div class="acciones-inline">
            <span class="badge" :class="'estado-' + s.estado">{{ s.estado }}</span>
            <div v-if="s.estado === 'pendiente'" class="btn-group">
              <button class="btn-sm btn-verde" @click="responderSesion(s.id, 'aceptada')">Aceptar</button>
              <button class="btn-sm btn-rojo" @click="responderSesion(s.id, 'rechazada')">Rechazar</button>
            </div>
          </div>
        </article>
      </div>
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
            Student Key / No. Control
            <input v-model="nuevoAdminKey" type="text" placeholder="Ej. 22030184" />
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
  background: rgba(0, 0, 0, 0.04);
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
.subtexto {
  font-size: 0.82rem;
  color: #6b7280;
  margin: 0.15rem 0 0.35rem;
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

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-weight: 600;
}
.badge-verde { background: #d1e7dd; color: #0f5132; }
.badge-subtil { background: #e9ecef; color: #495057; }
.badge-rojo { background: #f8d7da; color: #842029; }

/* Botones */
.btn-primario {
  background: #1b382b;
  color: #fdfbf7;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}
.btn-primario:hover { background: #284e3d; }
.btn-secundario {
  background: transparent;
  border: 1px solid #ccc;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}
.btn-sm {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-verde { background: #d1e7dd; color: #0f5132; }
.btn-rojo { background: #f8d7da; color: #842029; }
.btn-group { display: flex; gap: 0.5rem; }

/* Modales */
.modal-fondo {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-caja {
  background: #fdfbf7;
  padding: 1.75rem;
  border-radius: 16px;
  width: min(500px, 92vw);
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}
.cerrar-x {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
}
.avatar-modal {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}
.detalle-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}
.materia-destacada {
  background: #f3efe6;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.lista-horarios {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.horario-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.85rem;
  border: 1px solid #e2ded4;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.88rem;
}
.horario-card.seleccionado {
  border-color: #1b382b;
  background: rgba(27, 56, 43, 0.05);
}
.horario-card.ocupado {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Form y Paneles */
.panel-card {
  background: #fdfbf7;
  border: 1px solid #e5e0d8;
  border-radius: 14px;
  padding: 1.5rem;
}
.margin-top { margin-top: 1.5rem; }
.form-estilo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 480px;
  margin-top: 1rem;
}
.form-estilo label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.9rem;
  font-weight: 600;
}
.form-estilo input, .form-estilo select, .form-estilo textarea, .mensaje-reserva-block textarea {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-family: inherit;
}
.grid-lista-simple {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 1rem;
}
.tarjeta-simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e0d8;
  padding: 0.85rem 1rem;
  border-radius: 10px;
}

/* Estados */
.estado-pendiente { background: #fff3cd; color: #664d03; }
.estado-aceptada { background: #d1e7dd; color: #0f5132; }
.estado-rechazada { background: #f8d7da; color: #842029; }
.aviso-alerta { font-size: 0.85rem; color: #b02a37; margin-top: 0.4rem; }
</style>