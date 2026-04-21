import api from "../lib/api";

export interface DevolucionProducto {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

export interface CreateDevolucionPayload {
  id_venta: number;
  id_usuario_cliente: number;
  motivo: string;
  estado: string;
  fecha_devolucion: string;
  productos: DevolucionProducto[];
}

export const devolucionService = {
  async getAll(params: { q?: string; estado?: string } = {}) {
    const response = await api.get("/devoluciones", { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/devoluciones/${id}`);
    return response.data;
  },

  async create(data: CreateDevolucionPayload) {
    const response = await api.post("/devoluciones", data);
    return response.data;
  },

  async cambiarEstado(id: number, estado: string, motivo_decision: string) {
    const response = await api.put(`/devoluciones/${id}/estado`, {
      estado,
      motivo_decision,
    });
    return response.data;
  },

  async anular(id: number, motivo_anulacion: string) {
    const response = await api.put(`/devoluciones/${id}/anular`, {
      motivo_anulacion,
    });
    return response.data;
  },
};
