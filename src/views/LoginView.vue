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
  <h1>Iniciar sesión</h1>
  <p v-if="errorMsg" style="color:red">{{ errorMsg }}</p>
  <form @submit.prevent="onSubmit">
    <div>
      <label>Correo</label>
      <input v-model="email" type="email" />
    </div>
    <div>
      <label>Contraseña</label>
      <input v-model="password" type="password" />
    </div>
    <button type="submit" :disabled="loading">{{ loading ? "Entrando..." : "Entrar" }}</button>
  </form>
</template>