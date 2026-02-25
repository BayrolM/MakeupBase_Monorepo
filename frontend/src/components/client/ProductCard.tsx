import { useStore } from '../../lib/store';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

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
      <div className="relative aspect-square bg-surface flex items-center justify-center p-6">
        <div className="text-primary/30 text-center">
          <div className="text-4xl mb-2">💄</div>
          <p className="text-xs text-foreground-secondary">{producto.sku}</p>
        </div>
        
        {/* Stock Badge */}
        {producto.stock <= producto.stockMinimo && (
          <div className="absolute top-2 left-2">
            <StatusBadge status="inactivo" size="sm" />
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
