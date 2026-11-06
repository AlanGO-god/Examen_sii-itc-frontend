<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth.js";

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <nav>
    <router-link to="/">Dashboard</router-link> |
    <router-link to="/calificaciones">Calificaciones</router-link> |
    <router-link to="/kardex">Kardex</router-link> |
    <router-link to="/horario">Horario</router-link>
    <button @click="logout" style="float:right">Salir</button>
  </nav>
  <hr />
  <router-view />
</template>