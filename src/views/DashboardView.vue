<script setup>
import { useAuthStore } from "../store/auth.js";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <h1>Dashboard</h1>
  <p>Iniciaste sesión correctamente.</p>
  <button @click="logout">Salir</button>
</template>