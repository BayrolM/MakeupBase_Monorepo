import { useState } from 'react';
import { useStore } from '../../lib/store';
import { StatusBadge } from '../StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Package, FileText, RotateCcw, Truck } from 'lucide-react';

export function MisPedidosView() {
  const { pedidos, clientes, productos, currentUser } = useStore();
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Get current client
  const currentCliente = clientes.find(c => c.email === currentUser?.email);
  
  // Filter pedidos for current client
  const misPedidos = pedidos.filter(p => p.clienteId === currentCliente?.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const filteredPedidos = filterStatus === 'all' 
    ? misPedidos 
    : misPedidos.filter(p => p.estado === filterStatus);

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'creado':
        return '📝';
      case 'en_proceso':
        return '📦';
      case 'despachado':
        return '🚚';
      case 'entregado':
        return '✅';
      case 'anulado':
        return '❌';
      default:
        return '📦';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'creado':
        return 'Creado';
      case 'en_proceso':
        return 'En proceso';
      case 'despachado':
        return 'En camino';
      case 'entregado':
        return 'Entregado';
      case 'anulado':
        return 'Anulado';
      default:
        return estado;
    }
  };

  const canRequestReturn = (pedido: any) => {
    if (pedido.estado !== 'entregado') return false;
    const pedidoDate = new Date(pedido.fecha);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - pedidoDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-8 h-8 text-primary" />
            <h1 className="text-foreground" style={{ fontSize: '32px', fontWeight: 600 }}>
              Mis Pedidos
            </h1>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-foreground-secondary hover:bg-primary/10 hover:text-foreground'
              }`}
              style={{ fontSize: '14px' }}
            >
              Todos ({misPedidos.length})
            </button>
            <button
              onClick={() => setFilterStatus('en_proceso')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === 'en_proceso'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-foreground-secondary hover:bg-primary/10 hover:text-foreground'
              }`}
              style={{ fontSize: '14px' }}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilterStatus('despachado')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === 'despachado'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-foreground-secondary hover:bg-primary/10 hover:text-foreground'
              }`}
              style={{ fontSize: '14px' }}
            >
              En camino
            </button>
            <button
              onClick={() => setFilterStatus('entregado')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === 'entregado'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-foreground-secondary hover:bg-primary/10 hover:text-foreground'
              }`}
              style={{ fontSize: '14px' }}
            >
              Entregados
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {filteredPedidos.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-20 h-20 text-foreground-secondary opacity-30 mx-auto mb-6" />
            <h3 className="text-foreground mb-3" style={{ fontSize: '24px', fontWeight: 600 }}>
              No tienes pedidos {filterStatus !== 'all' && 'en este estado'}
            </h3>
            <p className="text-foreground-secondary mb-8" style={{ fontSize: '16px' }}>
              Realiza tu primera compra desde el catálogo
            </p>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg transition-all">
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPedidos.map((pedido) => (
              <div key={pedido.id} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                      {getStatusIcon(pedido.estado)}
                    </div>
                    <div>
                      <h3 className="text-foreground mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
                        Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={pedido.estado} size="sm" />
                        <span className="text-foreground-secondary" style={{ fontSize: '13px' }}>
                          • {pedido.fecha}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-primary" style={{ fontSize: '20px', fontWeight: 600 }}>
                    {formatCurrency(pedido.total)}
                  </p>
                </div>

                <div className="mb-4 space-y-2">
                  {pedido.productos.slice(0, 2).map((item: any, index: number) => {
                    const producto = productos.find(p => p.id === item.productoId);
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{producto?.nombre} (x{item.cantidad})</span>
                        <span className="text-foreground-secondary">
                          {formatCurrency(item.precioUnitario * item.cantidad)}
                        </span>
                      </div>
                    );
                  })}
                  {pedido.productos.length > 2 && (
                    <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>
                      +{pedido.productos.length - 2} producto(s) más
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPedido(pedido)}
                    className="border-border text-foreground hover:bg-surface"
                  >
                    Ver Detalle
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPedido(pedido);
                      setShowPdfDialog(true);
                    }}
                    className="border-border text-foreground hover:bg-surface"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Ver Factura
                  </Button>
                  {canRequestReturn(pedido) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground hover:bg-surface"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Solicitar Devolución
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPedido && !showPdfDialog} onOpenChange={() => setSelectedPedido(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalle del Pedido</DialogTitle>
          </DialogHeader>

          {selectedPedido && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>ID del Pedido:</p>
                  <p className="text-foreground" style={{ fontSize: '15px', fontWeight: 500 }}>
                    #{selectedPedido.id.slice(0, 10).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>Fecha:</p>
                  <p className="text-foreground" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {selectedPedido.fecha}
                  </p>
                </div>
                <div>
                  <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>Estado:</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedPedido.estado} size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>Total:</p>
                  <p className="text-primary" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {formatCurrency(selectedPedido.total)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-foreground-secondary mb-2" style={{ fontSize: '13px' }}>
                  Dirección de Envío:
                </p>
                <p className="text-foreground" style={{ fontSize: '14px' }}>
                  {selectedPedido.direccionEnvio}
                </p>
              </div>

              <div>
                <p className="text-foreground mb-3" style={{ fontSize: '15px', fontWeight: 500 }}>
                  Productos:
                </p>
                <div className="space-y-2">
                  {selectedPedido.productos.map((item: any, i: number) => {
                    const producto = productos.find(p => p.id === item.productoId);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                        <div>
                          <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                            {producto?.nombre || 'N/A'}
                          </p>
                          <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                            Cantidad: {item.cantidad}
                          </p>
                        </div>
                        <p className="text-foreground" style={{ fontSize: '14px' }}>
                          {formatCurrency(item.cantidad * item.precioUnitario)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Dialog */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Factura - Pedido #{selectedPedido?.id.slice(0, 10).toUpperCase()}</DialogTitle>
          </DialogHeader>

          {selectedPedido && (
            <div className="py-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-white text-black p-8 rounded-lg">
                <div className="border-b-2 border-pink-500 pb-4 mb-6">
                  <h1 className="text-3xl font-bold text-pink-600 mb-1">GLAMOUR ML</h1>
                  <p className="text-sm text-gray-600">Factura de Venta</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-500">Fecha</p>
                    <p className="font-semibold">{selectedPedido.fecha}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">N° Pedido</p>
                    <p className="font-semibold">#{selectedPedido.id.slice(0, 10).toUpperCase()}</p>
                  </div>
                </div>

                <table className="w-full border-collapse mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2 text-sm">Producto</th>
                      <th className="text-center p-2 text-sm">Cant.</th>
                      <th className="text-right p-2 text-sm">P. Unit.</th>
                      <th className="text-right p-2 text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPedido.productos.map((item: any, i: number) => {
                      const producto = productos.find(p => p.id === item.productoId);
                      return (
                        <tr key={i} className="border-b">
                          <td className="p-2 text-sm">{producto?.nombre}</td>
                          <td className="text-center p-2 text-sm">{item.cantidad}</td>
                          <td className="text-right p-2 text-sm">{formatCurrency(item.precioUnitario)}</td>
                          <td className="text-right p-2 text-sm font-medium">
                            {formatCurrency(item.cantidad * item.precioUnitario)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-pink-600">
                      Total: {formatCurrency(selectedPedido.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowPdfDialog(false)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
