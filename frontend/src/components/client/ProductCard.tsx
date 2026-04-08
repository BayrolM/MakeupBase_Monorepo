import { useStore } from '../../lib/store';
import { Heart, ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  producto: any;
  onViewDetail: (producto: any) => void;
}

export function ProductCard({ producto, onViewDetail }: ProductCardProps) {
  const { favoritos, toggleFavorito, addToCarrito, categorias } = useStore();
  const isFavorito = favoritos.includes(producto.id);
  const categoria = categorias.find(c => c.id === producto.categoriaId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleAddToCart = () => {
    if (producto.stock > 0) {
      addToCarrito(producto.id, 1);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all group">
      {/* Image */}
      <div className="relative aspect-square bg-surface flex items-center justify-center overflow-hidden">
        {producto.imagenUrl ? (
          <img 
            src={producto.imagenUrl} 
            alt={producto.nombre} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="text-primary/30 text-center">
            <div className="text-4xl">💄</div>
          </div>
        )}
        
        {/* Stock Badge */}
        {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
          <div className="absolute top-2 left-2">
            <div className="bg-warning/90 text-warning-foreground px-2 py-1 rounded text-[10px] font-bold">
              ÚLTIMAS UNIDADES
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-foreground-secondary mb-1" style={{ fontSize: '12px' }}>
          {categoria?.nombre || 'Sin categoría'}
        </p>
        <h3 className="text-foreground mb-2 line-clamp-2" style={{ fontSize: '15px', fontWeight: 500, minHeight: '40px' }}>
          {producto.nombre}
        </h3>
        <p className="text-primary mb-4" style={{ fontSize: '20px', fontWeight: 600 }}>
          {formatCurrency(producto.precioVenta)}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorito(producto.id)}
            className={`flex-1 h-10 rounded-lg flex items-center justify-center transition-all ${
              isFavorito 
                ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                : 'bg-surface hover:bg-primary/10 text-foreground-secondary hover:text-primary'
            }`}
            title="Agregar a favoritos"
          >
            <Heart className={`w-5 h-5 ${isFavorito ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleAddToCart}
            disabled={producto.stock === 0}
            className="flex-1 h-10 rounded-lg flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Agregar al carrito"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>

          <button
            onClick={() => onViewDetail(producto)}
            className="flex-1 h-10 rounded-lg flex items-center justify-center bg-surface hover:bg-primary/10 text-foreground-secondary hover:text-primary transition-all"
            title="Ver detalle"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
