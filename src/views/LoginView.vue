<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../services/api.js";
import { useAuthStore } from "../store/auth.js";
import { programarCierreSesion } from "../services/sessionTimer.js";

const DOMINIOS_INSTITUCIONALES = ["celaya.tecnm.mx", "itcelaya.edu.mx"];

function esCorreoInstitucional(correo) {
  const dominio = correo.split("@")[1]?.toLowerCase();
  return DOMINIOS_INSTITUCIONALES.includes(dominio);
}

const email = ref("");
const password = ref("");
const errorMsg = ref("");
const loading = ref(false);
const mostrarPassword = ref(false);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

if (route.query.expirada) {
  errorMsg.value = "Tu sesión expiró. Inicia sesión de nuevo.";
}

async function onSubmit() {
  errorMsg.value = "";

  if (!esCorreoInstitucional(email.value)) {
    errorMsg.value = `Usa tu correo institucional (@${DOMINIOS_INSTITUCIONALES.join(" o @")})`;
    return;
  }

  loading.value = true;
  try {
    const { data } = await api.post("/login", { email: email.value, password: password.value });
    auth.autenticado = true;
    programarCierreSesion(data.expiraEn);
    router.push({ name: "dashboard" });
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Error al iniciar sesión.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="portada">
    <div class="cubierta">
      <div class="sello-cabecera">
        <svg viewBox="0 0 48 48" class="sello-icono" aria-hidden="true">
          <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="2" />
          <circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" />
          <text x="24" y="29" text-anchor="middle" font-size="13" font-family="IBM Plex Mono, monospace" fill="currentColor">ITC</text>
        </svg>
        <div>
          <p class="titulo-chico">Instituto Tecnológico de Celaya</p>
          <h1>Portal del Estudiante</h1>
        </div>
      </div>

      <form @submit.prevent="onSubmit">
        <div class="campo">
          <label for="email">Correo institucional</label>
          <div class="campo-con-icono">
            <svg viewBox="0 0 24 24" class="icono" aria-hidden="true">
              <path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 6h18v12H3z" />
              <path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 7l9 6 9-6" />
            </svg>
            <input id="email" v-model="email" type="email" autocomplete="username" placeholder="nombre@celaya.tecnm.mx" />
          </div>
        </div>

        <div class="campo">
            <label for="password">Contraseña</label>
            <div class="campo-con-icono">
                <svg viewBox="0 0 24 24" class="icono" aria-hidden="true">
                <rect x="5" y="11" width="14" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" />
                <path fill="none" stroke="currentColor" stroke-width="1.6" d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                id="password"
                v-model="password"
                :type="mostrarPassword ? 'text' : 'password'"
                autocomplete="current-password"
                />
                <button
                type="button"
                class="toggle-password"
                @click="mostrarPassword = !mostrarPassword"
                :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                <svg v-if="mostrarPassword" viewBox="0 0 24 24" class="icono" aria-hidden="true">
                    <path fill="none" stroke="currentColor" stroke-width="1.6" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6" />
                </svg>
                <svg v-else viewBox="0 0 24 24" class="icono" aria-hidden="true">
                    <path fill="none" stroke="currentColor" stroke-width="1.6" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6" />
                    <line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" stroke-width="1.6" />
                </svg>
                </button>
            </div>
        </div>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <button type="submit" class="boton-entrar" :disabled="loading">
          {{ loading ? "Entrando..." : "Entrar" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.portada {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at 20% 20%, rgba(169, 128, 46, 0.25), transparent 45%),
    radial-gradient(circle at 80% 85%, rgba(122, 31, 61, 0.2), transparent 50%),
    var(--cover-dark, #16281f);
  position: relative;
  overflow: hidden;
}

/* Textura sutil de líneas, en vez de una foto real que no podemos verificar
   que sea el campus de verdad — evoca "lugar físico" sin fingir ser una foto. */
.portada::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    115deg,
    rgba(241, 233, 216, 0.035) 0px,
    rgba(241, 233, 216, 0.035) 1px,
    transparent 1px,
    transparent 14px
  );
  pointer-events: none;
}

.cubierta {
  background: var(--paper);
  width: 100%;
  max-width: 420px;
  padding: 40px 36px;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  position: relative;
}

.sello-cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.sello-icono {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  color: var(--stamp);
}

.titulo-chico {
  margin: 0 0 2px;
  font-size: 0.78rem;
  color: var(--ink-soft);
  font-family: "IBM Plex Mono", monospace;
}

h1 {
  margin: 0;
  font-size: 1.4rem;
}

.campo {
  margin-bottom: 18px;
}

.campo label {
  display: block;
  font-size: 0.85rem;
  color: var(--ink-soft);
  margin-bottom: 6px;
}

.campo-con-icono {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid var(--paper-line);
  border-radius: 999px;
  padding: 4px 18px;
  background: #fff8ec;
}

.campo-con-icono:focus-within {
  border-color: var(--gold);
}

.icono {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--ink-soft);
}

.campo-con-icono input {
  border: none;
  padding: 10px 0;
}

.campo-con-icono input:focus {
  outline: none;
}

.error {
  color: var(--stamp);
  font-size: 0.9rem;
}

.boton-entrar {
  width: 100%;
  border-radius: 999px;
  margin-top: 8px;
}

.toggle-password {
  background: none;
  border: none;
  padding: 4px;
  flex-shrink: 0;
  color: var(--ink-soft);
  display: flex;
  align-items: center;
}

.toggle-password:hover {
  color: var(--ink);
}
</style>