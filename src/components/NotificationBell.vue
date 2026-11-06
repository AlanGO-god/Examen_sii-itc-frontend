<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { api } from "../services/api.js";

const abierto = ref(false);
const notificaciones = ref([]);
const monitoreando = ref(false);
const revisando = ref(false);
const campanaEl = ref(null);
const posicion = ref({ top: "0px", left: "0px" });
let intervaloId = null;

const sinLeer = () => notificaciones.value.filter((n) => !n.read).length;

async function actualizar() {
  try {
    const { data } = await api.get("/notificaciones");
    notificaciones.value = data.notificaciones;
    monitoreando.value = data.monitoreando;
  } catch {
    // silencioso: si falla el refresco en segundo plano no interrumpimos el resto de la UI
  }
}

function calcularPosicion() {
  const rect = campanaEl.value.getBoundingClientRect();
  posicion.value = {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
  };
}

async function alternarPanel() {
  abierto.value = !abierto.value;
  if (abierto.value) {
    calcularPosicion();
    await actualizar();
  }
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
  intervaloId = setInterval(actualizar, 30000);
});
onUnmounted(() => clearInterval(intervaloId));
</script>

<template>
  <div class="campana-wrap">
    <button ref="campanaEl" class="campana" @click="alternarPanel">
      🔔
      <span v-if="sinLeer() > 0" class="punto"></span>
    </button>

    <Teleport to="body">
      <div v-if="abierto" class="panel ficha" :style="posicion">
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
    </Teleport>
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
  position: fixed;
  width: 360px;
  max-height: 440px;
  overflow-y: auto;
  background: var(--paper);
  color: var(--ink);
  z-index: 50;
  padding: 22px 20px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--paper-line);
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
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.secundario {
  background: transparent;
  border: 1px solid var(--ink);
  color: var(--ink);
  font-size: 0.85rem;
  padding: 8px 12px;
}

.item {
  padding: 14px 0;
  border-bottom: 1px solid var(--paper-line);
  font-size: 0.9rem;
  line-height: 1.5;
}

.item p {
  margin: 0 0 6px;
}

.item.leida {
  opacity: 0.55;
}

.item:last-child {
  border-bottom: none;
}
</style>