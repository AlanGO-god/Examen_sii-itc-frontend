<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth.js";
import NotificationBell from "./NotificationBell.vue";
import { api } from "../services/api.js";

const auth = useAuthStore();
const router = useRouter();

async function logout() {
  await api.post("/logout").catch(() => {}); // si falla la petición, igual cerramos sesión localmente
  auth.cerrarSesion();
  router.push({ name: "login" });
}
</script>

<template>
  <div class="layout">
    <aside class="tabs">
    <div class="tabs-title">SII · ITC</div>
    <nav>
        <router-link to="/" class="tab">Perfil</router-link>
        <router-link to="/calificaciones" class="tab">Calificaciones</router-link>
        <router-link to="/kardex" class="tab">Kardex</router-link>
        <router-link to="/horario" class="tab">Horario</router-link>
    </nav>
    <div style="padding: 0 24px 12px">
        <NotificationBell />
    </div>
    <button class="salir" @click="logout">Salir</button>
    </aside>
    <main class="contenido">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  align-items: flex-start;
}

.tabs {
  background: var(--cover);
  color: var(--paper);
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 28px 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.tabs-title {
  font-family: "IBM Plex Mono", monospace;
  font-size: 1rem;
  letter-spacing: 0.02em;
  padding: 0 28px 22px;
  border-bottom: 1px solid rgba(241, 233, 216, 0.25);
  margin-bottom: 14px;
}

.tabs nav {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tab {
  padding: 16px 28px;
  font-size: 1.08rem;
  text-decoration: none;
  color: var(--paper);
  opacity: 0.7;
  border-left: 3px solid transparent;
}

.tab:hover {
  opacity: 1;
}

/* vue-router agrega esta clase a la pestaña de la ruta activa */
.tab.router-link-exact-active {
  background: var(--paper);
  color: var(--ink);
  opacity: 1;
  border-left-color: var(--stamp);
  font-weight: 600;
}

.salir {
  margin: 12px 24px 0;
  background: transparent;
  border: 1px solid rgba(241, 233, 216, 0.5);
  color: var(--paper);
}

.salir:hover {
  background: rgba(241, 233, 216, 0.1);
}

.contenido {
  flex: 1;
  min-width: 0;
}

@media (max-width: 720px) {
  .layout {
    flex-direction: column;
  }
  .tabs {
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding: 12px;
    height: auto;
  }
  .tabs-title {
    border-bottom: none;
    padding: 0 12px 0 0;
    margin-bottom: 0;
  }
  .tabs nav {
    flex-direction: row;
    overflow-x: auto;
  }
  .salir {
    margin: 0 0 0 auto;
  }
}
</style>