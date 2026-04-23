import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos para APIs serverless
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Ignorar errores 401 en peticiones públicas (GET sin auth)
    // Solo mostrar error si es una petición que requiere auth
    const isAuthRequired = error.config?.url?.includes('/orders') || 
                        error.config?.url?.includes('/cart') ||
                        error.config?.url?.includes('/ventas');
    
    if (error.response?.status === 401 && !isAuthRequired) {
      console.log('ℹ️ Error 401 en ruta pública, ignorando');
      return Promise.reject(error);
    }

    // Manejar errores de autenticación en rutas privadas
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      toast.error("Sesión expirada", {
        description: "Por favor, inicia sesión nuevamente",
      });
      window.location.href = "/";
    }

    // Manejar errores de autorización
    if (error.response?.status === 403) {
      toast.error("Acceso denegado", {
        description: "No tienes permisos para realizar esta acción",
      });
    }

    // Manejar errores del servidor
    if (error.response?.status === 500) {
      toast.error("Error del servidor", {
        description: "Ocurrió un error inesperado. Intenta nuevamente.",
      });
    }

    return Promise.reject(error);
  },
);

export default api;