import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../lib/store';
import { ShoppingCart, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { ThemeToggle } from '../ThemeToggle';
import { CONFIG } from '../../lib/constants';
import { productService } from '../../services/productService';
import { toast } from 'sonner';

interface FloatingCartProps {
  onCheckout: () => void;
}

export function FloatingCart({ onCheckout }: FloatingCartProps) {
  const { carrito, productos, removeFromCarrito, updateCarritoQuantity } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [stockIssues, setStockIssues] = useState<Record<string, { available: number; requested: number }>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateStock = useCallback(async () => {
    if (carrito.length === 0) return;
    setIsValidating(true);
    const issues: Record<string, { available: number; requested: number }> = {};
    try {
      for (const item of carrito) {
        try {
          const freshProduct = await productService.getById(parseInt(item.productoId, 10));
          const availableStock = freshProduct.stock_actual;
          if (availableStock <= 0) {
            issues[item.productoId] = { available: 0, requested: item.cantidad };
          } else if (item.cantidad > availableStock) {
            issues[item.productoId] = { available: availableStock, requested: item.cantidad };
            updateCarritoQuantity(item.productoId, availableStock);
          }
        } catch { /* skip if fetch fails */ }
      }
      setStockIssues(issues);
      if (Object.keys(issues).length > 0) {
        const outOfStock = Object.values(issues).filter(i => i.available === 0).length;
        const adjusted = Object.values(issues).filter(i => i.available > 0).length;
        if (outOfStock > 0) toast.warning(`${outOfStock} producto(s) sin stock disponible`);
        if (adjusted > 0) toast.info(`${adjusted} producto(s) ajustados por stock limitado`);
      }
    } finally {
      setIsValidating(false);
    }
  }, [carrito, updateCarritoQuantity]);

  useEffect(() => {
    if (isOpen && carrito.length > 0) validateStock();
    if (!isOpen) setStockIssues({});
  }, [isOpen]);

  const hasBlockingIssues = Object.values(stockIssues).some(i => i.available === 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const cartTotal = carrito.reduce((sum, item) => {
    const producto = productos.find(p => p.id === item.productoId);
    return sum + (producto ? producto.precioVenta * item.cantidad : 0);
  }, 0);

  const shippingCost = CONFIG.COSTO_ENVIO;
  const total = cartTotal + shippingCost;
  const itemCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <>
      {/* Floating Buttons Container */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Theme Toggle Button */}
        <ThemeToggle inline />
        
        {/* Cart Button */}
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #c47b96 0%, #a85d77 100%)',
            borderRadius: '50%', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(176,96,128,0.3)', position: 'relative',
            color: '#fff'
          }}
        >
          <ShoppingCart style={{ width: 22, height: 22 }} />
          {itemCount > 0 && (
            <span
              style={{
                position: 'absolute', top: '14px', right: '14px',
                width: '8px', height: '8px', background: '#fff',
                borderRadius: '50%', boxShadow: '0 0 0 2px #b06080'
              }}
            />
          )}
        </button>
      </div>

      {/* Cart Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="" style={{ background: '#fff', borderLeft: '1px solid #f0e0e8', width: '100%', maxWidth: '440px', padding: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <SheetHeader style={{ padding: '24px', borderBottom: '1px solid #f0e0e8' }}>
              <SheetTitle style={{ color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', margin: 0 }}>
                <ShoppingCart style={{ width: 18, height: 18, color: '#b06080' }} />
                Mi Carrito <span style={{ color: '#777', fontWeight: 400, fontSize: '14px' }}>({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>
              </SheetTitle>
            </SheetHeader>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {carrito.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                  <ShoppingCart style={{ width: 48, height: 48, color: '#f0e0e8', marginBottom: '16px' }} />
                  <p style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 600, margin: 0 }}>Tu carrito está vacío</p>
                  <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Agrega productos desde el catálogo</p>
                </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {carrito.map((item) => {
                  const producto = productos.find(p => p.id === item.productoId);
                  if (!producto) return null;

                  const hasStockIssue = stockIssues[item.productoId]?.available === 0;

                  return (
                    <div key={item.productoId} style={{ display: 'flex', gap: '16px', background: hasStockIssue ? '#fff5f5' : '#fff', border: `1px solid ${hasStockIssue ? '#fca5a5' : '#e0c0cc'}`, borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(176,96,128,0.04)' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#fafafa', border: '1px solid #f0e0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {producto.imagenUrl ? (
                          <img src={producto.imagenUrl} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '10px', color: '#b06080' }}>Imagen</span>
                        )}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {producto.nombre}
                          </h4>
                          <button
                            onClick={() => {
                              removeFromCarrito(item.productoId);
                              setStockIssues(prev => { const next = { ...prev }; delete next[item.productoId]; return next; });
                            }}
                            style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer' }}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 style={{ width: 16, height: 16 }} />
                          </button>
                        </div>
                        
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#b06080', margin: '4px 0 0 0' }}>
                          {formatCurrency(producto.precioVenta)}
                        </p>

                        {stockIssues[item.productoId] && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                            <AlertTriangle style={{ width: 12, height: 12, color: '#d97706' }} />
                            <span style={{ fontSize: '11px', color: '#d97706' }}>
                              {stockIssues[item.productoId].available === 0
                                ? 'Agotado — retíralo'
                                : `Solo quedan ${stockIssues[item.productoId].available}`}
                            </span>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                            <button
                              onClick={() => updateCarritoQuantity(item.productoId, item.cantidad - 1)}
                              style={{ width: '28px', height: '28px', border: 'none', background: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '13px', color: '#1a1a1a', width: '20px', textAlign: 'center' }}>
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateCarritoQuantity(item.productoId, item.cantidad + 1)}
                              disabled={item.cantidad >= producto.stock || hasStockIssue}
                              style={{ width: '28px', height: '28px', border: 'none', background: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: (item.cantidad >= producto.stock || hasStockIssue) ? 0.4 : 1 }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>

            {carrito.length > 0 && (
              <div style={{ padding: '24px', borderTop: '1px solid #f0e0e8', background: '#fff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
                    <span>Subtotal:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
                    <span>Envío:</span>
                    <span>{formatCurrency(shippingCost)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#1a1a1a', paddingTop: '12px', borderTop: '1px dashed #e5e7eb', marginTop: '4px' }}>
                    <span>Total:</span>
                    <span style={{ color: '#b06080' }}>{formatCurrency(total)}</span>
                  </div>
                </div>

                {isValidating && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: '#888', marginBottom: '16px' }}>
                    <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                    Verificando stock...
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onCheckout();
                  }}
                  disabled={carrito.length === 0 || hasBlockingIssues || isValidating}
                  style={{
                    width: '100%', height: '48px', borderRadius: '10px',
                    background: hasBlockingIssues ? '#e5e7eb' : 'linear-gradient(135deg, #c47b96 0%, #a85d77 100%)',
                    color: hasBlockingIssues ? '#9ca3af' : '#fff',
                    border: 'none', cursor: hasBlockingIssues ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px'
                  }}
                >
                  {hasBlockingIssues ? '⚠️ PROBLEMAS DE STOCK' : '🎀 FINALIZAR COMPRA'}
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}