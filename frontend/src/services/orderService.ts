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
  pago_confirmado?: boolean;
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

export interface CreateDirectOrderData {
  id_cliente: number;
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
   * Crear nueva orden directa (Administrativo)
   */
  async createDirect(orderData: CreateDirectOrderData): Promise<Order> {
    try {
      const response = await api.post("/orders/admin", orderData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al crear orden directa");
    }
  },

  /**
   * Obtener todas las órdenes
   */
  async getAll(params: any = {}): Promise<{ total: number, data: Order[] }> {
    try {
      const response = await api.get("/orders", { params });
      return {
        total: response.data.total,
        data: response.data.data
      };
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
  
  /**
   * Cancelar pedido por el cliente
   */
  async cancelByClient(id: number): Promise<any> {
    try {
      const response = await api.put(`/orders/${id}/cancel-client`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al cancelar el pedido");
    }
  },

  /**
   * Actualizar dirección por el cliente
   */
  async updateDireccion(id: number, direccion: string): Promise<any> {
    try {
      const response = await api.put(`/orders/${id}/direccion`, { direccion });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al actualizar la dirección");
    }
  },
  async update(id: number, data: { direccion?: string; id_cliente?: number; items?: Array<{ id_producto: number; cantidad: number }> }): Promise<any> {
    try {
      const response = await api.put(`/orders/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al actualizar el pedido");
    }
  },
  async updateStatus(id: number, estado: string, motivo?: string, shippingData?: any): Promise<any> {
    try {
      const response = await api.put(`/orders/${id}/status`, { estado, motivo, shippingData });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al actualizar estado");
    }
  },

  /**
   * Confirmar pago de orden
   */
  async confirmPayment(id: number, pago_confirmado: boolean): Promise<any> {
    try {
      const response = await api.put(`/orders/${id}/pago`, { pago_confirmado });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al confirmar pago");
    }
  },

  /**
   * Subir comprobante de pago
   */
  async uploadComprobante(id: number, formData: FormData): Promise<any> {
    try {
      const response = await api.put(`/orders/${id}/comprobante`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al subir el comprobante");
    }
  }
};