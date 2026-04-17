import { useState, useEffect } from "react";
import { useStore } from "../lib/store";
import { PageHeader } from "./PageHeader";
import { ThemeToggle } from "./ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { reportService, DashboardData } from "../services/reportService";
import { toast } from "sonner";

export function Dashboard() {
  const { pedidos, productos } = useStore();
  const [data, setData] = useState<DashboardData | null>({
    resumen: {
      total_ventas: 0,
      total_ordenes: 0,
      total_productos: 0,
      total_usuarios: 0,
      productos_bajo_stock: 0,
    },
    productos_mas_vendidos: [],
    ventas_por_mes: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await reportService.getDashboard();
      setData(res);
    } catch (error: any) {
      console.error(error);
      toast.error("Error al cargar datos del dashboard");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // El Dashboard ahora carga en segundo plano sin bloquear la vista.

  // No bloqueamos si data es null, usamos valores iniciales
  const safeData = data || {
    ventas_por_mes: [],
    resumen: {
      total_ventas: 0,
      total_ordenes: 0,
      total_usuarios: 0,
      productos_bajo_stock: 0,
    },
    productos_mas_vendidos: [],
  };

  // Process data for charts
  const salesByMonth = [...safeData.ventas_por_mes].reverse().map((v) => ({
    mes: v.mes,
    ventas: parseFloat(v.total) || 0,
  }));

  const ordersByStatus = [
    {
      estado: "Pendiente",
      cantidad: pedidos.filter((p) => p.estado === "pendiente").length,
    },
    {
      estado: "Preparado",
      cantidad: pedidos.filter((p) => p.estado === "preparado").length,
    },
    {
      estado: "Procesando",
      cantidad: pedidos.filter((p) => p.estado === "procesando").length,
    },
    {
      estado: "Enviado",
      cantidad: pedidos.filter((p) => p.estado === "enviado").length,
    },
    {
      estado: "Entregado",
      cantidad: pedidos.filter((p) => p.estado === "entregado").length,
    },
    {
      estado: "Cancelado",
      cantidad: pedidos.filter((p) => p.estado === "cancelado").length,
    },
  ];

  const productosStockCriticoList = productos.filter(
    (p) => p.stock <= p.stockMinimo,
  );

  return (
    <div className="min-h-screen bg-[#f6f3f5] relative">
      <PageHeader
        title="Dashboard"
        subtitle="Vista general de métricas y estadísticas"
      />

      {/* Theme Toggle - Only visible in Dashboard */}
      <ThemeToggle />

      <div className="p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">
                Ventas del Período
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#fff0f5] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#7b1347]" />
              </div>
            </CardHeader>
            <CardContent className="pt-5 pb-5">
              <div className="text-3xl font-black text-gray-900 tracking-tighter">
                {formatCurrency(safeData.resumen.total_ventas)}
              </div>
              <p className="text-[10px] font-semibold text-[#c47b96] uppercase tracking-wider mt-1">
                Total acumulado activo
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">
                Pedidos Registrados
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#fff0f5] flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-[#c47b96]" />
              </div>
            </CardHeader>
            <CardContent className="pt-5 pb-5">
              <div className="text-3xl font-black text-gray-900 tracking-tighter">
                {safeData.resumen.total_ordenes}
              </div>
              <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">
                {
                  pedidos.filter(
                    (p) =>
                      p.estado === "pendiente" || p.estado === "procesando",
                  ).length
                }{" "}
                pendientes por entregar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">
                Usuarios Activos
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#fff0f5] flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-[#c47b96]" />
              </div>
            </CardHeader>
            <CardContent className="pt-5 pb-5">
              <div className="text-3xl font-black text-gray-900 tracking-tighter">
                {safeData.resumen.total_usuarios}
              </div>
              <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">
                Clientes y empleados activos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-[#fff0f5]/50 border-b border-rose-100/50">
              <CardTitle className="text-[10px] uppercase font-bold text-[#c47b96] tracking-widest mt-1">
                Stock Crítico
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-5 pb-5">
              <div className="text-3xl font-black text-gray-900 tracking-tighter">
                {safeData.resumen.productos_bajo_stock}
              </div>
              <p className="text-[10px] font-semibold text-rose-400 mt-1 uppercase tracking-wider">
                Productos requieren reposición
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Tendencia de Ventas
              </CardTitle>
              <p className="text-[10px] uppercase font-bold text-[#c47b96] mt-1">
                Últimos 5 meses
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="mes"
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      `$${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #f3f4f6",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(196, 123, 150, 0.1)",
                    }}
                    labelStyle={{ color: "#1f2937", fontWeight: "bold" }}
                    itemStyle={{ color: "#7b1347", fontWeight: "black" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ventas"
                    stroke="#c47b96"
                    strokeWidth={3}
                    dot={{
                      fill: "#7b1347",
                      r: 5,
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders by Status */}
          <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Pedidos por Estado
              </CardTitle>
              <p className="text-[10px] uppercase font-bold text-[#c47b96] mt-1">
                Distribución actual
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="estado"
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #f3f4f6",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(196, 123, 150, 0.1)",
                    }}
                    labelStyle={{ color: "#1f2937", fontWeight: "bold" }}
                    itemStyle={{ color: "#7b1347", fontWeight: "black" }}
                  />
                  <Bar
                    dataKey="cantidad"
                    fill="#c47b96"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Top 5 Productos Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {safeData.productos_mas_vendidos.map((producto, index) => (
                  <div
                    key={producto.id_producto}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#f6f3f5] hover:bg-[#fff0f5] transition-colors group border border-transparent hover:border-[#fad6e3]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        {productos.find(
                          (p) => p.id === producto.id_producto.toString(),
                        )?.imagenUrl ? (
                          <img
                            src={
                              productos.find(
                                (p) => p.id === producto.id_producto.toString(),
                              )?.imagenUrl
                            }
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#c47b96] text-xs font-black">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">
                          {producto.nombre}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#7b1347]">
                        {producto.total_vendido}{" "}
                        <span className="text-[10px] text-gray-400 uppercase">
                          und
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Stock */}
          <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="bg-rose-50/50 border-b border-rose-100 pb-4">
              <CardTitle className="text-xs font-bold text-[#c47b96] uppercase tracking-widest">
                Productos con Stock Crítico
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {productosStockCriticoList.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-gray-400">
                      No hay productos con stock crítico
                    </p>
                  </div>
                ) : (
                  productosStockCriticoList.slice(0, 5).map((producto) => (
                    <div
                      key={producto.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-100 shadow-sm shadow-rose-900/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-rose-50 bg-rose-50 flex items-center justify-center flex-shrink-0">
                          {producto.imagenUrl ? (
                            <img
                              src={producto.imagenUrl}
                              alt={producto.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">
                            {producto.nombre}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-rose-500">
                          {producto.stock}{" "}
                          <span className="text-[10px] text-gray-400 uppercase">
                            und
                          </span>
                        </p>
                        <p className="text-[10px] font-bold text-gray-400">
                          Mín: {producto.stockMinimo}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
