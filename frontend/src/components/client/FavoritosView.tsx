import { useState } from 'react';
import { useStore } from '../../lib/store';
import { ProductCard } from './ProductCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Heart } from 'lucide-react';

export function FavoritosView() {
  const { favoritos, productos, categorias } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const favoritosProducts = productos.filter(p => favoritos.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary fill-current" />
            <h1 className="text-foreground" style={{ fontSize: '32px', fontWeight: 600 }}>
              Mis Favoritos
            </h1>
          </div>
          <p className="text-foreground-secondary" style={{ fontSize: '16px' }}>
            {favoritosProducts.length} {favoritosProducts.length === 1 ? 'producto guardado' : 'productos guardados'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {favoritosProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-20 h-20 text-foreground-secondary opacity-30 mx-auto mb-6" />
            <h3 className="text-foreground mb-3" style={{ fontSize: '24px', fontWeight: 600 }}>
              No tienes favoritos aún
            </h3>
            <p className="text-foreground-secondary mb-8" style={{ fontSize: '16px' }}>
              Explora nuestro catálogo y guarda los productos que más te gusten
            </p>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg transition-all">
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritosProducts.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onViewDetail={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="bg-card border-border max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalle del Producto</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-6 py-4">
              <div className="aspect-square bg-surface rounded-lg flex items-center justify-center p-12">
                <div className="text-primary/30 text-center">
                  <div className="text-6xl mb-4">💄</div>
                  <p className="text-sm text-foreground-secondary">{selectedProduct.sku}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-foreground-secondary mb-1" style={{ fontSize: '14px' }}>
                    {categorias.find(c => c.id === selectedProduct.categoriaId)?.nombre}
                  </p>
                  <h3 className="text-foreground mb-2" style={{ fontSize: '24px', fontWeight: 600 }}>
                    {selectedProduct.nombre}
                  </h3>
                  <p className="text-primary mb-4" style={{ fontSize: '32px', fontWeight: 600 }}>
                    {formatCurrency(selectedProduct.precioVenta)}
                  </p>
                </div>

                <div>
                  <p className="text-foreground mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Descripción
                  </p>
                  <p className="text-foreground-secondary" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                    {selectedProduct.descripcion}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-foreground-secondary mb-2" style={{ fontSize: '13px' }}>
                    Disponibilidad: <span className={selectedProduct.stock > 0 ? 'text-success' : 'text-danger'}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades` : 'Agotado'}
                    </span>
                  </p>
                  <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>
                    SKU: {selectedProduct.sku}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
