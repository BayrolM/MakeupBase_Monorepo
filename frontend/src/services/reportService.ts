import api from "../lib/api";

export interface DashboardData {
  resumen: {
    total_ventas: number;
    total_ordenes: number;
    total_productos: number;
    devoluciones_pendientes: number;
    productos_bajo_stock: number;
  };
  ventas_tendencia: Array<{
    mes_id: string;
    mes_nombre: string;
    total: string;
    cantidad: string;
  }>;
  productos_mas_vendidos: Array<{
    id_producto: number;
    nombre: string;
    total_vendido: string;
  }>;
  pedidos_por_estado: Array<{
    estado: string;
    cantidad: string;
  }>;
  productos_stock_critico: Array<{
    id_producto: number;
    nombre: string;
    stock_actual: number;
    stock_min: number;
    precio_venta: number;
    categoria: string;
    marca: string;
  }>;
  ventas_del_mes: Array<{
    dia: string;
    total: string;
  }>;
}

export interface SalesComparisonData {
  anio_actual: number;
  anio_pasado: number;
  ventas_por_mes: {
    actual: Array<{ mes_num: string; mes_nombre: string; total: string }>;
    pasado: Array<{ mes_num: string; mes_nombre: string; total: string }>;
  };
  resumen: {
    anio_actual: number;
    anio_pasado: number;
    crecimiento: number;
  };
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
  },

  async getSalesComparison(): Promise<any> {
    try {
      const response = await api.get("/reports/sales-comparison");
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener comparación de ventas"
      );
    }
  }
};
