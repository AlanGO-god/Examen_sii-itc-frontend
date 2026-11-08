<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth.js";
import { api } from "../services/api.js";
import NotificationBell from "./NotificationBell.vue";
import AppIcon from "./icons/AppIcon.vue";

const auth = useAuthStore();
const router = useRouter();

async function logout() {
  await api.post("/logout").catch(() => {});
  auth.cerrarSesion();
  router.push({ name: "login" });
}
</script>

<template>
  <div class="layout">
    <aside class="tabs">
      <div class="tabs-title dato-mono">SII · ITC</div>

      <nav>
        <router-link to="/" class="tab">
          <AppIcon name="perfil" />
          <span>Perfil</span>
        </router-link>
        <router-link to="/calificaciones" class="tab">
          <AppIcon name="calificaciones" />
          <span>Calificaciones</span>
        </router-link>
        <router-link to="/kardex" class="tab">
          <AppIcon name="kardex" />
          <span>Kardex</span>
        </router-link>
        <router-link to="/horario" class="tab">
          <AppIcon name="horario" />
          <span>Horario</span>
        </router-link>
      </nav>

      <div class="tabs-pie">
        <NotificationBell />
        <button class="salir" @click="logout">
          <AppIcon name="salir" />
          <span>Salir</span>
        </button>
      </div>
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
  padding: 24px 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.tabs-title {
  font-size: 1rem;
  letter-spacing: 0.02em;
  padding: 0 24px 20px;
  margin-bottom: 8px;
}

.tabs nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 14px;
  flex: 1;
}

.tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  text-decoration: none;
  color: var(--paper);
  opacity: 0.75;
  font-size: 1.05rem;
}

.tab svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.tab:hover {
  opacity: 1;
  background: rgba(241, 233, 216, 0.08);
}

.tab.router-link-exact-active {
  background: var(--paper);
  color: var(--ink);
  opacity: 1;
  font-weight: 600;
}

.tabs-pie {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.salir {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid rgba(241, 233, 216, 0.5);
  color: var(--paper);
  padding: 12px 16px;
  font-size: 1.05rem;
}

.salir svg {
  width: 18px;
  height: 18px;
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
    height: auto;
    flex-direction: row;
    align-items: center;
    padding: 12px;
  }
  .tabs-title {
    border-bottom: none;
    padding: 0 12px 0 0;
    margin-bottom: 0;
  }
  .tabs nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0;
  }
  .tabs-pie {
    flex-direction: row;
    padding: 0 0 0 10px;
    margin-left: auto;
  }
  .salir span {
    display: none;
  }
}
</style>