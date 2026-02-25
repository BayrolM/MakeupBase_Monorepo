import { useStore } from '../lib/store';
import { PageHeader } from './PageHeader';
import { ThemeToggle } from './ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Package, ShoppingCart, RotateCcw, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function Dashboard() {
  const { ventas, productos, pedidos, devoluciones } = useStore();

  // Calculate KPIs
  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
  const totalPedidos = pedidos.length;
  const totalDevoluciones = devoluciones.length;
  const tasaDevoluciones = ventas.length > 0 ? ((devoluciones.length / ventas.length) * 100).toFixed(1) : '0';
  
  // Products with critical stock
  const productosStockCritico = productos.filter(p => p.stock <= p.stockMinimo);

  // Top products by sales
  const productSales = new Map<string, number>();
  ventas.forEach(venta => {
    venta.productos.forEach(p => {
      const current = productSales.get(p.productoId) || 0;
      productSales.set(p.productoId, current + p.cantidad);
    });
  });
  
  const topProductos = productos
    .map(p => ({
      ...p,
      cantidadVendida: productSales.get(p.id) || 0,
    }))
    .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
    .slice(0, 5);

  // Sales by month (mock data for chart)
  const salesByMonth = [
    { mes: 'Jun', ventas: 2800000 },
    { mes: 'Jul', ventas: 3200000 },
    { mes: 'Ago', ventas: 2900000 },
    { mes: 'Sep', ventas: 3500000 },
    { mes: 'Oct', ventas: totalVentas },
  ];

  // Orders by status
  const ordersByStatus = [
    { estado: 'Creado', cantidad: pedidos.filter(p => p.estado === 'creado').length },
    { estado: 'En proceso', cantidad: pedidos.filter(p => p.estado === 'en_proceso').length },
    { estado: 'Despachado', cantidad: pedidos.filter(p => p.estado === 'despachado').length },
    { estado: 'Entregado', cantidad: pedidos.filter(p => p.estado === 'entregado').length },
    { estado: 'Anulado', cantidad: pedidos.filter(p => p.estado === 'anulado').length },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

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
                {formatCurrency(totalVentas)}
              </div>
              <p className="text-success" style={{ fontSize: '12px', marginTop: '4px' }}>
                +12.5% vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-foreground-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                Pedidos Activos
              </CardTitle>
              <ShoppingCart className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-foreground" style={{ fontSize: '28px', fontWeight: 600 }}>
                {totalPedidos}
              </div>
              <p className="text-foreground-secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                {pedidos.filter(p => p.estado === 'en_proceso').length} en proceso
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-foreground-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                Devoluciones
              </CardTitle>
              <RotateCcw className="w-5 h-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-foreground" style={{ fontSize: '28px', fontWeight: 600 }}>
                {totalDevoluciones}
              </div>
              <p className="text-warning" style={{ fontSize: '12px', marginTop: '4px' }}>
                Tasa: {tasaDevoluciones}%
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
                {productosStockCritico.length}
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
                {topProductos.map((producto, index) => (
                  <div key={producto.id} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary" style={{ fontSize: '14px', fontWeight: 600 }}>
                        {index + 1}
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
                        {producto.cantidadVendida} und
                      </p>
                      <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                        Stock: {producto.stock}
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
                {productosStockCritico.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-foreground-secondary mx-auto mb-2 opacity-50" />
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      No hay productos con stock crítico
                    </p>
                  </div>
                ) : (
                  productosStockCritico.slice(0, 5).map((producto) => (
                    <div key={producto.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-danger/20">
                      <div>
                        <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                          {producto.nombre}
                        </p>
                        <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                          {producto.sku}
                        </p>
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
