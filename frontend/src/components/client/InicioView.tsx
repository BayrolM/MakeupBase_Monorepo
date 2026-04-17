import { useState, useEffect } from "react";
import { useStore } from "../../lib/store";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "../ui/carousel";
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Package,
  Truck,
  Shield,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

interface InicioViewProps {
  isPublic?: boolean;
  onNavigate?: (route: string, categoryId?: string) => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

type Section = "inicio" | "catalogo" | "nosotros" | "contacto";

// COLORS FROM OFFICIAL DESIGN
const COLORS = {
  accent: "#c47b96",
  accentDark: "#a85d77",
  accentDeep: "#7b1347",
  accentSoft: "#f0d5e0",
  bgSoft: "#fdf5f8",
  bgHeader: "#fff8fb",
  textDark: "#1a1a1a",
  textSecondary: "#4b5563",
  textMuted: "#9ca3af",
  white: "#ffffff",
};

export function InicioView({
  isPublic = false,
  onNavigate,
}: InicioViewProps = {}) {
  const {
    productos,
    categorias,
    addToCarrito,
    clientes,
    currentUser,
    pedidos,
  } = useStore();
  const [activeSection, setActiveSection] = useState<Section>("inicio");
  const [api, setApi] = useState<CarouselApi>();

  // Auto-play logic
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [api]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Carousel Data
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2687&auto=format&fit=crop",
      title: "Belleza que transforma",
      subtitle:
        "Descubre nuestra cuidada selección de cosméticos premium. Ingredientes naturales para resultados extraordinarios.",
      badge: isPublic ? "Nueva Colección 2025" : "Exclusivo para ti",
    },
    {
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=2080&auto=format&fit=crop",
      title: "Cuidado de la Piel",
      subtitle:
        "Rutinas personalizadas con las mejores marcas globales. Tu piel merece el lujo de lo natural.",
      badge: "Tendencias 2025",
    },
    {
      image:
        "https://images.unsplash.com/photo-1620916566398-39f1143bc7be?q=80&w=1974&auto=format&fit=crop",
      title: "Fragancias de Lujo",
      subtitle:
        "Encuentra el aroma que define tu esencia. Perfumería importada con sellos de autenticidad.",
      badge: "Edición Limitada",
    },
    {
      image:
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2072&auto=format&fit=crop",
      title: "Labios Irresistibles",
      subtitle:
        "Tonos vibrantes y fórmulas hidratantes. El toque final perfecto para cualquier ocasión.",
      badge: "Especial de Temporada",
    },
  ];

  // Get featured products (first 8)
  const productosDestacados = productos
    .filter((p) => p.estado === "activo" && p.stock > 0)
    .slice(0, 8);

  // Get featured categories (first 6)
  const categoriasDestacadas = categorias.slice(0, 6);

  // Get user info
  const currentCliente = clientes?.find(
    (c: any) => c.email === currentUser?.email,
  );
  const myId = currentCliente?.id || currentUser?.id;
  // Fallback to empty array if pedidos is undefined
  const myPedidos = Array.isArray(pedidos)
    ? pedidos.filter(
        (p) =>
          p.clienteId === myId &&
          p.estado !== "entregado" &&
          p.estado !== "cancelado",
      )
    : [];

  const handleAddToCart = (productoId: string) => {
    if (isPublic) {
      toast.info("Inicia sesión", {
        description: "Debes iniciar sesión para agregar productos al carrito",
      });
      return;
    }
    addToCarrito(productoId, 1);
    toast.success("Producto agregado", {
      description: "El producto se agregó a tu carrito",
    });
  };

  const beneficios = [
    {
      icon: Truck,
      title: "Envío Rápido",
      description: "Entrega en 24-48 horas en Medellín",
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "Protección total en tus pagos",
    },
    {
      icon: Package,
      title: "Devoluciones",
      description: "Hasta 30 días para devolver",
    },
    {
      icon: Heart,
      title: "Atención Personalizada",
      description: "Asesoría experta en belleza",
    },
  ];

  // Render Section Content
  const renderSectionContent = () => {
    switch (activeSection) {
      case "inicio":
        return (
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: COLORS.white,
            }}
          >
            {/* LOGGED IN SECTION */}
            {!isPublic && (
              <div
                style={{
                  background: COLORS.bgHeader,
                  borderBottom: `1px solid ${COLORS.accentSoft}`,
                  padding: 0,
                }}
              ></div>
            )}

            {/* FULLSCREEN AUTO-PLAY CAROUSEL */}
            <section
              style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                margin: 0,
                padding: 0,
                left: "50%",
                right: "50%",
                marginLeft: "-50vw",
                marginRight: "-50vw",
              }}
            >
              <Carousel
                setApi={setApi}
                opts={{
                  loop: true,
                  align: "center",
                }}
                className="w-[100vw] h-full"
                style={{ width: "100vw" }}
              >
                <CarouselContent className="ml-0 h-full">
                  {slides.map((slide, idx) => (
                    <CarouselItem key={idx} className="pl-0 basis-full">
                      <div
                        style={{
                          position: "relative",
                          width: "100vw",
                          height: "100vh",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* Fullscreen Background Image */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url(${slide.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            zIndex: 1,
                          }}
                        >
                          {/* Dark Overlay for readability */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
                              zIndex: 2,
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div
                          style={{
                            position: "relative",
                            zIndex: 3,
                            textAlign: "center",
                            color: "white",
                            maxWidth: "900px",
                            padding: "0 2rem",
                          }}
                        >
                          {/* Badge */}
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              background: "rgba(255,255,255,0.15)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "white",
                              fontSize: "14px",
                              fontWeight: 600,
                              letterSpacing: "2px",
                              textTransform: "uppercase",
                              padding: "8px 20px",
                              borderRadius: "30px",
                              marginBottom: "2rem",
                            }}
                          >
                            <Sparkles className="w-4 h-4" />
                            {slide.badge}
                          </div>

                          {/* Title */}
                          <h1
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              fontSize: "clamp(2.5rem, 6vw, 5rem)",
                              fontWeight: 300,
                              lineHeight: 1.2,
                              marginBottom: "1.5rem",
                              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                            }}
                          >
                            {slide.title}
                          </h1>

                          {/* Subtitle */}
                          <p
                            style={{
                              fontSize: "clamp(1rem, 2vw, 1.3rem)",
                              lineHeight: 1.6,
                              marginBottom: "2.5rem",
                              maxWidth: "700px",
                              margin: "0 auto 2.5rem",
                              opacity: 0.9,
                              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                            }}
                          >
                            {slide.subtitle}
                          </p>

                          {/* CTA Button */}
                          <button
                            onClick={() =>
                              onNavigate
                                ? onNavigate("catalogo")
                                : setActiveSection("catalogo")
                            }
                            style={{
                              background:
                                "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                              color: COLORS.accentDeep,
                              border: "none",
                              padding: "16px 40px",
                              borderRadius: "50px",
                              fontSize: "16px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "10px",
                              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-3px)";
                              e.currentTarget.style.boxShadow =
                                "0 15px 40px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 10px 30px rgba(0,0,0,0.2)";
                            }}
                          >
                            <ShoppingBag className="w-5 h-5" />
                            Explorar tienda
                          </button>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Progress Indicators */}
              <div
                style={{
                  position: "absolute",
                  bottom: "2rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "12px",
                  zIndex: 50,
                }}
              >
                {slides.map((_, i) => (
                  <button
                    key={i}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.width = "32px";
                      e.currentTarget.style.borderRadius = "4px";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.width = "8px";
                      e.currentTarget.style.borderRadius = "50%";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.4)";
                    }}
                  />
                ))}
              </div>
            </section>

            {/* PROMO BANNER */}
            <div
              style={{
                margin: "5rem 2rem 4rem",
                background: `linear-gradient(120deg, ${COLORS.accentDeep} 0%, ${COLORS.accent} 60%, ${COLORS.accentDark} 100%)`,
                borderRadius: "24px",
                padding: "3rem 4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "160px",
                  top: "-40px",
                  fontSize: "180px",
                  color: "rgba(255,255,255,0.06)",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                ✿
              </div>
              <div style={{ zIndex: 1 }}>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "32px",
                    fontWeight: 300,
                    color: "white",
                    marginBottom: "8px",
                  }}
                >
                  Descubre las <em style={{ fontStyle: "italic" }}>novedades</em> de la semana
                </h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
                  Nuevos productos exclusivos han llegado a nuestro catálogo.
                </p>
              </div>
              <button
                onClick={() =>
                  onNavigate
                    ? onNavigate("catalogo")
                    : setActiveSection("catalogo")
                }
                style={{
                  background: "white",
                  color: COLORS.accentDeep,
                  border: "none",
                  padding: "14px 36px",
                  borderRadius: "32px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  zIndex: 1,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {isPublic ? "Aprovechar oferta" : "Ver novedades"}
              </button>
            </div>

            {/* CATEGORÍAS */}
            <section style={{ padding: "0 2rem 5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: "2.5rem",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "36px",
                    fontWeight: 300,
                    color: COLORS.textDark,
                  }}
                >
                  Explora por{" "}
                  <span
                    style={{
                      color: COLORS.accent,
                      fontStyle: "italic",
                      fontWeight: 400,
                    }}
                  >
                    categoría
                  </span>
                </h2>
                <button
                  onClick={() =>
                    onNavigate
                      ? onNavigate("catalogo")
                      : setActiveSection("catalogo")
                  }
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: COLORS.accentDeep,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                  }}
                >
                  Ver todas →
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "20px",
                  justifyContent: "center",
                }}
              >
                {categoriasDestacadas.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() =>
                      onNavigate
                        ? onNavigate("catalogo", cat.id)
                        : setActiveSection("catalogo")
                    }
                    style={{
                      background: "white",
                      borderRadius: "20px",
                      padding: "2rem 1rem",
                      textAlign: "center",
                      border: `1px solid ${COLORS.accentSoft}`,
                      cursor: "pointer",
                      transition:
                        "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-6px)";
                      el.style.boxShadow = `0 15px 35px ${COLORS.accent}20`;
                      el.style.borderColor = COLORS.accent;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow = "none";
                      el.style.borderColor = COLORS.accentSoft;
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "16px",
                        background: COLORS.bgSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 15px",
                        color: COLORS.accentDeep,
                      }}
                    >
                      <Tag className="w-6 h-6" />
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: COLORS.textDark,
                        marginBottom: "4px",
                      }}
                    >
                      {cat.nombre}
                    </div>
                    <div style={{ fontSize: "12px", color: COLORS.textMuted }}>
                      {
                        productos.filter(
                          (p) =>
                            p.categoriaId === cat.id && p.estado === "activo",
                        ).length
                      }{" "}
                      productos
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PRODUCTOS DESTACADOS */}
            <section style={{ padding: "0 2rem 5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: "2.5rem",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "36px",
                    fontWeight: 300,
                    color: COLORS.textDark,
                  }}
                >
                  Nuestros{" "}
                  <span
                    style={{
                      color: COLORS.accent,
                      fontStyle: "italic",
                      fontWeight: 400,
                    }}
                  >
                    más amados
                  </span>
                </h2>
                <button
                  onClick={() =>
                    onNavigate
                      ? onNavigate("catalogo")
                      : setActiveSection("catalogo")
                  }
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: COLORS.accentDeep,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                  }}
                >
                  Ver todos →
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "24px",
                }}
              >
                {productosDestacados.map((producto, index) => {
                  const categoria = categorias.find(
                    (c) => c.id === producto.categoriaId,
                  );
                  return (
                    <div
                      key={producto.id}
                      style={{
                        background: "white",
                        borderRadius: "24px",
                        border: "1px solid rgba(0,0,0,0.08)",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition:
                          "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
                        position: "relative",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.transform = "translateY(-12px)";
                        el.style.boxShadow = `0 30px 60px ${COLORS.accent}20`;
                        el.style.borderColor = COLORS.accentSoft;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)";
                        el.style.borderColor = "rgba(0,0,0,0.08)";
                      }}
                    >
                      {index === 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "15px",
                            left: "15px",
                            background: COLORS.accentDeep,
                            color: "white",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "4px 12px",
                            borderRadius: "20px",
                            zIndex: 1,
                            letterSpacing: "0.5px",
                          }}
                        >
                          MÁS VENDIDO
                        </div>
                      )}
                      {index === 1 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "15px",
                            left: "15px",
                            background: COLORS.accent,
                            color: "white",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "4px 12px",
                            borderRadius: "20px",
                            zIndex: 1,
                            letterSpacing: "0.5px",
                          }}
                        >
                          NUEVO
                        </div>
                      )}

                      <div
                        style={{
                          width: "100%",
                          height: "220px",
                          background: COLORS.bgSoft,
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
                                color: COLORS.accent,
                                opacity: 0.3,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div style={{ padding: "1.5rem" }}>
                        <div
                          style={{
                            fontSize: "10px",
                            color: COLORS.textMuted,
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            marginBottom: "6px",
                            fontWeight: 700,
                          }}
                        >
                          {categoria?.nombre || "BELLEZA"}
                        </div>
                        <h4
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "20px",
                            fontWeight: 700,
                            color: COLORS.textDark,
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
                              color: COLORS.textMuted,
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
                              color: COLORS.accentDeep,
                            }}
                          >
                            {formatCurrency(producto.precioVenta)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(producto.id);
                            }}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDeep} 100%)`,
                              color: "white",
                              border: "none",
                              fontSize: "24px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "transform 0.2s",
                              boxShadow: `0 5px 15px ${COLORS.accent}40`,
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* BENEFICIOS */}
            <section
              style={{
                background: COLORS.bgHeader,
                borderTop: `1px solid ${COLORS.accentSoft}`,
                borderBottom: `1px solid ${COLORS.accentSoft}`,
                padding: "4rem 2rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "3rem",
                  maxWidth: "1100px",
                  margin: "0 auto",
                }}
              >
                {beneficios.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "22px",
                        background: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1rem",
                        color: COLORS.accentDeep,
                        boxShadow: `0 8px 20px ${COLORS.accent}10`,
                      }}
                    >
                      <b.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: COLORS.textDark,
                          marginBottom: "6px",
                        }}
                      >
                        {b.title}
                      </h4>
                      <p
                        style={{
                          fontSize: "13px",
                          color: COLORS.textSecondary,
                          lineHeight: 1.5,
                        }}
                      >
                        {b.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* TESTIMONIOS */}
            <section style={{ padding: "5rem 2rem" }}>
              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "42px",
                    fontWeight: 300,
                    color: COLORS.textDark,
                  }}
                >
                  Lo que dicen nuestras{" "}
                  <span
                    style={{
                      color: COLORS.accent,
                      fontStyle: "italic",
                      fontWeight: 400,
                    }}
                  >
                    clientas
                  </span>
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "24px",
                  maxWidth: "1200px",
                  margin: "0 auto",
                }}
              >
                {[
                  {
                    initials: "MP",
                    name: "María Paula",
                    color: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDeep})`,
                    text: '"Los productos son increíbles. El nivel de atención y la calidad superaron mis expectativas. En 3 semanas noté diferencia real en mi piel."',
                  },
                  {
                    initials: "VS",
                    name: "Valentina S.",
                    color: `linear-gradient(135deg, ${COLORS.accentDark}, ${COLORS.accent})`,
                    text: '"Llevo 2 años comprando aquí. El envío es rapidísimo y el empaque es toda una experiencia de lujo. Mi marca favorita sin duda."',
                  },
                  {
                    initials: "LG",
                    name: "Laura G.",
                    color: `linear-gradient(135deg, ${COLORS.accentDeep}, ${COLORS.accentDark})`,
                    text: '"Asesoría experta que realmente entiende lo que tu piel necesita. Productos originales y de altísima calidad. ¡Totalmente recomendado!"',
                  },
                ].map((t) => (
                  <div
                    key={t.name}
                    style={{
                      background: "white",
                      border: `1px solid ${COLORS.accentSoft}`,
                      borderRadius: "24px",
                      padding: "2rem",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        marginBottom: "1.2rem",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: t.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        {t.initials}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: COLORS.textDark,
                          }}
                        >
                          {t.name}
                        </div>
                        <div style={{ color: "#f59e0b", fontSize: "12px" }}>
                          ★★★★★
                        </div>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: COLORS.textSecondary,
                        lineHeight: 1.7,
                        fontStyle: "italic",
                      }}
                    >
                      {t.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FOOTER */}
            <footer
              style={{
                background: COLORS.textDark,
                color: "rgba(255,255,255,0.6)",
                padding: "3rem 2rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "24px",
                  color: "white",
                  letterSpacing: "4px",
                  marginBottom: "1rem",
                }}
              >
                GLAMOUR ML
              </div>
              <p style={{ fontSize: "12px", letterSpacing: "1px" }}>
                © 2026 Belleza & Cuidado Personal. Todos los derechos
                reservados.
              </p>
            </footer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      {renderSectionContent()}
    </div>
  );
}
