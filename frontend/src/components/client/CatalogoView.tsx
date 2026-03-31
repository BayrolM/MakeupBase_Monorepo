import { useState } from 'react';
import { useStore } from '../../lib/store';
import { ProductCard } from './ProductCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export function CatalogoView({ 
  initialCategory = 'all',
  onClearCategory
}: { 
  initialCategory?: string,
  onClearCategory?: () => void
} = {}) {
  const { productos, categorias, addToCarrito } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [showFilters, setShowFilters] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Filter products
  const filteredProducts = productos.filter(p => {
    if (p.estado !== 'activo') return false;
    
    // Search filter
    if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== 'all' && p.categoriaId !== selectedCategory) {
      return false;
    }
    
    // Price range filter
    if (p.precioVenta < priceRange[0] || p.precioVenta > priceRange[1]) {
      return false;
    }
    
    // Stock filter
    if (p.stock === 0) {
      return false;
    }
    
    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 150000]);
    onClearCategory?.();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-foreground mb-4" style={{ fontSize: '32px', fontWeight: 600 }}>
            Catálogo de Productos
          </h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background border-border text-foreground h-12"
              placeholder="Buscar productos..."
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <h3 className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                      Filtros
                    </h3>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-foreground-secondary hover:text-primary transition-colors"
                    style={{ fontSize: '13px' }}
                  >
                    Limpiar
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Categoría
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-input-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="all" className="text-foreground">Todas</SelectItem>
                        {categorias.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="text-foreground">
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-3">
                    <label className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Rango de Precio
                    </label>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={150000}
                        step={5000}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-foreground-secondary" style={{ fontSize: '13px' }}>
                      <span>{formatCurrency(priceRange[0])}</span>
                      <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                  </div>

                  {/* Stock Filter Removido ya que ahora es automático */}
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                style={{ fontSize: '14px' }}
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-foreground mb-2" style={{ fontSize: '20px', fontWeight: 500 }}>
                  No se encontraron productos
                </h3>
                <p className="text-foreground-secondary mb-6" style={{ fontSize: '14px' }}>
                  Intenta ajustar los filtros de búsqueda
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-all"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    onViewDetail={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="bg-card border-border max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalle del Producto</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-6 py-4">
              <div className="aspect-square bg-surface rounded-lg flex items-center justify-center overflow-hidden border border-border">
                {selectedProduct.imagenUrl ? (
                  <img 
                    src={selectedProduct.imagenUrl} 
                    alt={selectedProduct.nombre} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-primary/30 text-center">
                    <div className="text-6xl mb-4">💄</div>
                    <p className="text-sm text-foreground-secondary">{selectedProduct.sku}</p>
                  </div>
                )}
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

                <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>
                  SKU: {selectedProduct.sku}
                </p>

                <div className="pt-6 border-t border-border flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <label className="text-foreground text-sm font-medium">Cantidad:</label>
                    <div className="flex items-center border border-border rounded-lg overflow-hidden h-10">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 bg-surface hover:bg-primary/10 text-foreground transition-colors disabled:opacity-30"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center bg-input-background text-foreground border-x border-border focus:outline-none"
                      />
                      <button 
                        onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                        className="px-3 bg-surface hover:bg-primary/10 text-foreground transition-colors disabled:opacity-30"
                        disabled={quantity >= selectedProduct.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      addToCarrito(selectedProduct.id, quantity);
                      // Reset and notify
                      toast.success('Producto agregado', {
                        description: `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${selectedProduct.nombre} agregadas al carrito`,
                      });
                      setSelectedProduct(null);
                      setQuantity(1);
                    }}
                    disabled={selectedProduct.stock === 0}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    AGREGAR AL CARRITO
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
