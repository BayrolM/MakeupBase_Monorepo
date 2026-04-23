import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { CheckCircle, ArrowLeft, Loader2, Banknote, Smartphone, Upload, X, HelpCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { toast } from 'sonner';
import { CONFIG } from '../../lib/constants';
import { uploadToSupabase } from '../supabaseUpload';

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
};

interface CheckoutViewProps {
  onBack: () => void;
  onComplete: () => void;
}

export function CheckoutView({ onBack, onComplete }: CheckoutViewProps) {
  const { carrito, productos, currentUser, addPedido, updateStock, clearCarrito } = useStore();
  const [step, setStep] = useState(1); 
  const [direccionEnvio, setDireccionEnvio] = useState(currentUser?.direccion || 'Calle 31C #89-35, Medellín');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleContinuarPago = () => {
    setStep(2);
  };

  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `P-${year}-${random}`;
  };

  const handleConfirmPayment = async () => {
    if (!currentUser) return;

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
      const orderData = {
        direccion: direccionEnvio,
        ciudad: currentUser.ciudad || 'N/A',
        metodo_pago: 'transferencia',
        items: carrito.map(item => ({
          id_producto: parseInt(item.productoId, 10),
          cantidad: item.cantidad
        }))
      };

      const response = await orderService.create(orderData);
      const idPedido = response.id_pedido;

      let comprobanteUrl = '';
      if (comprobanteFile && idPedido) {
        setIsUploading(true);
        try {
          console.log('📤 Iniciando upload del comprobante...');
          const uploadResult = await uploadToSupabase(comprobanteFile, 'comprobantes');
          comprobanteUrl = uploadResult.secure_url;
          console.log('✅ Comprobante subido:', comprobanteUrl);
          
          await orderService.updateComprobanteUrl(idPedido, comprobanteUrl);
          console.log('✅ URL guardada en el pedido');
          toast.success('Comprobante de pago subido correctamente');
        } catch (uploadError: any) {
          console.error('❌ Error al subir comprobante:', uploadError);
          toast.error('Error al subir comprovante', {
            description: uploadError.message || 'El comprovante no se pudo subir. Contacta al administrador.',
          });
        } finally {
          setIsUploading(false);
        }
      }

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
        pago_confirmado: false,
        comprobante_url: comprobanteUrl,
        direccionEnvio,
      });

      carrito.forEach(item => {
        updateStock(item.productoId, -item.cantidad);
      });

      clearCarrito();
      setShowConfirmDialog(false);
      setStep(3);
    } catch (error: any) {
      toast.error('Error al procesar el pedido', {
        description: error.message || 'Inténtalo de de nuevo más tarde'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, onBack, onComplete]);

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
              <span style={{ color: C.accentDeep, fontSize: '20px', fontWeight: 600 }}>
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
            className="w-full text-primary-foreground h-12 mb-3"
            style={{ background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)` }}
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
        <div style={{ height: '100vh', background: C.bgSoft, display: 'flex', flexDirection: 'column', padding: '24px 40px', overflow: 'hidden' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
            <button
              onClick={() => setStep(1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: C.accentDeep, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              Volver al resumen
            </button>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.accentDeep, margin: 0, textAlign: 'right' }}>Paso 2 de 2</p>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: C.textDark, margin: 0 }}>Realiza tu transferencia</h2>
            </div>
          </div>

          {/* Two-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1, width: '100%', overflow: 'hidden' }}>

            {/* LEFT: Bank accounts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>

              {/* Bancolombia */}
              <div style={{ background: C.white, border: `1px solid ${C.accent}`, borderRadius: '14px', padding: '20px', boxShadow: `0 2px 8px ${C.shadow}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff8e1', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Banknote style={{ width: 20, height: 20, color: '#d97706' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: C.textDark, margin: 0 }}>Bancolombia</p>
                    <p style={{ fontSize: '12px', color: C.textMuted, margin: 0 }}>Cuenta de Ahorros</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: C.bgSoft, border: `1px solid ${C.accent}`, borderRadius: '8px', padding: '12px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: C.accentDeep, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>N° de Cuenta</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: C.textDark, fontFamily: 'monospace', margin: 0 }}>123-456789-12</p>
                  </div>
                  <div style={{ background: C.bgSoft, border: `1px solid ${C.accent}`, borderRadius: '8px', padding: '12px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: C.accentDeep, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Tipo</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: C.textDark, margin: 0 }}>Ahorros</p>
                  </div>
                </div>
              </div>

              {/* Nequi */}
              <div style={{ background: C.white, border: `1px solid ${C.accent}`, borderRadius: '14px', padding: '20px', boxShadow: `0 2px 8px ${C.shadow}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f0ff', border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Smartphone style={{ width: 20, height: 20, color: '#7c3aed' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: C.textDark, margin: 0 }}>Nequi</p>
                    <p style={{ fontSize: '12px', color: C.textMuted, margin: 0 }}>Transferencia por celular</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: C.bgSoft, border: `1px solid ${C.accent}`, borderRadius: '8px', padding: '12px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: C.accentDeep, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Número Nequi</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: C.textDark, fontFamily: 'monospace', margin: 0 }}>300 123 4567</p>
                  </div>
                  <div style={{ background: C.bgSoft, border: `1px solid ${C.accent}`, borderRadius: '8px', padding: '12px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: C.accentDeep, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Nombre</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: C.textDark, margin: 0 }}>Glamour ML</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Total + Comprobante + CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>

              {/* Total banner */}
              <div style={{ background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`, borderRadius: '14px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Total a transferir</p>
                  <p style={{ fontSize: '28px', fontWeight: 800, color: C.white, letterSpacing: '-1px', margin: '4px 0 0 0' }}>{formatCurrency(total)}</p>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Banknote style={{ width: 22, height: 22, color: C.white }} />
                </div>
              </div>

              {/* Comprobante upload */}
              <div style={{ background: C.white, border: `2px dashed ${C.accentDark}`, borderRadius: '14px', padding: '20px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Upload style={{ width: 16, height: 16, color: C.accentDeep }} />
                  <p style={{ fontSize: '14px', fontWeight: 700, color: C.textDark, margin: 0 }}>Comprobante de pago</p>
                </div>
                <p style={{ fontSize: '12px', color: C.textMuted, marginBottom: '16px' }}>
                  Adjunta una captura o foto clara de tu transferencia (imagen o PDF).
                </p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', fontSize: '13px', color: C.textMuted, cursor: 'pointer' }}
                />
                {comprobanteFile && (
                  <p style={{ marginTop: '12px', fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>✓ {comprobanteFile.name}</p>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={!comprobanteFile || isUploading}
                style={{
                  width: '100%', height: '52px', borderRadius: '12px',
                  background: comprobanteFile && !isUploading ? `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)` : '#e5e7eb',
                  color: comprobanteFile && !isUploading ? C.white : C.textMuted,
                  border: 'none', cursor: comprobanteFile && !isUploading ? 'pointer' : 'not-allowed',
                  fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px', transition: 'opacity 0.2s',
                }}
              >
                {isUploading ? 'Procesando...' : '✅ Ya realicé el pago'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '11px', color: C.textMuted, marginTop: '-8px' }}>Solo presiona después de completar la transferencia.</p>
            </div>

          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden" aria-describedby="confirm-payment-desc">
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div 
                  className="flex items-center justify-center flex-shrink-0" 
                  style={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: 12, 
                    background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`, 
                    boxShadow: "0 2px 8px rgba(196,123,150,0.3)" 
                  }}
                >
                  <Banknote className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold leading-tight" style={{ color: C.textDark }}>
                    Confirmar pedido
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-400 mt-0.5">
                    Verificación de pago por transferencia
                  </DialogDescription>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirmDialog(false)} 
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div style={{ padding: "20px 24px" }}>
              <div style={{ background: C.bgSoft, borderRadius: "12px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px", border: `1px solid ${C.accent}` }}>
                <HelpCircle style={{ color: C.accentDeep, width: 18, height: 18, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: "14px", color: C.textDark, lineHeight: 1.5, fontWeight: 600 }}>
                    ¿Has completado todos los pasos?
                  </p>
                  <p style={{ fontSize: "13px", color: C.textMuted, marginTop: 4, lineHeight: 1.5 }}>
                    Confirma solo si ya realizaste la transferencia desde tu banco y has adjuntado el comprobante correctamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)} 
                className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm font-semibold" 
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
                style={{ background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`, color: C.white }}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Sí, confirmar
                  </div>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div style={{ height: '100vh', background: C.bgSoft, display: 'flex', flexDirection: 'column', padding: '24px 40px', overflow: 'hidden' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: C.accentDeep, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Volver al carrito
          </button>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.accentDeep, margin: 0, textAlign: 'right' }}>Paso 1 de 2</p>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: C.textDark, margin: 0 }}>Finalizar Compra</h1>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', flex: 1, overflow: 'hidden' }}>

          {/* ─ ORDER SUMMARY ─ */}
          <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.accentDeep, marginBottom: '12px' }}>Resumen del Pedido</p>
            <div style={{ background: C.white, border: `1px solid ${C.accent}`, borderRadius: '12px', padding: '20px', boxShadow: `0 2px 8px ${C.shadow}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {carrito.map((item) => {
                  const producto = productos.find(p => p.id === item.productoId);
                  if (!producto) return null;
                  return (
                    <div key={item.productoId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.accent}`, flexShrink: 0, background: C.bgSoft }}>
                          {producto.imagenUrl
                            ? <img src={producto.imagenUrl} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '10px', color: C.accentDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Imagen</span>
                          }
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: C.textDark, margin: 0 }}>{producto.nombre}</p>
                          <p style={{ fontSize: '12px', color: C.textMuted, margin: 0 }}>Cant. {item.cantidad}</p>
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: C.textDark, whiteSpace: 'nowrap' }}>{formatCurrency(producto.precioVenta * item.cantidad)}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: `1px solid ${C.accent}`, marginTop: '16px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: C.textMuted }}>
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: C.textMuted }}>
                  <span>Envío</span><span>{formatCurrency(costoEnvio)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, color: C.textDark, borderTop: `1px solid ${C.accent}`, paddingTop: '12px', marginTop: '4px' }}>
                  <span>Total</span>
                  <span style={{ color: C.accentDeep }}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─ SHIPPING + PAYMENT ─ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.accentDeep, marginBottom: '0' }}>Información de Envío</p>

            {/* Address */}
            <div style={{ background: C.white, border: `1px solid ${C.accent}`, borderRadius: '12px', padding: '20px', boxShadow: `0 2px 8px ${C.shadow}` }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: '8px' }}>
                Dirección de Envío <span style={{ color: C.accentDeep }}>*</span>
              </label>
              <input
                id="direccion"
                value={direccionEnvio}
                onChange={(e) => setDireccionEnvio(e.target.value)}
                placeholder="Calle 31C #89-35"
                style={{
                  width: '100%', height: '40px', borderRadius: '8px',
                  border: `1.5px solid ${C.accentDark}`, padding: '0 12px',
                  fontSize: '14px', color: C.textDark, outline: 'none',
                  background: C.white, boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Payment methods */}
            <div style={{ background: C.white, border: `1px solid ${C.accent}`, borderRadius: '12px', padding: '20px', boxShadow: `0 2px 8px ${C.shadow}` }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: C.accentDeep, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Método de Pago</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#fffbf0', border: '1px solid #fde68a', borderRadius: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Banknote style={{ width: 18, height: 18, color: '#d97706' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: C.textDark, margin: 0 }}>Bancolombia</p>
                    <p style={{ fontSize: '11px', color: C.textMuted, margin: 0 }}>Cuenta de Ahorros · 123-456789-12</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f5f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Smartphone style={{ width: 18, height: 18, color: '#7c3aed' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: C.textDark, margin: 0 }}>Nequi</p>
                    <p style={{ fontSize: '11px', color: C.textMuted, margin: 0 }}>300 123 4567 · Glamour ML</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleContinuarPago}
              disabled={!direccionEnvio}
              style={{
                width: '100%', height: '48px', borderRadius: '10px',
                background: direccionEnvio ? `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)` : '#e5e7eb',
                color: direccionEnvio ? C.white : C.textMuted,
                border: 'none', cursor: direccionEnvio ? 'pointer' : 'not-allowed',
                fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px', transition: 'opacity 0.2s',
              }}
            >
              🎀 Ver datos de pago y transferir
            </button>
          </div>
        </div>
    </div>
  );
}
