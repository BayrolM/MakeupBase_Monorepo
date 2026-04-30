import { Package, Heart } from "lucide-react";

const V = (name: string) => `var(--luxury-${name})`;
const C = {
  accent: V("pink-soft"),
  accentDark: V("accent-dark"),
  accentDeep: V("pink"),
  accentSoft: V("accent-soft"),
  bgSoft: V("bg-soft"),
  textDark: V("text-dark"),
  textMuted: V("text-muted"),
  white: "#ffffff",
  shadow: V("shadow"),
  shadowSm: V("shadow-sm"),
  shadowLg: V("shadow-lg"),
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

interface ProductCardProps {
  producto: any;
  categoryName?: string;
  badge?: string;
  badgeColor?: string;
  onCardClick?: () => void;
  onAddToCart?: (e: React.MouseEvent) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export function ProductCard({
  producto,
  categoryName,
  badge,
  badgeColor,
  onCardClick,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}: ProductCardProps) {
  return (
    <div
      onClick={onCardClick}
      style={{
        background: C.white,
        borderRadius: "20px",
        overflow: "hidden",
        border: `1px solid ${C.accent}`,
        cursor: onCardClick ? "pointer" : "default",
        transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
        position: "relative",
        boxShadow: `0 4px 20px ${C.shadow}`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-10px)";
        el.style.boxShadow = `0 25px 50px ${C.shadowSm}`;
        el.style.borderColor = C.accentDeep;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = `0 4px 20px ${C.shadow}`;
        el.style.borderColor = C.accent;
      }}
    >
      {/* Badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: "15px",
            left: "15px",
            background: badgeColor || C.accentDeep,
            color: "white",
            fontSize: "10px",
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: "20px",
            zIndex: 1,
            letterSpacing: "0.5px",
          }}
        >
          {badge}
        </div>
      )}

      {/* Stock badge */}
      {!badge &&
        producto.stock <= producto.stockMinimo &&
        producto.stock > 0 && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: C.accentDeep,
              color: "white",
              fontSize: "10px",
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: "20px",
              zIndex: 1,
              letterSpacing: "0.5px",
            }}
          >
            ÚLTIMAS UNIDADES
          </div>
        )}

      {/* Product Image */}
      <div
        style={{
          width: "100%",
          height: "220px",
          background: C.bgSoft,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {producto.imagenUrl ? (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package
              style={{
                width: 64,
                height: 64,
                color: C.accent,
                opacity: 0.3,
              }}
            />
          </div>
        )}

        {/* Favorite Button (Top Right) */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.9)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              zIndex: 2,
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Heart
              style={{
                width: 18,
                height: 18,
                color: isFavorite ? C.accentDeep : C.textMuted,
                fill: isFavorite ? C.accentDeep : "none",
                transition: "all 0.2s",
              }}
            />
          </button>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: "1.5rem" }}>
        <div
          style={{
            fontSize: "10px",
            color: C.textMuted,
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "6px",
            fontWeight: 700,
          }}
        >
          {categoryName || "BELLEZA"}
        </div>
        <h4
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "20px",
            fontWeight: 700,
            color: C.textDark,
            marginBottom: "8px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {producto.nombre}
        </h4>
        <div
          style={{
            color: "#f59e0b",
            fontSize: "12px",
            marginBottom: "15px",
          }}
        >
          ★★★★★{" "}
          <span
            style={{
              color: C.textMuted,
              marginLeft: "6px",
            }}
          >
            4.8
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: C.accentDeep,
            }}
          >
            {formatCurrency(producto.precioVenta)}
          </span>
          {onAddToCart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(e);
              }}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
                color: "white",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s",
                boxShadow: `0 5px 15px ${C.shadowLg}`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
