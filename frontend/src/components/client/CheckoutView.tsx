import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { CheckCircle, QrCode, ArrowLeft, Loader2 } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { toast } from 'sonner';
import { CONFIG } from '../../lib/constants';

interface CheckoutViewProps {
  onBack: () => void;
  onComplete: () => void;
}

export function CheckoutView({ onBack, onComplete }: CheckoutViewProps) {
  const { carrito, productos, currentUser, addPedido, updateStock, clearCarrito } = useStore();
  const [step, setStep] = useState(1); // 1: Cart, 2: QR, 3: Success
  const [direccionEnvio, setDireccionEnvio] = useState(currentUser?.direccion || 'Calle 31C #89-35, Medellín');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const subtotal = carrito.reduce((sum, item) => {
    const producto = productos.find(p => p.id === item.productoId);
    return sum + (producto ? producto.precioVenta * item.cantidad : 0);
  }, 0);

  const iva = Math.round(subtotal * CONFIG.IVA);
  const costoEnvio = CONFIG.COSTO_ENVIO;
  const total = subtotal + iva + costoEnvio;

  const handleGenerateQR = () => {
    setStep(2);
  };

  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `P-${year}-${random}`;
  };

  const handleConfirmPayment = async () => {
    if (!currentUser) return;

    // Validate stock against backend (real-time) before creating order
    for (const item of carrito) {
      try {
        const freshProduct = await productService.getById(parseInt(item.productoId, 10));
        if (freshProduct.stock_actual <= 0) {
          toast.error(`"${freshProduct.nombre}" se agotó mientras comprabas`, {
            description: 'Retíralo del carrito e inténtalo de nuevo',
          });
          setIsProcessing(false);
          return;
        }
        if (item.cantidad > freshProduct.stock_actual) {
          toast.error(`Solo quedan ${freshProduct.stock_actual} unidades de "${freshProduct.nombre}"`, {
            description: 'Ajusta la cantidad en tu carrito',
          });
          setIsProcessing(false);
          return;
        }
      } catch {
        // If we can't verify, fall back to local check
        const producto = productos.find(p => p.id === item.productoId);
        if (!producto || producto.stock < item.cantidad) {
          toast.error(`Stock insuficiente para ${producto?.nombre || 'producto'}`);
          setIsProcessing(false);
          return;
        }
      }
    }

    setIsProcessing(true);
    try {
      // 1. Prepare data for backend
      const orderData = {
        direccion: direccionEnvio,
        ciudad: currentUser.ciudad || 'N/A',
        metodo_pago: 'transferencia',
        items: carrito.map(item => ({
          id_producto: parseInt(item.productoId, 10),
          cantidad: item.cantidad
        }))
      };

      console.log('🚀 Enviando orden al backend:', JSON.stringify(orderData, null, 2));

      // 2. Call backend
      const response = await orderService.create(orderData);
      
      // 3. Update local store
      const productosConPrecios = carrito.map(item => {
        const producto = productos.find(p => p.id === item.productoId);
        return {
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: producto?.precioVenta || 0,
        };
      });

      setGeneratedOrderId(response.id_pedido?.toString() || generateOrderNumber());

      addPedido({
        clienteId: currentUser.id,
        fecha: new Date().toISOString().split('T')[0],
        productos: productosConPrecios,
        subtotal,
        iva,
        costoEnvio,
        total,
        estado: 'pendiente',
        direccionEnvio,
      });

      // Update stock locally
      carrito.forEach(item => {
        updateStock(item.productoId, -item.cantidad);
      });

      // Clear cart
      clearCarrito();
      
      setShowConfirmDialog(false);
      setStep(3);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('Error al procesar el pedido', {
        description: error.message || 'Inténtalo de de nuevo más tarde'
      });
    } finally {
      setIsProcessing(false);
    }
  };


  // Auto-redirect after 3 seconds on success
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        onComplete(); // Al terminar satisfactoriamente, ir a mis pedidos
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, onBack]);

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          
          <h1 className="text-foreground mb-2" style={{ fontSize: '32px', fontWeight: 600 }}>
            ✅ Pago Verificado
          </h1>
          
          <p className="text-foreground mb-8" style={{ fontSize: '18px', fontWeight: 500 }}>
            ¡Gracias por tu compra!
          </p>

          <div className="bg-card border border-border rounded-lg p-6 mb-6 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>Pedido:</span>
              <span className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                #{generatedOrderId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>Total:</span>
              <span className="text-primary" style={{ fontSize: '20px', fontWeight: 600 }}>
                {formatCurrency(total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>Fecha:</span>
              <span className="text-foreground" style={{ fontSize: '14px' }}>
                {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 mb-6">
            <p className="text-foreground-secondary" style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Tu pedido está siendo procesado. Recibirás una confirmación por email.
            </p>
          </div>

          <Button
            onClick={onBack}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 mb-3"
          >
            🎀 IR AL INICIO
          </Button>
          
          <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>
            Redirigiendo automáticamente en 3 segundos...
          </p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-foreground-secondary hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>

            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-foreground mb-3" style={{ fontSize: '24px', fontWeight: 600 }}>
                Escanea el código QR
              </h2>
              
              <p className="text-foreground-secondary mb-6" style={{ fontSize: '14px' }}>
                Escanea con tu app bancaria para realizar el pago
              </p>

              {/* Simulated QR Code */}
              <div className="bg-white p-6 rounded-lg mb-6 inline-block">
                <div className="w-48 h-48 bg-gradient-to-br from-primary/30 to-primary-light/30 rounded-lg flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-primary/40" />
                </div>
              </div>

              <div className="bg-surface rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                    Total a pagar:
                  </span>
                  <span className="text-primary" style={{ fontSize: '20px', fontWeight: 600 }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
              >
                ¿Ya realizaste el pago?
              </Button>
              
              <p className="text-foreground-secondary mt-4" style={{ fontSize: '12px' }}>
                Presiona el botón cuando hayas completado la transferencia
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="bg-card border-border" aria-describedby="confirm-payment-desc">
            <DialogHeader>
              <DialogTitle className="text-foreground">Confirmar Pago</DialogTitle>
              <div id="confirm-payment-desc" className="sr-only">
                Confirmación de pago por transferencia bancaria.
              </div>
            </DialogHeader>

            <div className="py-6">
              <p className="text-foreground text-center" style={{ fontSize: '16px', lineHeight: 1.6 }}>
                ¿Ya completaste el pago mediante la transferencia?
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="border-border text-foreground hover:bg-surface flex-1"
              >
                ❌ No, cancelar
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="bg-success hover:bg-success/90 text-background flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  '✅ Sí, ya pagué'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground-secondary hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al carrito
        </button>

        <h1 className="text-foreground mb-8" style={{ fontSize: '32px', fontWeight: 600 }}>
          Finalizar Compra
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h3 className="text-foreground mb-4" style={{ fontSize: '20px', fontWeight: 600 }}>
              Resumen del Pedido
            </h3>
            
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              {carrito.map((item) => {
                const producto = productos.find(p => p.id === item.productoId);
                if (!producto) return null;

                return (
                  <div key={item.productoId} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-surface rounded flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                        {producto.imagenUrl ? (
                          <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary" style={{ fontSize: '10px' }}>
                            {producto.sku}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                          {producto.nombre}
                        </p>
                        <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>
                          Cantidad: {item.cantidad}
                        </p>
                      </div>
                    </div>
                    <p className="text-foreground" style={{ fontSize: '14px' }}>
                      {formatCurrency(producto.precioVenta * item.cantidad)}
                    </p>
                  </div>
                );
              })}

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-foreground-secondary" style={{ fontSize: '14px' }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-foreground-secondary" style={{ fontSize: '14px' }}>
                  <span>Envío:</span>
                  <span>{formatCurrency(costoEnvio)}</span>
                </div>
                <div className="flex justify-between text-foreground pt-2 border-t border-border" style={{ fontSize: '18px', fontWeight: 600 }}>
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div>
            <h3 className="text-foreground mb-4" style={{ fontSize: '20px', fontWeight: 600 }}>
              Información de Envío
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-foreground">
                  Dirección de Envío <span className="text-danger">*</span>
                </Label>
                <Input
                  id="direccion"
                  value={direccionEnvio}
                  onChange={(e) => setDireccionEnvio(e.target.value)}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Calle 31C #89-35"
                />
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="text-foreground mb-3" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Método de Pago
                </h4>
                <div className="flex items-center gap-3 p-4 bg-surface rounded-lg">
                  <QrCode className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Pago con QR
                    </p>
                    <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>
                      Escanea y paga desde tu app bancaria
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerateQR}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                disabled={!direccionEnvio}
              >
                🎀 GENERAR CÓDIGO QR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
