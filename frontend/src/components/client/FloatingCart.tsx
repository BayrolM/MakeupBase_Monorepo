import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../lib/store';
import { ShoppingCart, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '../ui/sheet';
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
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg transition-all relative"
          style={{ width: '56px', height: '56px' }}
        >
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-danger text-foreground rounded-full flex items-center justify-center"
              style={{ width: '24px', height: '24px', fontSize: '12px', fontWeight: 600 }}
            >
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Cart Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="bg-card border-border w-full sm:max-w-lg">
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle className="text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Mi Carrito ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-6 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="w-16 h-16 text-foreground-secondary opacity-30 mb-4" />
                <p className="text-foreground-secondary text-center" style={{ fontSize: '15px' }}>
                  Tu carrito está vacío
                </p>
                <p className="text-foreground-secondary text-center mt-2" style={{ fontSize: '13px' }}>
                  Agrega productos desde el catálogo
                </p>
              </div>
            ) : (
              <>
                {carrito.map((item) => {
                  const producto = productos.find(p => p.id === item.productoId);
                  if (!producto) return null;

                  return (
                    <div key={item.productoId} className={`flex gap-4 p-4 rounded-lg ${stockIssues[item.productoId]?.available === 0 ? 'bg-danger/10 border border-danger/30' : 'bg-surface'}`}>
                      <div className="w-20 h-20 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {producto.imagenUrl ? (
                          <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary" style={{ fontSize: '12px' }}>
                            {producto.sku}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground truncate" style={{ fontSize: '14px', fontWeight: 500 }}>
                          {producto.nombre}
                        </h4>
                        <p className="text-primary" style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
                          {formatCurrency(producto.precioVenta)}
                        </p>

                        {stockIssues[item.productoId] && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                            <span className="text-warning" style={{ fontSize: '12px' }}>
                              {stockIssues[item.productoId].available === 0
                                ? 'Producto agotado — retíralo del carrito'
                                : `Solo quedan ${stockIssues[item.productoId].available} unidades`}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-2 bg-input-background border border-border rounded px-2">
                            <button
                              onClick={() => updateCarritoQuantity(item.productoId, item.cantidad - 1)}
                              className="text-foreground-secondary hover:text-foreground p-1"
                            >
                              -
                            </button>
                            <span className="text-foreground min-w-[20px] text-center" style={{ fontSize: '14px' }}>
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateCarritoQuantity(item.productoId, item.cantidad + 1)}
                              className="text-foreground-secondary hover:text-foreground p-1"
                              disabled={item.cantidad >= producto.stock || stockIssues[item.productoId]?.available === 0}
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => {
                              removeFromCarrito(item.productoId);
                              setStockIssues(prev => { const next = { ...prev }; delete next[item.productoId]; return next; });
                            }}
                            className="text-danger hover:text-danger/80 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {carrito.length > 0 && (
            <SheetFooter className="border-t border-border pt-4">
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-foreground-secondary" style={{ fontSize: '14px' }}>
                    <span>Subtotal:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-foreground-secondary" style={{ fontSize: '14px' }}>
                    <span>Envío:</span>
                    <span>{formatCurrency(shippingCost)}</span>
                  </div>
                  <div className="flex items-center justify-between text-foreground pt-2 border-t border-border" style={{ fontSize: '18px', fontWeight: 600 }}>
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                {isValidating && (
                  <div className="flex items-center justify-center gap-2 text-foreground-secondary" style={{ fontSize: '13px' }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando disponibilidad...
                  </div>
                )}
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    onCheckout();
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                  disabled={carrito.length === 0 || hasBlockingIssues || isValidating}
                >
                  {hasBlockingIssues ? '⚠️ RESUELVE LOS PROBLEMAS DE STOCK' : '🎀 FINALIZAR COMPRA'}
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}