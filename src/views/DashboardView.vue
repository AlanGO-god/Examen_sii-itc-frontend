<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "../services/api.js";
import AppIcon from "../components/icons/AppIcon.vue";

const perfil = ref(null);
const loading = ref(true);
const errorMsg = ref("");

onMounted(async () => {
  try {
    const { data } = await api.get("/estudiante");
    perfil.value = data.data;
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "No se pudo cargar tu perfil.";
  } finally {
    loading.value = false;
  }
});

function redondear(valor) {
  return Number(valor).toFixed(2);
}

const porcentajeAprobadas = computed(() => {
  if (!perfil.value) return 0;
  return Math.round((Number(perfil.value.materias_aprobadas) / Number(perfil.value.materias_cursadas)) * 100);
});

const porcentajeReprobadas = computed(() => {
  if (!perfil.value) return 0;
  return Math.round((Number(perfil.value.materias_reprobadas) / Number(perfil.value.materias_cursadas)) * 100);
});
</script>

<template>
  <div class="folio">
    <h1>Perfil</h1>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="errorMsg" class="error">{{ errorMsg }}</p>

    <div v-else class="perfil">
      <div class="datos">
        <div class="ficha perfil-header">
          <img v-if="perfil.foto" :src="`data:image/jpeg;base64,${perfil.foto}`" alt="" class="foto-perfil" />
          <div v-else class="foto-perfil foto-placeholder"><AppIcon name="perfil" /></div>
          <div>
            <p class="nombre">{{ perfil.persona }}</p>
            <p class="meta-linea dato-mono dato-muted">
              <span class="meta-item"><AppIcon name="correo" />{{ perfil.email }}</span>
              <span class="meta-item">Control {{ perfil.numero_control }}</span>
              <span class="meta-item">Semestre {{ perfil.semestre }}</span>
            </p>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icono gold"><AppIcon name="balanza" /></div>
            <div>
              <p class="kpi-label">Promedio ponderado</p>
              <p class="kpi-valor dato-mono">{{ redondear(perfil.promedio_ponderado) }}</p>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icono gold"><AppIcon name="balanza" /></div>
            <div>
              <p class="kpi-label">Promedio aritmético</p>
              <p class="kpi-valor dato-mono">{{ redondear(perfil.promedio_aritmetico) }}</p>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icono gold"><AppIcon name="creditos" /></div>
            <div>
              <p class="kpi-label">Créditos acumulados</p>
              <p class="kpi-valor dato-mono">{{ perfil.creditos_acumulados }}</p>
            </div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icono pass"><AppIcon name="check" /></div>
            <div>
              <p class="kpi-label">Materias aprobadas</p>
              <p class="kpi-valor dato-mono">{{ perfil.materias_aprobadas }}</p>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icono stamp"><AppIcon name="equis" /></div>
            <div>
              <p class="kpi-label">Materias reprobadas</p>
              <p class="kpi-valor dato-mono">{{ perfil.materias_reprobadas }}</p>
            </div>
          </div>
          <div class="kpi-card resultado">
            <div class="kpi-icono neutro"><AppIcon name="barras" /></div>
            <div class="resultado-contenido">
              <p class="kpi-label">Materias por resultado</p>
              <div class="barra-fila">
                <span class="dato-mono">Aprobadas {{ perfil.materias_aprobadas }}</span>
                <div class="barra-fondo"><div class="barra pass" :style="{ width: porcentajeAprobadas + '%' }"></div></div>
              </div>
              <div class="barra-fila">
                <span class="dato-mono">Reprobadas {{ perfil.materias_reprobadas }}</span>
                <div class="barra-fondo"><div class="barra stamp" :style="{ width: porcentajeReprobadas + '%' }"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="ficha otros-indicadores">
          <div><span class="dato-muted">Materias cursadas</span><strong class="dato-mono">{{ perfil.materias_cursadas }}</strong></div>
          <div><span class="dato-muted">Créditos complementarios</span><strong class="dato-mono">{{ perfil.creditos_complementarios }}</strong></div>
          <div><span class="dato-muted">Avance con materias en curso</span><strong class="dato-mono">{{ perfil.percentaje_avance_cursando }}%</strong></div>
        </div>
      </div>

      <div class="sello" :title="`${perfil.porcentaje_avance}% de avance`">
        <span class="sello-num">{{ perfil.porcentaje_avance }}%</span>
        <span class="sello-label">avance</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perfil {
  display: flex;
  align-items: flex-start;
  gap: 36px;
  flex-wrap: wrap;
}

.datos {
  flex: 1;
  min-width: 320px;
}

.perfil-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.foto-perfil {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--paper-line);
}

.foto-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--paper-line);
  color: var(--ink-soft);
  font-size: 1.6rem;
}

.nombre {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 6px;
}

.meta-linea {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 0;
  font-size: 0.85rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff8ec;
  border: 1px solid var(--paper-line);
  border-radius: 16px;
  padding: 16px 18px;
}

.kpi-icono {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icono svg {
  width: 20px;
  height: 20px;
}

.kpi-icono.gold { background: rgba(169, 128, 46, 0.15); color: var(--gold); }
.kpi-icono.pass { background: rgba(63, 106, 78, 0.15); color: var(--pass); }
.kpi-icono.stamp { background: rgba(122, 31, 61, 0.15); color: var(--stamp); }
.kpi-icono.neutro { background: rgba(90, 83, 71, 0.12); color: var(--ink-soft); }

.kpi-label {
  margin: 0 0 2px;
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.kpi-valor {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
}

.resultado {
  grid-column: span 2;
}

.resultado-contenido {
  flex: 1;
}

.barra-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  font-size: 0.82rem;
}

.barra-fondo {
  flex: 1;
  max-width: 180px;
  height: 8px;
  border-radius: 999px;
  background: var(--paper-line);
  overflow: hidden;
}

.barra {
  height: 100%;
  border-radius: 999px;
}

.barra.pass { background: var(--pass); }
.barra.stamp { background: var(--stamp); }

.otros-indicadores {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  margin-top: 16px;
}

.otros-indicadores > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
}

.sello {
  flex-shrink: 0;
  width: 160px;
  height: 160px;
  border: 3px dashed var(--stamp);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: rotate(-6deg);
  color: var(--stamp);
}

.sello-num {
  font-family: "IBM Plex Mono", monospace;
  font-size: 2.1rem;
  font-weight: 600;
}

.sello-label {
  font-size: 0.75rem;
  margin-top: 2px;
}

.error {
  color: var(--stamp);
}

@media (max-width: 720px) {
  .resultado {
    grid-column: span 1;
  }
}
</style>