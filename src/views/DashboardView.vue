<script setup>
import { ref, onMounted } from "vue";
import { api } from "../services/api.js";

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
</script>

<template>
  <div class="folio">
    <h1>Perfil</h1>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="errorMsg" class="error">{{ errorMsg }}</p>

    <div v-else class="perfil">
      <div class="datos">
        <div class="ficha">
          <p class="nombre">{{ perfil.persona }}</p>
          <p class="dato-mono dato-muted">No. control {{ perfil.numero_control }} · {{ perfil.email }}</p>
        </div>

        <dl class="grid">
          <div>
            <dt>Semestre</dt>
            <dd class="dato-mono">{{ perfil.semestre }}</dd>
          </div>
          <div>
            <dt>Promedio ponderado</dt>
            <dd class="dato-mono">{{ perfil.promedio_ponderado }}</dd>
          </div>
          <div>
            <dt>Promedio aritmético</dt>
            <dd class="dato-mono">{{ perfil.promedio_aritmetico }}</dd>
          </div>
          <div>
            <dt>Materias cursadas</dt>
            <dd class="dato-mono">{{ perfil.materias_cursadas }}</dd>
          </div>
          <div>
            <dt>Aprobadas</dt>
            <dd class="dato-mono pass">{{ perfil.materias_aprobadas }}</dd>
          </div>
          <div>
            <dt>Reprobadas</dt>
            <dd class="dato-mono stamp">{{ perfil.materias_reprobadas }}</dd>
          </div>
        </dl>
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
  min-width: 280px;
}

.nombre {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 4px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 0;
}

.grid dt {
  font-size: 0.8rem;
  color: var(--ink-soft);
}

.grid dd {
  margin: 2px 0 0;
  font-size: 1.1rem;
}

.pass {
  color: var(--pass);
}

.stamp {
  color: var(--stamp);
}

.error {
  color: var(--stamp);
}

/* El "sello" de avance: un círculo punteado, inclinado, como un timbre oficial.
   No es decoración: el número que muestra es el dato real de porcentaje_avance. */
.sello {
  flex-shrink: 0;
  width: 128px;
  height: 128px;
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
  font-size: 1.6rem;
  font-weight: 600;
}

.sello-label {
  font-size: 0.75rem;
  margin-top: 2px;
}
</style>