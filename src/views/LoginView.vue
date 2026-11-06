<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../services/api.js";
import { useAuthStore } from "../store/auth.js";

const email = ref("");
const password = ref("");
const errorMsg = ref("");
const loading = ref(false);

const router = useRouter();
const auth = useAuthStore();

async function onSubmit() {
  errorMsg.value = "";
  loading.value = true;
  try {
    const { data } = await api.post("/login", { email: email.value, password: password.value });
    auth.setToken(data.message.login.token);
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
      <h1>Portal del Estudiante</h1>
      <p class="dato-mono subtitulo">Instituto Tecnológico de Celaya</p>

      <form @submit.prevent="onSubmit">
        <div class="campo">
          <label for="email">Correo institucional</label>
          <input id="email" v-model="email" type="email" autocomplete="username" />
        </div>
        <div class="campo">
          <label for="password">Contraseña</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" />
        </div>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <button type="submit" :disabled="loading">{{ loading ? "Entrando..." : "Entrar" }}</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.portada {
  min-height: 100vh;
  background: var(--cover);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.cubierta {
  background: var(--paper);
  width: 100%;
  max-width: 460px;
  padding: 52px 48px;
  border-top: 4px solid var(--stamp);
}

.subtitulo {
  color: var(--ink-soft);
  font-size: 1rem;
  margin: -8px 0 32px;
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

.error {
  color: var(--stamp);
  font-size: 0.9rem;
}

button {
  width: 100%;
}
</style>