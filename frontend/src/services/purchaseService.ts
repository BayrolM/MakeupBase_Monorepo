import api from "../lib/api";

export interface PurchaseDetail {
  id_producto: number;
  id_variante?: number;
  cantidad: number;
  precio_unitario: number;
}

export interface Purchase {
  id_compra: number;
  id_proveedor: number;
  fecha_compra: string;
  total: number;
  estado: boolean;
  observaciones?: string;
  detalles?: PurchaseDetail[];
}

export const purchaseService = {
  async getAll() {
    const response = await api.get("/compras");
    return response.data; // { ok: true, data: [...] }
  },

  async getById(id: number) {
    const response = await api.get(`/compras/${id}`);
    return response.data;
  },

  async create(data: {
    id_proveedor: number;
    observaciones?: string;
    detalles: PurchaseDetail[];
  }) {
    // Note: The backend endpoint expects "items", so we must map "detalles" to "items"
    const payload = {
      id_proveedor: data.id_proveedor,
      observaciones: data.observaciones,
      items: data.detalles
    };
    const response = await api.post("/compras", payload);
    return response.data;
  },

  async anular(id: number) {
    const response = await api.put(`/compras/${id}/anular`);
    return response.data;
  }
};
