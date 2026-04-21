import api from "../lib/api";

export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  email: string;
  telefono: string;
  documento_nit: string;
  tipo_proveedor: string;
  direccion: string;
  estado: boolean;
}

export const providerService = {
  async getAll(): Promise<Proveedor[]> {
    try {
      const response = await api.get("/proveedores");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener proveedores",
      );
    }
  },

  async getById(id: number): Promise<Proveedor> {
    try {
      const response = await api.get(`/proveedores/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener el proveedor",
      );
    }
  },

  async create(data: Omit<Proveedor, "id_proveedor">): Promise<Proveedor> {
    try {
      const response = await api.post("/proveedores", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al crear proveedor",
      );
    }
  },

  async update(id: number, data: Partial<Proveedor>): Promise<Proveedor> {
    try {
      const response = await api.put(`/proveedores/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar proveedor",
      );
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/proveedores/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar proveedor",
      );
    }
  },
};
