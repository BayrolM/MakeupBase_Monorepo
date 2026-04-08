import api from "../lib/api";

export interface Product {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  id_marca: number;
  id_categoria: number;
  costo_promedio: number;
  precio_venta: number;
  stock_actual: number;
  stock_min: number;
  stock_max: number;
  imagen_url?: string;
  estado: boolean;
}

export interface ProductFilters {
  q?: string;
  marca?: string;
  categoria?: string;
  minPrice?: number;
  maxPrice?: number;
  estado?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  ok: boolean;
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export const productService = {
  /**
   * Listar productos con filtros
   */
  async getAll(filters?: ProductFilters): Promise<ProductsResponse> {
    try {
      const response = await api.get("/products", { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener productos",
      );
    }
  },

  /**
   * Obtener producto por ID
   */
  async getById(id: number): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener producto",
      );
    }
  },

  /**
   * Crear nuevo producto
   */
  async create(product: Omit<Product, "id_producto">): Promise<Product> {
    try {
      const response = await api.post("/products", product);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al crear producto",
      );
    }
  },

  /**
   * Actualizar producto
   */
  async update(id: number, product: Partial<Product>): Promise<void> {
    try {
      await api.put(`/products/${id}`, product);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar producto",
      );
    }
  },

  /**
   * Eliminar producto (soft delete)
   */
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar producto",
      );
    }
  },

  /**
   * Obtener productos destacados
   */
  async getFeatured(limit: number = 10): Promise<Product[]> {
    try {
      const response = await api.get("/products/featured", {
        params: { limit },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al obtener productos destacados",
      );
    }
  },
};