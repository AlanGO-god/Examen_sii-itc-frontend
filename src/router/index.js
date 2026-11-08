import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth.js";
import { programarCierreSesion } from "../services/sessionTimer.js";

const routes = [
  { path: "/login", name: "login", component: () => import("../views/LoginView.vue") },
  {
    path: "/",
    component: () => import("../components/AppLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "dashboard", component: () => import("../views/DashboardView.vue") },
      { path: "calificaciones", name: "calificaciones", component: () => import("../views/CalificacionesView.vue") },
      { path: "kardex", name: "kardex", component: () => import("../views/KardexView.vue") },
      { path: "horario", name: "horario", component: () => import("../views/HorarioView.vue") },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (auth.autenticado === null) {
    const expiraEn = await auth.verificarSesion();
    if (expiraEn) programarCierreSesion(expiraEn);
  }

  if (to.meta.requiresAuth && !auth.autenticado) {
    return { name: "login" };
  }
  if (to.name === "login" && auth.autenticado) {
    return { name: "dashboard" };
  }
  return true;
});