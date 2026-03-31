import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { PageHeader } from './PageHeader';
import { ThemeToggle } from './ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Package, ShoppingCart, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { reportService, DashboardData } from '../services/reportService';
import { toast } from 'sonner';

export function Dashboard() {
  const { pedidos, productos } = useStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await reportService.getDashboard();
      setData(res);
    } catch (error: any) {
      console.error(error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground-secondary">Cargando datos reales...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Process data for charts
  const salesByMonth = [...data.ventas_por_mes]
    .reverse()
    .map(v => ({
      mes: v.mes,
      ventas: parseFloat(v.total)
    }));

  const ordersByStatus = [
    { estado: 'Pendiente', cantidad: pedidos.filter(p => p.estado === 'pendiente').length },
    { estado: 'Preparado', cantidad: pedidos.filter(p => p.estado === 'preparado').length },
    { estado: 'Procesando', cantidad: pedidos.filter(p => p.estado === 'procesando').length },
    { estado: 'Enviado', cantidad: pedidos.filter(p => p.estado === 'enviado').length },
    { estado: 'Entregado', cantidad: pedidos.filter(p => p.estado === 'entregado').length },
    { estado: 'Cancelado', cantidad: pedidos.filter(p => p.estado === 'cancelado').length },
  ];

  const productosStockCriticoList = productos.filter(p => p.stock <= p.stockMinimo);

  return (
    <div className="min-h-screen bg-background relative">
      <PageHeader
        title="Dashboard"
        subtitle="Vista general de métricas y estadísticas"
      />
      
      {/* Theme Toggle - Only visible in Dashboard */}
      <ThemeToggle />

      <div className="p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-foreground-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                Ventas del Período
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-foreground" style={{ fontSize: '28px', fontWeight: 600 }}>
                {formatCurrency(data.resumen.total_ventas)}
              </div>
              <p className="text-success" style={{ fontSize: '12px', marginTop: '4px' }}>
                Total acumulado de ventas activas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-foreground-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                Pedidos Registrados
              </CardTitle>
              <ShoppingCart className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-foreground" style={{ fontSize: '28px', fontWeight: 600 }}>
                {data.resumen.total_ordenes}
              </div>
              <p className="text-foreground-secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                {pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'procesando').length} pendientes por entregar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-foreground-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                Usuarios Activos
              </CardTitle>
              <RotateCcw className="w-5 h-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-foreground" style={{ fontSize: '28px', fontWeight: 600 }}>
                {data.resumen.total_usuarios}
              </div>
              <p className="text-warning" style={{ fontSize: '12px', marginTop: '4px' }}>
                Clientes y empleados registrados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-foreground-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                Stock Crítico
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-foreground" style={{ fontSize: '28px', fontWeight: 600 }}>
                {data.resumen.productos_bajo_stock}
              </div>
              <p className="text-danger" style={{ fontSize: '12px', marginTop: '4px' }}>
                Productos requieren reposición
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Tendencia de Ventas</CardTitle>
              <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                Últimos 5 meses
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis dataKey="mes" stroke="var(--foreground-secondary)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="var(--foreground-secondary)" style={{ fontSize: '12px' }} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Line type="monotone" dataKey="ventas" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders by Status */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Pedidos por Estado</CardTitle>
              <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                Distribución actual
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis dataKey="estado" stroke="var(--foreground-secondary)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="var(--foreground-secondary)" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="cantidad" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Top 5 Productos Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.productos_mas_vendidos.map((producto, index) => (
                  <div key={producto.id_producto} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden border border-border bg-card flex items-center justify-center flex-shrink-0">
                        {productos.find(p => p.id === producto.id_producto.toString())?.imagenUrl ? (
                          <img 
                            src={productos.find(p => p.id === producto.id_producto.toString())?.imagenUrl} 
                            alt={producto.nombre} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-primary text-[10px] font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                          {producto.nombre}
                        </p>
                        <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                          {producto.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 600 }}>
                        {producto.total_vendido} und
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Stock */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Productos con Stock Crítico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productosStockCriticoList.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-foreground-secondary mx-auto mb-2 opacity-50" />
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      No hay productos con stock crítico
                    </p>
                  </div>
                ) : (
                  productosStockCriticoList.slice(0, 5).map((producto) => (
                    <div key={producto.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-danger/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden border border-border bg-card flex items-center justify-center flex-shrink-0">
                          {producto.imagenUrl ? (
                            <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-danger/30" />
                          )}
                        </div>
                        <div>
                          <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                            {producto.nombre}
                          </p>
                          <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                            {producto.sku}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-danger" style={{ fontSize: '14px', fontWeight: 600 }}>
                          {producto.stock} und
                        </p>
                        <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
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
