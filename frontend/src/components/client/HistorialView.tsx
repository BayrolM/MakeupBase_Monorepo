import { useStore } from '../../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, Heart, ShoppingBag, Award, Clock } from 'lucide-react';

export function HistorialView() {
  const { pedidos, favoritos, clientes, currentUser } = useStore();

  const currentCliente = clientes.find(c => c.email === currentUser?.email);
  const misPedidos = pedidos.filter(p => p.clienteId === currentCliente?.id);
  const totalGastado = misPedidos.reduce((sum, p) => sum + p.total, 0);
  const pedidosCompletados = misPedidos.filter(p => p.estado === 'entregado').length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const activities = [
    { icon: '🛍️', text: 'Hoy: Viste "Labial Mate Rosa"', time: 'Hace 2 horas' },
    { icon: '❤️', text: 'Ayer: Agregaste 2 productos a favoritos', time: 'Hace 1 día' },
    { icon: '✅', text: '5 Oct: Compra #P-015 exitosa', time: 'Hace 5 días' },
    { icon: '📦', text: '3 Oct: Pedido despachado', time: 'Hace 7 días' },
    { icon: '🎀', text: '1 Oct: Te registraste en GLAMOUR ML', time: 'Hace 9 días' },
  ];

  const achievements = [
    { icon: '🏆', title: 'Cliente Frecuente', description: '10% de descuento', unlocked: pedidosCompletados >= 3 },
    { icon: '🎉', title: 'Primera Compra', description: 'Completada', unlocked: pedidosCompletados >= 1 },
    { icon: '💎', title: 'Cliente Premium', description: 'Próximamente', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-primary" />
            <h1 className="text-foreground" style={{ fontSize: '32px', fontWeight: 600 }}>
              Mi Historial
            </h1>
          </div>
          <p className="text-foreground-secondary" style={{ fontSize: '16px' }}>
            Tu actividad y logros en GLAMOUR ML
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        {/* Summary Stats */}
        <div>
          <h2 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: '24px', fontWeight: 600 }}>
            <TrendingUp className="w-6 h-6 text-primary" />
            Resumen de Actividad
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-foreground-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Pedidos Totales
                </CardTitle>
                <ShoppingBag className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground" style={{ fontSize: '32px', fontWeight: 600 }}>
                  {misPedidos.length}
                </div>
                <p className="text-success" style={{ fontSize: '13px', marginTop: '4px' }}>
                  {pedidosCompletados} completados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-foreground-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Favoritos
                </CardTitle>
                <Heart className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground" style={{ fontSize: '32px', fontWeight: 600 }}>
                  {favoritos.length}
                </div>
                <p className="text-foreground-secondary" style={{ fontSize: '13px', marginTop: '4px' }}>
                  Productos guardados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-foreground-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Total Gastado
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground" style={{ fontSize: '28px', fontWeight: 600 }}>
                  {formatCurrency(totalGastado)}
                </div>
                <p className="text-foreground-secondary" style={{ fontSize: '13px', marginTop: '4px' }}>
                  En {misPedidos.length} compras
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: '24px', fontWeight: 600 }}>
            <Clock className="w-6 h-6 text-primary" />
            Actividad Reciente
          </h2>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-surface transition-all">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                        {activity.text}
                      </p>
                      <p className="text-foreground-secondary" style={{ fontSize: '13px', marginTop: '2px' }}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: '24px', fontWeight: 600 }}>
            <Award className="w-6 h-6 text-primary" />
            Logros y Descuentos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className={`bg-card border-border ${achievement.unlocked ? 'border-primary/50' : 'opacity-60'}`}>
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <h3 className="text-foreground mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>
                    {achievement.title}
                  </h3>
                  <p className={achievement.unlocked ? 'text-primary' : 'text-foreground-secondary'} style={{ fontSize: '14px' }}>
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-success/20 text-success rounded-full" style={{ fontSize: '12px' }}>
                        Desbloqueado
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
