import axios from "axios";
import { useAuthStore } from "../store/auth.js";
import { router } from "../router/index.js";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // Hace que el navegador mande y reciba la cookie httpOnly en cada
  // petición, aunque backend y frontend estén en dominios distintos
  // (Vercel y Render). Sin esto, la cookie simplemente no viajaría.
  withCredentials: true,
});

// Si cualquier petición regresa 401 (sesión no válida o ya expirada),
// marcamos al usuario como no autenticado y lo regresamos al login — sin
// esto, el usuario se quedaría viendo una pantalla con datos a medio cargar
// y sin saber por qué.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore();
      auth.cerrarSesion();
      if (router.currentRoute.value.name !== "login") {
        router.push({ name: "login" });
      }
    }
    return Promise.reject(error);
  }
);