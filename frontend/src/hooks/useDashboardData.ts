import { useState, useEffect, useMemo } from "react";
import { reportService, DashboardData, SalesComparisonData } from "../services/reportService";
import { toast } from "sonner";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [salesComparison, setSalesComparison] = useState<SalesComparisonData | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await reportService.getDashboard();
      setData(res);
    } catch (error: any) {
      console.error(error);
      toast.error("Error al cargar datos del dashboard");
    }
  };

  const fetchSalesComparison = async () => {
    try {
      const res = await reportService.getSalesComparison();
      setSalesComparison(res);
    } catch (error: any) {
      console.error(error);
    }
  };

  // Carga inicial y Polling cada 30 segundos
  useEffect(() => {
    fetchDashboardData();
    fetchSalesComparison();

    const intervalId = setInterval(() => {
      fetchDashboardData();
      fetchSalesComparison();
    }, 30000); // 30 segundos

    return () => clearInterval(intervalId);
  }, []);



  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const safeData = data || {
    resumen: {
      total_ventas: 0,
      total_ordenes: 0,
      total_productos: 0,
      devoluciones_pendientes: 0,
      productos_bajo_stock: 0,
    },
    productos_mas_vendidos: [],
    pedidos_por_estado: [],
    productos_stock_critico: [],
    ventas_tendencia: [],
    ventas_del_mes: [],
  };

  const ordersByStatus = useMemo(() => {
    if (!safeData.pedidos_por_estado || safeData.pedidos_por_estado.length === 0) {
      return [
        { estado: "Pendiente", cantidad: 0 },
        { estado: "Procesando", cantidad: 0 },
        { estado: "Enviado", cantidad: 0 },
        { estado: "Entregado", cantidad: 0 },
        { estado: "Cancelado", cantidad: 0 },
      ];
    }
    
    // Mapear los datos de la BD a un formato amigable si es necesario, 
    // o simplemente usarlos directamente capitalizando el estado
    return safeData.pedidos_por_estado.map(p => ({
      estado: p.estado ? p.estado.charAt(0).toUpperCase() + p.estado.slice(1) : "Desconocido",
      cantidad: parseInt(p.cantidad) || 0
    }));
  }, [safeData.pedidos_por_estado]);

  const productosStockCriticoList = useMemo(() => {
    if (!safeData.productos_stock_critico) return [];
    
    // Mapear al formato que espera CriticalStockCard (que era el de Producto del store)
    return safeData.productos_stock_critico.map(p => ({
      id: p.id_producto.toString(),
      nombre: p.nombre,
      stock: p.stock_actual,
      stockMinimo: p.stock_min,
      precioVenta: p.precio_venta,
      categoria: p.categoria || '',
      marca: p.marca || ''
    }));
  }, [safeData.productos_stock_critico]);

  const trendChartData = useMemo(() => {
    if (!data?.ventas_tendencia) return [];

    return data.ventas_tendencia.map((v) => ({
      mes: v.mes_nombre,
      total: parseFloat(v.total) || 0,
      cantidad: parseInt(v.cantidad) || 0,
    }));
  }, [data?.ventas_tendencia]);

  const ventasMesChartData = useMemo(() => {
    if (!safeData.ventas_del_mes) return [];

    return safeData.ventas_del_mes.map((v) => ({
      dia: v.dia,
      total: parseFloat(v.total) || 0,
    }));
  }, [safeData.ventas_del_mes]);

  return {
    data,
    safeData,
    salesComparison,
    ordersByStatus,
    productosStockCriticoList,
    trendChartData,
    ventasMesChartData,
    formatCurrency,
    refresh: fetchDashboardData
  };
}
