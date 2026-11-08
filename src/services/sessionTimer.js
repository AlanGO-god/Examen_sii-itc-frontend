import { router } from "../router/index.js";
import { useAuthStore } from "../store/auth.js";

let temporizadorId = null;

// Programa el cierre automático de sesión exactamente cuando el token real
// vaya a expirar — sin esperar a que el usuario navegue o haga una petición
// que falle con 401.
export function programarCierreSesion(expiraEnMs) {
  clearTimeout(temporizadorId);
  temporizadorId = setTimeout(() => {
    useAuthStore().cerrarSesion();
    if (router.currentRoute.value.name !== "login") {
      router.push({ name: "login", query: { expirada: "1" } });
    }
  }, expiraEnMs);
}