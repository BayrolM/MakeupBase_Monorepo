import api from "../lib/api";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  password: string;
  tipo_documento?: string;
  documento?: string;
  direccion?: string;
  ciudad?: string;
  id_rol?: number;
}

export interface UserProfile {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  id_rol: number;  
  foto_perfil?: string;
}

export const authService = {
    /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await api.post("/auth/login", credentials);
      const { token } = response.data;

      if (token) {
        localStorage.setItem("authToken", token);
        return token;
      }

      throw new Error("No se recibió token del servidor");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al iniciar sesión";
      throw new Error(message);
    }
  },

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterData): Promise<any> {
    try {
      const response = await api.post("/auth/register", {
        ...userData,
        id_rol: userData.id_rol || 2, // 2 = cliente por defecto
      });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al registrar usuario";
      throw new Error(message);
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al obtener perfil";
      throw new Error(message);
    }
  },

  /**
   * Actualizar perfil
   */
  async updateProfile(data: Partial<UserProfile>): Promise<void> {
    try {
      await api.put("/users/profile", data);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al actualizar perfil";
      throw new Error(message);
    }
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put("/users/profile/password", { currentPassword, newPassword });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al cambiar la contraseña";
      throw new Error(message);
    }
  },

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem("authToken");
  },

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  },
};
