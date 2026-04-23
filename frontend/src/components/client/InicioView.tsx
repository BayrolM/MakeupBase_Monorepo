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
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "./ProductCard";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { marcaService } from "../../services/marcaService";

interface InicioViewProps {
  isPublic?: boolean;
  onNavigate?: (route: string, categoryId?: string) => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

type Section = "inicio" | "catalogo" | "nosotros" | "contacto";

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

export function InicioView({
  isPublic = false,
  onNavigate,
}: InicioViewProps = {}) {
  const { productos, categorias, addToCarrito, setProductos, setCategorias, setMarcas } = useStore();
  const [activeSection, setActiveSection] = useState<Section>("inicio");
  const [api, setApi] = useState<CarouselApi>();
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Cargar datos si el store está vacío
  useEffect(() => {
    const loadDataIfNeeded = async () => {
      setIsLoadingData(true);
      try {
        const [catsRes, brandsRes, prodsRes] = await Promise.all([
          categoryService.getAll({ limit: 100 }),
          marcaService.getAll(),
          productService.getAll({ limit: 100 }),
        ]);

        const mappedCats = catsRes.data.map((cat: any) => ({
          id: cat.id_categoria.toString(),
          nombre: cat.nombre,
          descripcion: cat.descripcion || "",
          estado: cat.estado ? "activo" : "inactivo",
        }));
        setCategorias(mappedCats);

        const mappedBrands = brandsRes.map((brand: any) => ({
          id: brand.id_marca.toString(),
          nombre: brand.nombre,
          descripcion: brand.descripcion || "",
          estado: brand.estado ? "activo" : "inactivo",
        }));
        setMarcas(mappedBrands);

        const mappedProds = prodsRes.data.map((prod: any) => ({
          id: prod.id_producto.toString(),
          nombre: prod.nombre,
          descripcion: prod.descripcion || "",
          categoriaId: prod.id_categoria.toString(),
          marca: prod.nombre_marca || "Genérica",
          precioCompra: Number(prod.costo_promedio) || 0,
          precioVenta: Number(prod.precio_venta) || 0,
          stock: prod.stock_actual || 0,
          stockMinimo: prod.stock_min || 0,
          stockMaximo: prod.stock_max || 100,
          imagenUrl: prod.imagen_url || undefined,
          estado: prod.estado ? "activo" : "inactivo",
          fechaCreacion: new Date().toISOString(),
        }));
        setProductos(mappedProds);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    // Solo cargar si no hay datos disponibles
    if (productos.length === 0 || categorias.length === 0) {
      loadDataIfNeeded();
    }
  }, [productos.length, categorias.length]);

  // Auto-play logic
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [api]);

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
        "https://www.shutterstock.com/image-photo/professional-decorative-cosmetics-makeup-products-260nw-1990650542.jpg",
      title: "Cuidado de la Piel",
      subtitle:
        "Rutinas personalizadas con las mejores marcas globales. Tu piel merece el lujo de lo natural.",
      badge: "Tendencias 2025",
    },
    {
      image:
        "https://img.freepik.com/vector-gratis/banner-venta-belleza-realista-oferta_52683-94987.jpg?semt=ais_hybrid&w=740&q=80",
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
              background: C.white,
            }}
          >
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
                              color: C.accentDeep,
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

                {/* Carousel Navigation Controls (Previous / Next) */}
                <div className="hidden md:block">
                  <CarouselPrevious className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 border-white/20 bg-black/20 hover:bg-white/20 hover:text-white text-white h-14 w-14 rounded-2xl backdrop-blur-md transition-all shadow-xl z-50" />
                  <CarouselNext className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 border-white/20 bg-black/20 hover:bg-white/20 hover:text-white text-white h-14 w-14 rounded-2xl backdrop-blur-md transition-all shadow-xl z-50" />
                </div>
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
                    onClick={() => api?.scrollTo(i)}
                    aria-label={`Ir a la imagen ${i + 1}`}
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
                background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accent} 60%, ${C.accentDark} 100%)`,
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
                  Descubre las{" "}
                  <em style={{ fontStyle: "italic" }}>novedades</em> de la
                  semana
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
                  color: C.accentDeep,
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
                    color: C.textDark,
                  }}
                >
                  Explora por{" "}
                  <span
                    style={{
                      color: C.accent,
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
                    color: C.accentDeep,
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
                    className="category-card"
                    style={{
                      background: "white",
                      borderRadius: "20px",
                      padding: "2rem 1rem",
                      textAlign: "center",
                      border: `1px solid ${C.accent}`,
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="cat-icon-box"
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "16px",
                        background: C.bgSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 15px",
                        color: C.accentDeep,
                      }}
                    >
                      <Tag className="w-6 h-6" />
                    </div>
                    <div
                      className="cat-title"
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: C.textDark,
                        marginBottom: "4px",
                      }}
                    >
                      {cat.nombre}
                    </div>
                    <div
                      className="cat-subtitle"
                      style={{ fontSize: "12px", color: C.textMuted }}
                    >
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
                    color: C.textDark,
                  }}
                >
                  Nuestros{" "}
                  <span
                    style={{
                      color: C.accent,
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
                    color: C.accentDeep,
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
                  const badges = [
                    { label: "MÁS VENDIDO", color: C.accentDeep },
                    { label: "NUEVO", color: C.accent },
                  ];
                  return (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                      categoryName={categoria?.nombre}
                      badge={badges[index]?.label}
                      badgeColor={badges[index]?.color}
                      onAddToCart={() => handleAddToCart(producto.id)}
                    />
                  );
                })}
              </div>
            </section>

            {/* BENEFICIOS */}
            <section
              style={{
                background: C.bgHeader,
                borderTop: `1px solid ${C.accentSoft}`,
                borderBottom: `1px solid ${C.accentSoft}`,
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
                        color: C.accentDeep,
                        boxShadow: `0 8px 20px ${C.shadowXs}`,
                      }}
                    >
                      <b.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: C.textDark,
                          marginBottom: "6px",
                        }}
                      >
                        {b.title}
                      </h4>
                      <p
                        style={{
                          fontSize: "13px",
                          color: C.textSecondary,
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
                    color: C.textDark,
                  }}
                >
                  Lo que dicen nuestras{" "}
                  <span
                    style={{
                      color: C.accent,
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
                    color: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
                    text: '"Los productos son increíbles. El nivel de atención y la calidad superaron mis expectativas. En 3 semanas noté diferencia real en mi piel."',
                  },
                  {
                    initials: "VS",
                    name: "Valentina S.",
                    color: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
                    text: '"Llevo 2 años comprando aquí. El envío es rapidísimo y el empaque es toda una experiencia de lujo. Mi marca favorita sin duda."',
                  },
                  {
                    initials: "LG",
                    name: "Laura G.",
                    color: `linear-gradient(135deg, ${C.accentDeep}, ${C.accentDark})`,
                    text: '"Asesoría experta que realmente entiende lo que tu piel necesita. Productos originales y de altísima calidad. ¡Totalmente recomendado!"',
                  },
                ].map((t) => (
                  <div
                    key={t.name}
                    style={{
                      background: "white",
                      border: `1px solid ${C.accent}`,
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
                            color: C.textDark,
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
                        color: C.textSecondary,
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

            {/* FOOTER — Inspired by Moon Travel style */}
            <footer
              style={{ backgroundColor: "#1a0a14" }}
              className="text-white"
            >
              {/* Top accent gradient line */}
              <div
                style={{
                  height: "3px",
                  background:
                    "linear-gradient(90deg, #c47b96 0%, #e092b2 40%, #a85d77 70%, #7b1347 100%)",
                }}
              />

              {/* Main Footer Content */}
              <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
                  {/* Column 1: Brand + Description */}
                  <div className="space-y-4">
                    <img
                      src="/logo.png"
                      alt="Glamour ML"
                      className="h-16 w-auto object-contain"
                      style={{
                        filter: "drop-shadow(0 2px 8px rgba(196,123,150,0.25))",
                      }}
                    />
                    <p className="text-white/60 text-[13px] leading-relaxed italic max-w-[240px]">
                      Elevando tu rutina de belleza con productos de alta gama y
                      fórmulas exclusivas.
                    </p>
                  </div>

                  {/* Column 2: Contacto */}
                  <div>
                    <h4
                      className="font-semibold mb-5 tracking-wider"
                      style={{ fontSize: "15px", color: "white" }}
                    >
                      Contacto
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#c47b96] flex-shrink-0" />
                        <span className="text-white/70 text-[13px]">
                          Medellín, Colombia
                        </span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-[#c47b96] flex-shrink-0" />
                        <span className="text-white/70 text-[13px]">
                          WhatsApp: +57 300 123 4567
                        </span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#c47b96] flex-shrink-0" />
                        <span className="text-white/70 text-[13px]">
                          hola@glamourml.com
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Información Legal */}
                  <div>
                    <h4
                      className="font-semibold mb-5 tracking-wider"
                      style={{ fontSize: "15px", color: "white" }}
                    >
                      Información Legal
                    </h4>
                    <ul className="space-y-3">
                      <li>
                        <a
                          href="#"
                          className="text-white/70 hover:text-[#c47b96] transition-colors text-[13px]"
                        >
                          Políticas de Envío
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white/70 hover:text-[#c47b96] transition-colors text-[13px]"
                        >
                          Cambios y Devoluciones
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white/70 hover:text-[#c47b96] transition-colors text-[13px]"
                        >
                          Preguntas Frecuentes
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white/70 hover:text-[#c47b96] transition-colors text-[13px]"
                        >
                          Términos y Condiciones
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* Column 4: Síguenos */}
                  <div>
                    <h4
                      className="font-semibold mb-5 tracking-wider"
                      style={{ fontSize: "15px", color: "white" }}
                    >
                      Síguenos
                    </h4>
                    <div className="flex gap-3">
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
                        style={{ backgroundColor: "rgba(196,123,150,0.2)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#c47b96")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(196,123,150,0.2)")
                        }
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
                        style={{ backgroundColor: "rgba(196,123,150,0.2)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#c47b96")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(196,123,150,0.2)")
                        }
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
                        style={{ backgroundColor: "rgba(196,123,150,0.2)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#c47b96")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(196,123,150,0.2)")
                        }
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bar — centered, like Moon Travel */}
              <div
                style={{
                  borderTop: "1px solid rgba(196,123,150,0.15)",
                  backgroundColor: "#140810",
                }}
              >
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 text-center space-y-2">
                  <p className="text-white/50 text-[11px] tracking-wider">
                    © {new Date().getFullYear()} Glamour ML. Todos los derechos
                    reservados.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      {isLoadingData ? (
        <div style={{ 
          minHeight: "100vh", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <div style={{ textAlign: "center" }}>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p style={{ color: C.textMuted }}>Cargando productos...</p>
          </div>
        </div>
      ) : (
        renderSectionContent()
      )}
    </div>
  );
}
