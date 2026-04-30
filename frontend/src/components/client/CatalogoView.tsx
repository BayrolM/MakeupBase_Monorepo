import { useState } from "react";
import { useStore } from "../../lib/store";
import { ProductCard } from "./ProductCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Search, Filter, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

/* ── Luxury CSS variable helpers (same pattern as InicioView) ── */
const V = (name: string) => `var(--luxury-${name})`;
const C = {
  accent: V("pink-soft"),
  accentDark: V("accent-dark"),
  accentDeep: V("pink"),
  accentSoft: V("accent-soft"),
  bgSoft: V("bg-soft"),
  bgHeader: V("bg-header"),
  textDark: V("text-dark"),
  textSecondary: V("text-secondary"),
  textMuted: V("text-muted"),
  white: "#ffffff",
  deep: V("deep"),
  cream: V("cream"),
  shadow: V("shadow"),
  shadowXs: V("shadow-xs"),
  shadowSm: V("shadow-sm"),
  shadowLg: V("shadow-lg"),
};

export function CatalogoView({
  initialCategory = "all",
  onClearCategory,
}: {
  initialCategory?: string;
  onClearCategory?: () => void;
} = {}) {
  const { productos, categorias, addToCarrito } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || "all",
  );
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [showFilters, setShowFilters] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Filter products
  const filteredProducts = productos.filter((p) => {
    if (p.estado !== "activo") return false;

    // Search filter
    if (
      searchQuery &&
      !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (selectedCategory !== "all" && p.categoriaId !== selectedCategory) {
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
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 150000]);
    onClearCategory?.();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSoft,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Hero Header with Gradient */}
      <div
        style={{
          background: `linear-gradient(135deg, #2e1020 0%, #4a1a30 30%, #7b1347 65%, #a85d77 100%)`,
          padding: "3rem 2rem 2.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            right: "5%",
            top: "-30px",
            fontSize: "200px",
            color: "rgba(255,255,255,0.03)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ✿
        </div>
        <div
          style={{
            position: "absolute",
            left: "10%",
            bottom: "-20px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(196,123,150,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="max-w-7xl mx-auto"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div style={{ marginBottom: "0.5rem" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              Nuestra colección
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "42px",
              fontWeight: 300,
              color: "white",
              marginBottom: "0.5rem",
            }}
          >
            Catálogo de <em style={{ fontWeight: 400 }}>Productos</em>
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "1.5rem",
              maxWidth: "420px",
            }}
          >
            Descubre nuestra selección de cosméticos premium con ingredientes
            exclusivos.
          </p>

          {/* Search Bar — glass effect, full width */}
          <div className="relative w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, categoría, marca..."
              className="pl-12 h-12 rounded-2xl w-full"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Quick category chips */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => {
                setSelectedCategory("all");
                onClearCategory?.();
              }}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.2)",
                background:
                  selectedCategory === "all"
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                color: "rgba(255,255,255,0.8)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Todos
            </button>
            {categorias.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background:
                    selectedCategory === cat.id
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                  color: "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 shrink-0">
              <div
                className="sticky top-8"
                style={{
                  background: C.bgHeader,
                  border: `1.5px solid ${C.accent}`,
                  borderLeft: `4px solid ${C.accentDeep}`,
                  borderRadius: "20px",
                  padding: "1.5rem",
                  boxShadow: `0 8px 30px ${C.shadowSm}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "12px",
                        background: C.bgSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: C.accentDeep,
                      }}
                    >
                      <Filter className="w-4 h-4" />
                    </div>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: C.textDark,
                      }}
                    >
                      Filtros
                    </h3>
                  </div>
                  <button
                    onClick={clearFilters}
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: C.accentDeep,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                    }}
                  >
                    Limpiar
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  {/* Category Filter */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: C.textDark,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Categoría
                    </label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger
                        className="h-10 rounded-xl"
                        style={{
                          background: C.bgSoft,
                          border: `1px solid ${C.accentSoft}`,
                          color: C.textDark,
                          fontSize: "13px",
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          background: C.white,
                          border: `1px solid ${C.accentSoft}`,
                        }}
                      >
                        <SelectItem value="all">Todas</SelectItem>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: C.accentSoft }} />

                  {/* Price Range Filter */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: C.textDark,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Rango de Precio
                    </label>
                    <div className="px-1">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={150000}
                        step={5000}
                        className="w-full"
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: C.textMuted,
                        fontWeight: 500,
                      }}
                    >
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: C.textSecondary,
                  fontWeight: 500,
                }}
              >
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "producto encontrado"
                  : "productos encontrados"}
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: C.accentDeep,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "5rem 2rem",
                  background: C.bgSoft,
                  borderRadius: "24px",
                  border: `1px solid ${C.accentSoft}`,
                }}
              >
                <div style={{ fontSize: "64px", marginBottom: "1rem" }}>✿</div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "24px",
                    fontWeight: 400,
                    color: C.textDark,
                    marginBottom: "8px",
                  }}
                >
                  No se encontraron productos
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: C.textSecondary,
                    marginBottom: "1.5rem",
                  }}
                >
                  Intenta ajustar los filtros de búsqueda
                </p>
                <button
                  onClick={clearFilters}
                  style={{
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
                    color: C.white,
                    border: "none",
                    padding: "12px 32px",
                    borderRadius: "32px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "24px",
                }}
              >
                {filteredProducts.map((producto) => {
                  const categoria = categorias.find(
                    (c) => c.id === producto.categoriaId,
                  );
                  return (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                      categoryName={categoria?.nombre}
                      onCardClick={() => setSelectedProduct(producto)}
                      onAddToCart={() => {
                        addToCarrito(producto.id, 1);
                        toast.success("Producto agregado", {
                          description: `${producto.nombre} se agregó al carrito`,
                        });
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent
          className="max-w-3xl"
          style={{
            background: C.white,
            border: `1px solid ${C.accentSoft}`,
            borderRadius: "24px",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "22px",
                fontWeight: 400,
                color: C.textDark,
              }}
            >
              Detalle del Producto
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-6 py-4">
              <div
                style={{
                  aspectRatio: "1",
                  background: C.bgSoft,
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: `1px solid ${C.accentSoft}`,
                }}
              >
                {selectedProduct.imagenUrl ? (
                  <img
                    src={selectedProduct.imagenUrl}
                    alt={selectedProduct.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    style={{
                      color: C.accent,
                      opacity: 0.3,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "64px" }}>💄</div>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: C.accent,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: "6px",
                    }}
                  >
                    {
                      categorias.find(
                        (c) => c.id === selectedProduct.categoriaId,
                      )?.nombre
                    }
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "28px",
                      fontWeight: 700,
                      color: C.textDark,
                      marginBottom: "8px",
                    }}
                  >
                    {selectedProduct.nombre}
                  </h3>
                  <p
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      color: C.accentDeep,
                      marginBottom: "1rem",
                    }}
                  >
                    {formatCurrency(selectedProduct.precioVenta)}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: C.textDark,
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Descripción
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.7,
                      color: C.textSecondary,
                    }}
                  >
                    {selectedProduct.descripcion}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: "1.5rem",
                    borderTop: `1px solid ${C.accentSoft}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: C.textDark,
                      }}
                    >
                      Cantidad:
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: `1px solid ${C.accentSoft}`,
                        borderRadius: "14px",
                        overflow: "hidden",
                        height: "40px",
                      }}
                    >
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        style={{
                          padding: "0 14px",
                          height: "100%",
                          background: C.bgSoft,
                          border: "none",
                          cursor: "pointer",
                          color: C.textDark,
                          fontWeight: 600,
                          fontSize: "16px",
                          transition: "background 0.2s",
                        }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        style={{
                          width: "48px",
                          textAlign: "center",
                          background: C.white,
                          color: C.textDark,
                          border: "none",
                          borderLeft: `1px solid ${C.accentSoft}`,
                          borderRight: `1px solid ${C.accentSoft}`,
                          fontSize: "14px",
                          fontWeight: 600,
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() =>
                          setQuantity(
                            Math.min(selectedProduct.stock, quantity + 1),
                          )
                        }
                        disabled={quantity >= selectedProduct.stock}
                        style={{
                          padding: "0 14px",
                          height: "100%",
                          background: C.bgSoft,
                          border: "none",
                          cursor: "pointer",
                          color: C.textDark,
                          fontWeight: 600,
                          fontSize: "16px",
                          transition: "background 0.2s",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToCarrito(selectedProduct.id, quantity);
                      // Reset and notify
                      toast.success("Producto agregado", {
                        description: `${quantity} ${quantity === 1 ? "unidad" : "unidades"} de ${selectedProduct.nombre} agregadas al carrito`,
                      });
                      setSelectedProduct(null);
                      setQuantity(1);
                    }}
                    disabled={selectedProduct.stock === 0}
                    style={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "16px",
                      background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
                      color: C.white,
                      border: "none",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: `0 8px 20px ${C.shadowSm}`,
                      opacity: selectedProduct.stock === 0 ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedProduct.stock > 0)
                        e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
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
