import axios from "axios";
import { useAuthStore } from "../store/auth.js";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((cfg) => {
  const auth = useAuthStore();
  if (auth.token) {
    cfg.headers.Authorization = `Bearer ${auth.token}`;
  }
  return cfg;
});