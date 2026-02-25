import api from "../lib/api";

export interface Order {
  id_pedido: number;
  id_usuario: number;
  fecha_pedido: string;
  direccion: string;
  ciudad: string;
  total: number;
  estado: string;
  id_venta?: number;
  metodo_pago?: string;
  nombre_usuario?: string;
  email_usuario?: string;
  items?: any[];
}

export interface CreateOrderData {
  direccion: string;
  ciudad: string;
  metodo_pago: string;
  items: Array<{
    id_producto: number;
    cantidad: number;
  }>;
}

export const orderService = {
  /**
   * Crear nueva orden
   */
  async create(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await api.post("/orders", orderData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al crear orden");
    }
  },

  /**
   * Obtener todas las órdenes
   */
  async getAll(estado?: string): Promise<Order[]> {
    try {
      const response = await api.get("/orders", { params: { estado } });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener órdenes",
      );
    }
  },

  /**
   * Obtener detalle de orden
   */
  async getById(id: number): Promise<Order> {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener orden",
      );
    }
  },
};