import api from "../lib/api";

export interface DashboardData {
  resumen: {
    total_ventas: number;
    total_ordenes: number;
    total_productos: number;
    total_usuarios: number;
    productos_bajo_stock: number;
  };
  ventas_por_mes: Array<{
    mes: string;
    cantidad: string;
    total: string;
  }>;
  productos_mas_vendidos: Array<{
    id_producto: number;
    nombre: string;
    total_vendido: string;
  }>;
}

export const reportService = {
  /**
   * Obtener datos para el dashboard
   */
  async getDashboard(): Promise<DashboardData> {
    try {
      const response = await api.get("/reports/dashboard");
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener datos del dashboard"
      );
    }
  },

  /**
   * Obtener reporte de ventas
   */
  async getSalesReport(params: any = {}): Promise<any> {
    try {
      const response = await api.get("/reports/sales", { params });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener reporte de ventas"
      );
    }
  },

  /**
   * Obtener reporte de stock
   */
  async getStockReport(): Promise<any> {
    try {
      const response = await api.get("/reports/stock");
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener reporte de stock"
      );
    }
  }
};
