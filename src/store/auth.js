import { defineStore } from "pinia";
import { api } from "../services/api.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    autenticado: null,
  }),
  actions: {
    // Regresa cuánto le queda a la sesión (en ms) si es válida, o null si no.
    async verificarSesion() {
      try {
        const { data } = await api.get("/session");
        this.autenticado = true;
        return data.expiraEn;
      } catch {
        this.autenticado = false;
        return null;
      }
    },
    cerrarSesion() {
      this.autenticado = false;
    },
  },
});