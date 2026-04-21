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
  Users,
  ArrowUpRight,
  Calendar,
  LayoutDashboard,
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
  AreaChart,
  Area,
} from "recharts";
import { reportService, DashboardData } from "../services/reportService";
import { toast } from "sonner";

/* ── Luxury CSS variable helpers ── */
const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgSoft: V('bg-soft'),
  accent: V('pink-soft'),
  accentDark: V('accent-dark'),
  accentDeep: V('pink'),
  textDark: V('text-dark'),
  textMuted: V('text-muted'),
  shadowSm: V('shadow-sm'),
  shadow: V('shadow'),
  white: '#ffffff',
  danger: '#ef4444',
};

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
    <div className="min-h-screen relative" style={{ background: C.bgSoft, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader
        title="Panel de Control"
        subtitle="Métricas estratégicas y estado del negocio"
        icon={LayoutDashboard}
      />

      <ThemeToggle />

      <div className="p-8 space-y-8">
        {/* KPI Grid - Modern & Clean */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Sales KPI */}
          <div style={{ background: C.white, borderRadius: '24px', padding: '24px', boxShadow: C.shadowSm, border: `1px solid ${C.accent}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `linear-gradient(135deg, transparent 50%, ${C.accent} 100%)`, opacity: 0.3 }} />
            <div className="flex justify-between items-start mb-4">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: C.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp style={{ width: 20, height: 20, color: C.accentDeep }} />
              </div>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                +12% <ArrowUpRight style={{ width: 12, height: 12 }} />
              </span>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Ventas Totales</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: C.textDark, margin: 0, letterSpacing: '-0.5px' }}>
              {formatCurrency(safeData.resumen.total_ventas)}
            </h3>
          </div>

          {/* Orders KPI */}
          <div style={{ background: C.white, borderRadius: '24px', padding: '24px', boxShadow: C.shadowSm, border: `1px solid ${C.accent}`, position: 'relative', overflow: 'hidden' }}>
            <div className="flex justify-between items-start mb-4">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: C.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart style={{ width: 20, height: 20, color: C.accentDeep }} />
              </div>
              <span style={{ fontSize: '11px', color: C.textMuted, fontWeight: 500, background: C.bgSoft, padding: '2px 8px', borderRadius: '20px' }}>
                Hoy
              </span>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Pedidos</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: C.textDark, margin: 0, letterSpacing: '-0.5px' }}>
              {safeData.resumen.total_ordenes}
            </h3>
          </div>

          {/* Users KPI */}
          <div style={{ background: C.white, borderRadius: '24px', padding: '24px', boxShadow: C.shadowSm, border: `1px solid ${C.accent}`, position: 'relative', overflow: 'hidden' }}>
            <div className="flex justify-between items-start mb-4">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: C.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users style={{ width: 20, height: 20, color: C.accentDeep }} />
              </div>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Usuarios</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: C.textDark, margin: 0, letterSpacing: '-0.5px' }}>
              {safeData.resumen.total_usuarios}
            </h3>
          </div>

          {/* Stock KPI - Warning style */}
          <div style={{ background: `linear-gradient(135deg, ${C.white} 0%, #fffafa 100%)`, borderRadius: '24px', padding: '24px', boxShadow: C.shadowSm, border: `1px solid ${C.danger}33`, position: 'relative', overflow: 'hidden' }}>
            <div className="flex justify-between items-start mb-4">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${C.danger}11`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle style={{ width: 20, height: 20, color: C.danger }} />
              </div>
              {safeData.resumen.productos_bajo_stock > 0 && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.danger, animation: 'pulse 2s infinite' }} />
              )}
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Stock Crítico</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: C.danger, margin: 0, letterSpacing: '-0.5px' }}>
              {safeData.resumen.productos_bajo_stock}
            </h3>
          </div>
        </div>

        {/* Main Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Sales Performance Chart */}
          <div style={{ background: C.white, borderRadius: '24px', padding: '32px', boxShadow: C.shadow, border: `1px solid ${C.accent}` }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: C.textDark, margin: 0 }}>Desempeño de Ventas</h3>
                <p style={{ fontSize: '13px', color: C.textMuted, margin: 0 }}>Ingresos mensuales proyectados</p>
              </div>
              <Calendar style={{ width: 20, height: 20, color: C.textMuted }} />
            </div>
            
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesByMonth}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={V('pink')} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={V('pink')} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: V('text-muted') }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: V('text-muted') }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: C.shadow, padding: '12px' }}
                    itemStyle={{ color: V('pink'), fontWeight: 700 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke={V('pink')} 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Distribution */}
          <div style={{ background: C.white, borderRadius: '24px', padding: '32px', boxShadow: C.shadow, border: `1px solid ${C.accent}` }}>
            <div className="mb-8">
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: C.textDark, margin: 0 }}>Distribución de Pedidos</h3>
              <p style={{ fontSize: '13px', color: C.textMuted, margin: 0 }}>Estado actual de la logística</p>
            </div>

            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="estado" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: V('text-muted') }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: V('text-muted') }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: C.shadow, padding: '12px' }}
                  />
                  <Bar 
                    dataKey="cantidad" 
                    fill={V('pink-soft')} 
                    radius={[8, 8, 0, 0]}
                    activeBar={{ fill: V('pink') }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Best Sellers */}
          <div style={{ background: C.white, borderRadius: '24px', padding: '32px', boxShadow: C.shadow, border: `1px solid ${C.accent}` }}>
            <div className="flex items-center justify-between mb-8">
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: C.textDark, margin: 0 }}>Productos Estrella</h3>
              <button style={{ fontSize: '12px', fontWeight: 700, color: C.accentDeep, background: 'none', border: 'none', cursor: 'pointer' }}>VER TODOS</button>
            </div>

            <div className="space-y-4">
              {safeData.productos_mas_vendidos.map((producto, index) => {
                const prodInfo = productos.find(p => p.id === producto.id_producto.toString());
                return (
                  <div 
                    key={producto.id_producto}
                    className="flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50"
                    style={{ background: C.bgSoft, border: '1px solid transparent' }}
                  >
                    <div className="flex items-center gap-4">
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `1px solid ${C.accent}` }}>
                        {prodInfo?.imagenUrl ? (
                          <img src={prodInfo.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <span style={{ fontSize: '14px', fontWeight: 800, color: C.accentDeep }}>#{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: C.textDark, margin: 0 }}>{producto.nombre}</p>
                        <p style={{ fontSize: '11px', color: C.textMuted, margin: 0 }}>Cod: {producto.id_producto}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: C.accentDeep, margin: 0 }}>{producto.total_vendido}</p>
                      <p style={{ fontSize: '10px', color: C.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unidades</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Inventory */}
          <div style={{ background: C.white, borderRadius: '24px', padding: '32px', boxShadow: C.shadow, border: `1px solid ${C.danger}22` }}>
            <div className="flex items-center justify-between mb-8">
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: C.textDark, margin: 0 }}>Inventario Crítico</h3>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: C.danger }}></div>
            </div>

            <div className="space-y-4">
              {productosStockCriticoList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Package style={{ width: 48, height: 48, color: C.accent, opacity: 0.5, marginBottom: '16px' }} />
                  <p style={{ fontSize: '14px', color: C.textMuted, fontWeight: 500 }}>Inventario saludable</p>
                </div>
              ) : (
                productosStockCriticoList.slice(0, 5).map((producto) => (
                  <div 
                    key={producto.id}
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: `${C.danger}05`, border: `1px solid ${C.danger}11` }}
                  >
                    <div className="flex items-center gap-4">
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `1px solid ${C.danger}22` }}>
                        {producto.imagenUrl ? (
                          <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <AlertTriangle style={{ width: 20, height: 20, color: C.danger }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: C.textDark, margin: 0 }}>{producto.nombre}</p>
                        <div className="flex gap-2 items-center mt-1">
                          <span style={{ fontSize: '10px', padding: '1px 6px', background: `${C.danger}22`, color: C.danger, borderRadius: '4px', fontWeight: 700 }}>BAJO STOCK</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: C.danger, margin: 0 }}>{producto.stock}</p>
                      <p style={{ fontSize: '10px', color: C.textMuted, margin: 0 }}>Mín: {producto.stockMinimo}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
