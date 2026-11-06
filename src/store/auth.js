import { defineStore } from "pinia";

const STORAGE_KEY = "sii_token";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: sessionStorage.getItem(STORAGE_KEY) || null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token) {
      this.token = token;
      sessionStorage.setItem(STORAGE_KEY, token);
    },
    logout() {
      this.token = null;
      sessionStorage.removeItem(STORAGE_KEY);
    },
  },
});