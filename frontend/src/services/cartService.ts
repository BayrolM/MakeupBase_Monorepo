import api from "../lib/api";

export interface CartItem {
  id_detalle_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  nombre?: string;
}

export interface Cart {
  id_pedido: number;
  items: CartItem[];
  total: number;
}

export const cartService = {
  /**
   * Obtener carrito actual
   */
  async getCart(): Promise<Cart> {
    try {
      const response = await api.get("/cart");
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener carrito",
      );
    }
  },

  /**
   * Agregar item al carrito
   */
  async addItem(id_producto: number, cantidad: number): Promise<Cart> {
    try {
      const response = await api.post("/cart", { id_producto, cantidad });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al agregar al carrito",
      );
    }
  },

  /**
   * Actualizar cantidad de item
   */
  async updateItem(id: number, cantidad: number): Promise<Cart> {
    try {
      const response = await api.put(`/cart/${id}`, { cantidad });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar carrito",
      );
    }
  },

  /**
   * Eliminar item del carrito
   */
  async removeItem(id: number): Promise<Cart> {
    try {
      const response = await api.delete(`/cart/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar del carrito",
      );
    }
  },
};