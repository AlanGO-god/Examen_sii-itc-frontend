<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { api } from "../services/api.js";

const abierto = ref(false);
const notificaciones = ref([]);
const monitoreando = ref(false);
const revisando = ref(false);
let intervaloId = null;

const sinLeer = () => notificaciones.value.filter((n) => !n.read).length;

async function actualizar() {
  try {
    const { data } = await api.get("/notificaciones");
    notificaciones.value = data.notificaciones;
    monitoreando.value = data.monitoreando;
  } catch {
    // si falla el refresco en segundo plano, no interrumpimos el resto de la UI
  }
}

async function alternarPanel() {
  abierto.value = !abierto.value;
  if (abierto.value) await actualizar();
}

async function revisarAhora() {
  revisando.value = true;
  try {
    await api.post("/notificaciones/revisar");
    await actualizar();
  } finally {
    revisando.value = false;
  }
}

async function alternarMonitoreo() {
  if (monitoreando.value) {
    await api.post("/notificaciones/monitoreo/detener");
  } else {
    await api.post("/notificaciones/monitoreo/iniciar");
  }
  await actualizar();
}

async function marcarLeidas() {
  await api.post("/notificaciones/leidas");
  notificaciones.value = notificaciones.value.map((n) => ({ ...n, read: true }));
}

onMounted(() => {
  actualizar();
  intervaloId = setInterval(actualizar, 30000); // refresco silencioso cada 30s
});
onUnmounted(() => clearInterval(intervaloId));
</script>

<template>
  <div class="campana-wrap">
    <button class="campana" @click="alternarPanel">
      🔔
      <span v-if="sinLeer() > 0" class="punto"></span>
    </button>

    <div v-if="abierto" class="panel ficha">
      <div class="panel-header">
        <strong>Notificaciones</strong>
        <button class="link" @click="marcarLeidas">Marcar leídas</button>
      </div>

      <div class="acciones">
        <button class="secundario" @click="revisarAhora" :disabled="revisando">
          {{ revisando ? "Revisando..." : "Revisar ahora" }}
        </button>
        <button class="secundario" @click="alternarMonitoreo">
          {{ monitoreando ? "Detener monitoreo" : "Activar monitoreo" }}
        </button>
      </div>

      <p v-if="!notificaciones.length" class="dato-muted">Sin notificaciones por ahora.</p>
      <div v-for="n in notificaciones" :key="n.id" class="item" :class="{ leida: n.read }">
        <p>{{ n.message }}</p>
        <span class="dato-mono dato-muted">{{ new Date(n.created_at).toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.campana-wrap {
  position: relative;
}

.campana {
  background: transparent;
  border: 1px solid rgba(241, 233, 216, 0.5);
  color: var(--paper);
  font-size: 1.2rem;
  padding: 8px 14px;
}

.punto {
  position: absolute;
  top: 4px;
  right: 8px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--stamp);
}

.panel {
  position: absolute;
  left: 0;
  top: 54px;
  width: 320px;
  max-height: 420px;
  overflow-y: auto;
  background: var(--paper);
  color: var(--ink);
  z-index: 20;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.link {
  background: none;
  border: none;
  color: var(--stamp);
  padding: 0;
  font-size: 0.85rem;
  text-decoration: underline;
}

.acciones {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.secundario {
  background: transparent;
  border: 1px solid var(--ink);
  color: var(--ink);
  font-size: 0.85rem;
  padding: 8px 12px;
}

.item {
  padding: 10px 0;
  border-bottom: 1px solid var(--paper-line);
  font-size: 0.9rem;
}

.item.leida {
  opacity: 0.55;
}

.item:last-child {
  border-bottom: none;
}
</style>