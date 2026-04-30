import { useState } from "react";
import { useStore } from "../../lib/store";
import { ProductCard } from "./ProductCard";
import { Dialog, DialogContent } from "../ui/dialog";
import { Heart, Package } from "lucide-react";
import { toast } from "sonner";

/* ── Luxury CSS variable helpers ── */
const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgHeader: V("bg-header"),
  bgSoft: V("bg-soft"),
  accent: V("pink-soft"),
  accentDeep: V("pink"),
  textDark: V("text-dark"),
  textMuted: V("text-muted"),
  shadowSm: V("shadow-sm"),
  shadow: V("shadow"),
  shadowLg: V("shadow-lg"),
  white: "#ffffff",
};

export function FavoritosView({
  onNavigate,
}: { onNavigate?: (route: string) => void } = {}) {
  const { favoritos, toggleFavorito, addToCarrito, productos, categorias } =
    useStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const favoritosProducts = productos.filter((p) => favoritos.includes(p.id));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSoft,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── HERO HEADER LUXURY ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
          padding: "40px 0",
          position: "relative",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 32px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart
                style={{ width: 24, height: 24, color: C.white, fill: C.white }}
              />
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "42px",
                fontWeight: 600,
                color: C.white,
                margin: 0,
              }}
            >
              Mis Favoritos
            </h1>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "16px",
              margin: "0 0 0 64px",
            }}
          >
            {favoritosProducts.length}{" "}
            {favoritosProducts.length === 1
              ? "producto guardado"
              : "productos guardados"}
          </p>
        </div>

        {/* Decoración */}
        <div
          style={{
            position: "absolute",
            right: "5%",
            top: "-20%",
            fontSize: "150px",
            opacity: 0.05,
            transform: "rotate(15deg)",
            pointerEvents: "none",
          }}
        >
          ✿
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "24px 32px 64px 32px",
        }}
      >
        {favoritosProducts.length === 0 ? (
          <div
            style={{
              background: C.white,
              borderRadius: "24px",
              padding: "64px 32px",
              textAlign: "center",
              boxShadow: `0 10px 40px ${C.shadowSm}`,
              border: `1px solid ${C.accent}`,
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: C.bgSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto",
              }}
            >
              <Heart
                style={{
                  width: 32,
                  height: 32,
                  color: C.accentDeep,
                  opacity: 0.5,
                }}
              />
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: C.textDark,
                marginBottom: "12px",
              }}
            >
              Tu lista de deseos está vacía
            </h3>
            <p
              style={{
                color: C.textMuted,
                fontSize: "16px",
                marginBottom: "32px",
              }}
            >
              Explora nuestro catálogo y guarda los productos que más te gusten
              para tenerlos siempre a la mano.
            </p>
            <button
              onClick={() => onNavigate?.("catalogo")}
              style={{
                background: `linear-gradient(135deg, ${C.accentDeep} 0%, #a85d77 100%)`,
                color: C.white,
                border: "none",
                padding: "14px 32px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: `0 8px 24px ${C.shadowSm}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 12px 30px ${C.shadow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${C.shadowSm}`;
              }}
            >
              Explorar Catálogo
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
            {favoritosProducts.map((producto) => {
              const categoria = categorias.find(
                (c) => c.id === producto.categoriaId,
              );
              return (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  categoryName={categoria?.nombre}
                  isFavorite={true} // Por estar en esta vista, siempre es favorito
                  onToggleFavorite={() => {
                    toggleFavorito(producto.id);
                    toast.success("Favoritos actualizado", {
                      description: `Se eliminó ${producto.nombre} de tu lista.`,
                    });
                  }}
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

      {/* ── DIALOG DETAIL (Estilo Luxury) ── */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent
          style={{
            background: C.white,
            border: `1px solid ${C.accent}`,
            borderRadius: "24px",
            maxWidth: "800px",
            padding: 0,
            overflow: "hidden",
          }}
        >
          {selectedProduct && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              className="md:flex-row"
            >
              {/* Imagen (Mitad izquierda) */}
              <div
                style={{
                  flex: 1,
                  background: C.bgSoft,
                  minHeight: "400px",
                  position: "relative",
                }}
              >
                {selectedProduct.imagenUrl ? (
                  <img
                    src={selectedProduct.imagenUrl}
                    alt={selectedProduct.nombre}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <Package
                      style={{
                        width: 80,
                        height: 80,
                        color: C.accent,
                        opacity: 0.3,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Info (Mitad derecha) */}
              <div
                style={{
                  flex: 1,
                  padding: "40px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: C.accentDeep,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  {categorias.find((c) => c.id === selectedProduct.categoriaId)
                    ?.nombre || "BELLEZA"}
                </p>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "32px",
                    fontWeight: 600,
                    color: C.textDark,
                    marginBottom: "16px",
                    lineHeight: 1.2,
                  }}
                >
                  {selectedProduct.nombre}
                </h3>
                <p
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: C.textDark,
                    marginBottom: "24px",
                  }}
                >
                  {formatCurrency(selectedProduct.precioVenta)}
                </p>

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: C.textDark,
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Descripción
                  </p>
                  <p
                    style={{
                      fontSize: "15px",
                      color: C.textMuted,
                      lineHeight: 1.6,
                      marginBottom: "24px",
                    }}
                  >
                    {selectedProduct.descripcion}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: "24px",
                    borderTop: `1px dashed ${C.accent}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
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
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background:
                          selectedProduct.stock > 0 ? "#10b981" : "#ef4444",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color: C.textMuted,
                        fontWeight: 500,
                      }}
                    >
                      {selectedProduct.stock > 0
                        ? `${selectedProduct.stock} unidades disp.`
                        : "Agotado"}
                    </span>
                  </div>

                  <button
                    disabled={selectedProduct.stock === 0}
                    onClick={() => {
                      addToCarrito(selectedProduct.id, 1);
                      toast.success("Producto agregado", {
                        description: `${selectedProduct.nombre} se agregó al carrito`,
                      });
                      setSelectedProduct(null);
                    }}
                    style={{
                      background:
                        selectedProduct.stock > 0
                          ? `linear-gradient(135deg, ${C.accentDeep} 0%, #a85d77 100%)`
                          : "#e5e7eb",
                      color: selectedProduct.stock > 0 ? C.white : "#9ca3af",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor:
                        selectedProduct.stock > 0 ? "pointer" : "not-allowed",
                      boxShadow:
                        selectedProduct.stock > 0
                          ? `0 8px 20px ${C.shadowSm}`
                          : "none",
                    }}
                  >
                    Agregar al carrito
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
