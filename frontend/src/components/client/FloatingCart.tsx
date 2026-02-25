import { useState } from 'react';
import { useStore } from '../../lib/store';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '../ui/sheet';
import { ThemeToggle } from '../ThemeToggle';

interface FloatingCartProps {
  onCheckout: () => void;
}

export function FloatingCart({ onCheckout }: FloatingCartProps) {
  const { carrito, productos, removeFromCarrito, updateCarritoQuantity } = useStore();
  const [isOpen, setIsOpen] = useState(false);

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

  const shippingCost = 8000;
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
                    <div key={item.productoId} className="flex gap-4 p-4 bg-surface rounded-lg">
                      <div className="w-20 h-20 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-primary" style={{ fontSize: '12px' }}>
                          {producto.sku}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground truncate" style={{ fontSize: '14px', fontWeight: 500 }}>
                          {producto.nombre}
                        </h4>
                        <p className="text-primary" style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
                          {formatCurrency(producto.precioVenta)}
                        </p>
                        
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
                              disabled={item.cantidad >= producto.stock}
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCarrito(item.productoId)}
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

                <Button
                  onClick={() => {
                    setIsOpen(false);
                    onCheckout();
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                  disabled={carrito.length === 0}
                >
                  🎀 FINALIZAR COMPRA
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}