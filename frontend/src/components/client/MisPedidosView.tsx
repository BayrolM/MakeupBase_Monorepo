import { useState } from 'react';
import { useStore } from '../../lib/store';
import { StatusBadge } from '../StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Package, FileText, RotateCcw, Truck, CheckCircle2, Clock, Box, Loader2, Calendar, MapPin, Receipt, XCircle, PackageCheck, X } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { toast } from 'sonner';

export function MisPedidosView({ onNavigate }: { onNavigate?: (route: string) => void } = {}) {
  const { pedidos, clientes, productos, currentUser } = useStore();
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Get current client ID
  const currentCliente = clientes.find(c => c.email === currentUser?.email);
  const myId = currentCliente?.id || currentUser?.id;
  
  // Filter pedidos for current client
  const misPedidos = pedidos.filter(p => p.clienteId === myId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const filteredPedidos = filterStatus === 'all' 
    ? misPedidos 
    : misPedidos.filter(p => p.estado === filterStatus);

   const getStatusIcon = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return <Clock className="w-7 h-7" />;
    case 'preparado':
      return <Package className="w-7 h-7" />;
    case 'enviado':
      return <Truck className="w-7 h-7" />;
    case 'entregado':
      return <PackageCheck className="w-7 h-7" />;
    case 'cancelado':
      return <XCircle className="w-7 h-7" />;
    default:
      return <Package className="w-7 h-7" />;
  }
    };


  const canRequestReturn = (pedido: any) => {
    if (pedido.estado !== 'entregado') return false;
    const pedidoDate = new Date(pedido.fecha);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - pedidoDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const OrderStepper = ({ currentStatus }: { currentStatus: string }) => {
    const steps = [
      { id: 'pendiente', label: 'Pendiente', icon: Clock },
      { id: 'preparado', label: 'Preparado', icon: Package },
      { id: 'enviado', label: 'En camino', icon: Truck },
      { id: 'entregado', label: 'Entregado', icon: CheckCircle2 },
    ];

    const isAnulado = currentStatus === 'cancelado';
    if (isAnulado) return (
      <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-center">
        <p className="text-danger font-medium">Este pedido ha sido cancelado</p>
      </div>
    );

    const currentIndex = steps.findIndex(s => s.id === currentStatus);
    
    return (
      <div className="py-6">
        <div className="relative flex justify-between">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500" 
            style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted ? 'bg-primary text-primary-foreground' : 'bg-surface border-2 border-border text-foreground-secondary'
                  } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p 
                  className={`mt-2 text-[12px] font-medium transition-colors ${
                    isCompleted ? 'text-foreground' : 'text-foreground-secondary'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleViewDetail = async (pedido: any) => {
    setIsLoadingDetail(true);
    try {
      const fullOrder = await orderService.getById(Number(pedido.id));
      setSelectedPedido({
        ...pedido,
        productos: (fullOrder.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(),
          cantidad: i.cantidad,
          precioUnitario: i.precio_unitario || 0,
        }))
      });
      setShowDetail(true);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar detalle del pedido');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handlePrintInvoice = async (pedido: any) => {
    setIsLoadingDetail(true);
    try {
      const fullOrder = await orderService.getById(Number(pedido.id));
      const completePedido = {
        ...pedido,
        productos: (fullOrder.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(),
          cantidad: i.cantidad,
          precioUnitario: i.precio_unitario || 0,
        }))
      };
      setSelectedPedido(completePedido);
      setTimeout(() => {
        window.print();
      }, 150);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar factura');
    } finally {
      setIsLoadingDetail(false);
    }
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
              onClick={() => setFilterStatus('pendiente')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === 'pendiente'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-foreground-secondary hover:bg-primary/10 hover:text-foreground'
              }`}
              style={{ fontSize: '14px' }}
            >
              Pendientes ({misPedidos.filter(p => p.estado === 'pendiente').length})
            </button>
            <button
              onClick={() => setFilterStatus('enviado')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === 'enviado'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-foreground-secondary hover:bg-primary/10 hover:text-foreground'
              }`}
              style={{ fontSize: '14px' }}
            >
              En camino ({misPedidos.filter(p => p.estado === 'enviado').length})
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
              Entregados ({misPedidos.filter(p => p.estado === 'entregado').length})
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
            <button 
              onClick={() => onNavigate?.('catalogo')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg transition-all"
            >
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPedidos.map((pedido) => (
              <div key={pedido.id} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(pedido.estado)}
                    </div>
                    <div>
                      <h3 className="text-foreground mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
                        Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={pedido.estado} size="sm" />
                        <span className="text-foreground-secondary" style={{ fontSize: '13px' }}>
                          • {formatDate(pedido.fecha)}
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
                    onClick={() => handleViewDetail(pedido)}
                    className="border-primary/20 text-foreground hover:bg-primary/10 hover:text-primary transition-all rounded-full"
                    disabled={isLoadingDetail}
                  >
                    {isLoadingDetail && selectedPedido?.id === pedido.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Ver Detalle'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintInvoice(pedido)}
                    className="border-primary/20 text-foreground hover:bg-primary/10 hover:text-primary transition-all rounded-full"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Factura
                  </Button>
                  {canRequestReturn(pedido) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-danger/20 text-danger hover:bg-danger/10 transition-all rounded-full"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Devolver
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDetail} onOpenChange={(open: boolean) => {
        setShowDetail(open);
        if (!open) setSelectedPedido(null);
      }}>
        <DialogContent className="bg-card border-border max-w-2xl rounded-3xl overflow-hidden p-0 gap-0">
          <div className="bg-primary/5 p-8 border-b border-border/20">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-foreground text-2xl font-bold">Resumen de Compra</DialogTitle>
                  <p className="text-primary font-medium mt-1">Pedido #{selectedPedido?.id.slice(0, 10).toUpperCase()}</p>
                </div>
                {selectedPedido && <StatusBadge status={selectedPedido.estado} />}
              </div>
            </DialogHeader>
          </div>

          {selectedPedido && (
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-4 rounded-2xl border border-border/40">
                  <div className="flex items-center gap-2 text-foreground-secondary mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Fecha de Compra</span>
                  </div>
                  <p className="text-foreground font-semibold">{formatDate(selectedPedido.fecha)}</p>
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-border/40">
                  <div className="flex items-center gap-2 text-foreground-secondary mb-1">
                    <Receipt className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Monto Total</span>
                  </div>
                  <p className="text-primary text-xl font-bold">{formatCurrency(selectedPedido.total)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-foreground font-semibold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Estado del Envío
                </h4>
                <div className="bg-surface rounded-2xl p-6 border border-border/40">
                  <OrderStepper currentStatus={selectedPedido.estado} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-foreground font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Dirección de Entrega
                </h4>
                <div className="bg-surface rounded-2xl p-5 border border-border/40">
                  <p className="text-foreground">{selectedPedido.direccionEnvio}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-foreground font-semibold flex items-center gap-2">
                  <Box className="w-5 h-5 text-primary" />
                  Artículos Comprados
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedPedido.productos.map((item: any, i: number) => {
                    const producto = productos.find(p => p.id === item.productoId);
                    return (
                      <div key={i} className="flex flex-col p-4 bg-surface rounded-3xl border border-border/10 hover:border-primary/20 transition-all group">
                        <div className="aspect-square w-full bg-card rounded-2xl overflow-hidden mb-3 border border-border/10">
                          {producto?.imagenUrl ? (
                            <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl bg-primary/5">💄</div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-foreground font-semibold text-sm line-clamp-1">{producto?.nombre || 'Producto no identificado'}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-foreground-secondary text-xs">Cant: {item.cantidad}</span>
                            <span className="text-primary font-bold">{formatCurrency(item.cantidad * item.precioUnitario)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden Invoice to Print */}
      {selectedPedido && (
        <div 
          className="fixed left-0 top-0 w-full h-auto bg-white p-10 z-[-9999] opacity-0 pointer-events-none printable-invoice"
          style={{ visibility: 'hidden' }}
        >
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-bold text-pink-500 mb-2">GLAMOUR ML</h1>
              <p className="text-gray-500 text-sm">Medellín, Antioquia, Colombia</p>
              <p className="text-gray-500 text-sm">NIT: 123.456.789-0</p>
              <p className="text-gray-500 text-sm">Contacto: administracion@glamourml.com</p>
            </div>
            <div className="text-right">
              <div className="border-2 border-pink-500 px-6 py-4 rounded-2xl">
                <p className="text-pink-500 font-bold text-sm uppercase tracking-widest mb-1 text-center">FACTURA DE VENTA</p>
                <p className="text-black font-bold text-2xl text-center">#{selectedPedido.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <p className="text-gray-600 text-sm mt-3">Fecha de Emisión: <span className="text-black font-bold">{formatDate(selectedPedido.fecha)}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12 py-8 border-t border-b border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">DATOS DEL CLIENTE</p>
              <p className="text-black font-bold text-lg">{currentUser?.nombres || 'Cliente'} {currentUser?.apellidos || ''}</p>
              <p className="text-gray-600">{currentUser?.email || 'N/A'}</p>
              <p className="text-gray-600">{currentUser?.telefono || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">DIRECCIÓN DE ENVÍO</p>
              <p className="text-black font-medium">{selectedPedido.direccionEnvio}</p>
              <p className="text-gray-600">Medellín, CO</p>
              <p className="text-gray-600">Estado Pedido: <span className="font-bold text-pink-500 uppercase">{selectedPedido.estado}</span></p>
            </div>
          </div>

          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-pink-500 text-xs font-bold text-pink-600 uppercase tracking-widest">
                <th className="py-4 text-left">Descripción del Artículo</th>
                <th className="py-2 text-center">SKU</th>
                <th className="py-4 text-center">Cantidad</th>
                <th className="py-4 text-right">Precio Unit.</th>
                <th className="py-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedPedido.productos.map((item: any, i: number) => {
                const producto = productos.find(p => p.id === item.productoId);
                return (
                  <tr key={i} className="text-sm">
                    <td className="py-5">
                      <p className="font-bold text-black">{producto?.nombre || 'Producto no identificado'}</p>
                      <p className="text-xs text-gray-400">{producto?.marca || 'Glamour ML'}</p>
                    </td>
                    <td className="py-5 text-center text-gray-500">{producto?.sku || 'N/A'}</td>
                    <td className="py-5 text-center text-black font-medium">{item.cantidad}</td>
                    <td className="py-5 text-right text-gray-600">{formatCurrency(item.precioUnitario)}</td>
                    <td className="py-5 text-right font-bold text-black">{formatCurrency(item.cantidad * item.precioUnitario)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end pt-8 border-t-2 border-pink-500">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Total Gravado:</span>
                <span>{formatCurrency(selectedPedido.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Envío:</span>
                <span className="text-green-600 font-bold">EXENTO</span>
              </div>
              <div className="flex justify-between text-3xl font-bold text-pink-600 pt-3 border-t-2 border-gray-100">
                <span>TOTAL A PAGAR:</span>
                <span>{formatCurrency(selectedPedido.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-32 text-center bg-gray-50 p-6 rounded-2xl">
            <p className="text-gray-500 text-xs italic mb-2">
              Factura digital. Su validez legal está sujeta a la normativa vigente.
            </p>
            <p className="text-pink-500 font-bold text-sm">Gracias por tu confianza en GLAMOUR ML</p>
          </div>
        </div>
      )}
    </div>
  );
}
