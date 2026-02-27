import api from "../lib/api";

export interface UserFilters {
  q?: string;
  id_rol?: number;
  estado?: boolean | string;
  page?: number;
  limit?: number;
}

export interface UserResponse {
  ok: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: any[];
}

export const userService = {
  /**
   * Listar usuarios con filtros (Admin)
   */
  async getAll(filters?: UserFilters): Promise<UserResponse> {
    try {
      const response = await api.get("/users", { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener usuarios",
      );
    }
  },

  /**
   * Obtener detalle de un usuario por ID (Admin)
   */
  async getById(id: string | number): Promise<any> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener el usuario",
      );
    }
  },

  /**
   * Actualizar usuario (Admin)
   */
  async update(id: string | number, userData: any): Promise<any> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar el usuario",
      );
    }
  },

  /**
   * Desactivar usuario (Admin)
   */
  async deactivate(id: string | number): Promise<any> {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al desactivar el usuario",
      );
    }
  },
  /**
   * Crear un nuevo usuario (Admin)
   */
  async create(userData: any): Promise<any> {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al crear el usuario",
      );
    }
  },
};
