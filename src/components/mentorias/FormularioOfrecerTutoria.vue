<script setup>
import { ref } from "vue";
import { api } from "../../services/api.js";

const props = defineProps({
  materiasDisponibles: { type: Array, default: () => [] },
});
const emit = defineEmits(["publicado"]);

const materiaElegida = ref("");
const descripcion = ref("");
const carrera = ref("");
const enviando = ref(false);
const aviso = ref("");

// --- Horarios en borrador: se agregan/quitan aquí, y solo se mandan al
// backend hasta que se publica la tutoría completa en una sola operación ---
const horarios = ref([]); // [{fecha, hora_inicio, hora_fin}]
const fecha = ref("");
const horaInicio = ref("");
const horaFin = ref("");
const repetirSemanas = ref(1);
const avisoHorario = ref("");

const hoy = new Date().toLocaleDateString("en-CA");

function agregarADraft() {
  avisoHorario.value = "";
  if (!fecha.value || !horaInicio.value || !horaFin.value) {
    avisoHorario.value = "Completa fecha, hora de inicio y hora de fin.";
    return;
  }
  if (horaFin.value <= horaInicio.value) {
    avisoHorario.value = "La hora de fin debe ser después de la hora de inicio.";
    return;
  }

  const n = Math.max(1, Math.min(12, Number(repetirSemanas.value) || 1));
  const base = new Date(`${fecha.value}T00:00:00`);
  let agregados = 0;

  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i * 7);
    const fechaStr = d.toLocaleDateString("en-CA");

    const seTraslapaConDraft = horarios.value.some(
      (h) => h.fecha === fechaStr && horaInicio.value < h.hora_fin && h.hora_inicio < horaFin.value
    );
    if (seTraslapaConDraft) continue;

    horarios.value.push({ fecha: fechaStr, hora_inicio: horaInicio.value, hora_fin: horaFin.value });
    agregados++;
  }

  horarios.value.sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio));
  if (agregados === 0) {
    avisoHorario.value = "Esas fechas ya estaban en tu lista o se traslapan entre sí.";
  } else if (agregados < n) {
    avisoHorario.value = `Se agregaron ${agregados} de ${n} (las demás se traslapaban con otra ya agregada).`;
  }

  fecha.value = "";
  horaInicio.value = "";
  horaFin.value = "";
  repetirSemanas.value = 1;
}

function quitarDeDraft(idx) {
  horarios.value.splice(idx, 1);
}

async function publicar() {
  if (!materiaElegida.value) return;
  enviando.value = true;
  aviso.value = "";
  try {
    await api.post("/mentorias/tutores", {
      clave_materia: materiaElegida.value,
      descripcion: descripcion.value.trim() || null,
      carrera: carrera.value.trim() || null,
      horarios: horarios.value,
    });
    materiaElegida.value = "";
    descripcion.value = "";
    carrera.value = "";
    horarios.value = [];
    emit("publicado");
  } catch (e) {
    aviso.value = e.response?.data?.message ?? "No se pudo publicar la tutoría.";
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div class="panel-card">
    <h3>Ofrecer nueva tutoría</h3>
    <p class="subtexto">Materias aprobadas en tu expediente que califican para impartir mentoría.</p>

    <p v-if="materiasDisponibles.length === 0" class="dato-muted">
      No tienes materias disponibles pendientes por ofrecer (o tus calificaciones aún no alcanzan el promedio mínimo requerido).
    </p>
    <form v-else class="form-estilo" @submit.prevent="publicar">
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
        <textarea v-model="descripcion" rows="3" placeholder="Ej. Ayudo con ejercicios prácticos, preparación para exámenes..." />
      </label>
      <label>
        Carrera (opcional)
        <input v-model="carrera" type="text" placeholder="Ej. Ingeniería en Sistemas Computacionales" />
      </label>

      <fieldset class="borrador-horarios">
        <legend>Horarios disponibles (opcional, puedes agregar más después)</legend>
        <div class="fila-horario-nueva">
          <input v-model="fecha" type="date" :min="hoy" />
          <input v-model="horaInicio" type="time" />
          <input v-model="horaFin" type="time" />
          <label class="repetir">
            Repetir
            <input v-model.number="repetirSemanas" type="number" min="1" max="12" style="width: 3.5rem" />
            semana(s)
          </label>
          <button type="button" class="btn-secundario" @click="agregarADraft">Agregar a la lista</button>
        </div>
        <p v-if="avisoHorario" class="aviso-alerta">{{ avisoHorario }}</p>

        <ul v-if="horarios.length" class="lista-horarios">
          <li v-for="(h, idx) in horarios" :key="h.fecha + h.hora_inicio" class="horario-card">
            <span>{{ h.fecha }} · {{ h.hora_inicio }}–{{ h.hora_fin }}</span>
            <button type="button" class="btn-sm btn-rojo" @click="quitarDeDraft(idx)">Quitar</button>
          </li>
        </ul>
        <p v-else class="dato-muted">Sin horarios en el borrador todavía. Puedes publicar sin ninguno y agregarlos después.</p>
      </fieldset>

      <p v-if="aviso" class="aviso-alerta">{{ aviso }}</p>
      <button class="btn-primario" type="submit" :disabled="!materiaElegida || enviando">
        {{ enviando ? "Publicando…" : "Publicar tutoría" }}
      </button>
    </form>
  </div>
</template>
