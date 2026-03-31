import api from "../lib/api";

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

export const categoryService = {
  async getAll(params: any = {}): Promise<{ total: number, data: Categoria[] }> {
    try {
      const response = await api.get("/categorias", { params });
      // Si la respuesta es un array (retrocompatibilidad) devolverlo como data
      if (Array.isArray(response.data)) {
        return { total: response.data.length, data: response.data };
      }
      return {
        total: response.data.total,
        data: response.data.data
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener categorías",
      );
    }
  },

  async getById(id: number): Promise<Categoria> {
    try {
      const response = await api.get(`/categorias/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener la categoría",
      );
    }
  },

  async create(data: Omit<Categoria, "id_categoria">): Promise<Categoria> {
    try {
      const response = await api.post("/categorias", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al crear categoría",
      );
    }
  },

  async update(id: number, data: Partial<Categoria>): Promise<Categoria> {
    try {
      const response = await api.put(`/categorias/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar categoría",
      );
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/categorias/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar categoría",
      );
    }
  },
};
