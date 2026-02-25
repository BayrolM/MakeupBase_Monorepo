import api from "../lib/api";

export interface PurchaseDetail {
  id_producto: number;
  id_variante?: number;
  cantidad: number;
  precio_compra: number;
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
    const response = await api.post("/compras", data);
    return response.data;
  },
};
