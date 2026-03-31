import { useState } from 'react';
import { useStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  Star, 
  TrendingUp, 
  Package, 
  Truck, 
  Shield, 
  Mail,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  ChevronRight,
  Check,
  LogIn,
  UserPlus,
  Target,
  Eye,
  Award,
  Droplets,
  FlaskConical,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '../ThemeToggle';

interface InicioViewProps {
  isPublic?: boolean;
  onNavigate?: (route: string, categoryId?: string) => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

type Section = 'inicio' | 'catalogo' | 'nosotros' | 'contacto';

// GLAMOUR ML - Landing Page / Vista de Inicio para Clientes
export function InicioView({ 
  isPublic = false, 
  onNavigate,
  onNavigateToLogin, 
  onNavigateToRegister 
}: InicioViewProps = {}) {
  const { productos, categorias, addToCarrito } = useStore();
  const [activeSection, setActiveSection] = useState<Section>('inicio');
  const [contactForm, setContactForm] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Get featured products (first 8)
  const productosDestacados = productos.filter(p => p.estado === 'activo' && p.stock > 0).slice(0, 8);

  // Get all active products for catalog
  const productosActivos = productos.filter(p => p.estado === 'activo' && p.stock > 0);

  // Get featured categories (first 6)
  const categoriasDestacadas = categorias.slice(0, 6);

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.nombre || !contactForm.email || !contactForm.mensaje) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast.error('Email inválido', {
        description: 'Por favor ingresa un email válido',
      });
      return;
    }

    toast.success('¡Mensaje enviado!', {
      description: 'Nos pondremos en contacto contigo pronto',
    });
    setContactForm({
      nombre: '',
      email: '',
      mensaje: ''
    });
  };

  const handleAddToCart = (productoId: string) => {
    if (isPublic) {
      toast.info('Inicia sesión', {
        description: 'Debes iniciar sesión para agregar productos al carrito',
      });
      return;
    }
    addToCarrito(productoId, 1);
    toast.success('Producto agregado', {
      description: 'El producto se agregó a tu carrito',
    });
  };

  const beneficios = [
    {
      icon: Truck,
      title: 'Envío Rápido',
      description: 'Entrega en 24-48 horas en Medellín',
    },
    {
      icon: Shield,
      title: 'Compra Segura',
      description: 'Protección total en tus pagos',
    },
    {
      icon: Package,
      title: 'Devoluciones',
      description: 'Hasta 30 días para devolver',
    },
    {
      icon: Heart,
      title: 'Atención Personalizada',
      description: 'Asesoría experta en belleza',
    },
  ];

  // Render Section Content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <>
            {/* HERO SECTION */}
            <section className="relative overflow-hidden border-b border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary-light/5 to-transparent"></div>
              <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Left Content */}
                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-primary" style={{ fontSize: '14px', fontWeight: 500 }}>
                        Belleza y Elegancia en Medellín
                      </span>
                    </div>

                    <h1 className="text-foreground" style={{ fontSize: '56px', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                      Realza tu belleza
                      <span className="block text-primary mt-2">con estilo único</span>
                    </h1>

                    <p className="text-foreground-secondary max-w-xl" style={{ fontSize: '18px', lineHeight: 1.7 }}>
                      Descubre productos de alta calidad seleccionados especialmente para ti. 
                      Maquillaje, cuidado de la piel y accesorios que realzan tu belleza natural.
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <Button 
                        size="lg" 
                        onClick={() => onNavigate ? onNavigate('catalogo') : setActiveSection('catalogo')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base gap-2"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Comprar Ahora
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => onNavigate ? onNavigate('catalogo') : setActiveSection('catalogo')}
                        className="border-border hover:bg-surface px-8 py-6 text-base gap-2"
                      >
                        Ver Catálogo
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-8 pt-4">
                      <div>
                        <div className="text-foreground" style={{ fontSize: '32px', fontWeight: 600 }}>
                          200+
                        </div>
                        <div className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                          Productos
                        </div>
                      </div>
                      <div>
                        <div className="text-foreground" style={{ fontSize: '32px', fontWeight: 600 }}>
                          1K+
                        </div>
                        <div className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                          Clientes Felices
                        </div>
                      </div>
                      <div>
                        <div className="text-foreground" style={{ fontSize: '32px', fontWeight: 600 }}>
                          98%
                        </div>
                        <div className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                          Seguridad
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Image */}
                  <div className="relative">
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-border shadow-2xl">
                      <img
                        src="/images/hero.png"
                        alt="Hero"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* BENEFICIOS */}
            <section className="bg-surface py-12 border-b border-border">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {beneficios.map((beneficio, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <beneficio.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-foreground mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                          {beneficio.title}
                        </h3>
                        <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                          {beneficio.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CATEGORÍAS DESTACADAS */}
            <section className="py-20 border-b border-border">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="text-primary" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Explora por Categoría
                    </span>
                  </div>
                  <h2 className="text-foreground mb-4" style={{ fontSize: '40px', fontWeight: 600, lineHeight: 1.2 }}>
                    Encuentra lo que buscas
                  </h2>
                  <p className="text-foreground-secondary" style={{ fontSize: '16px', lineHeight: 1.6 }}>
                    Navega por nuestras categorías y descubre productos perfectos para ti
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoriasDestacadas.map((categoria) => (
                    <div
                      key={categoria.id}
                      onClick={() => onNavigate ? onNavigate('catalogo', categoria.id) : setActiveSection('catalogo')}
                      className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                      
                      <div className="relative">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          {(() => {
                            const nombre = categoria.nombre?.toLowerCase() || '';
                            if (nombre.includes('maquillaje')) return <Sparkles className="w-8 h-8 text-primary" />;
                            if (nombre.includes('facial') || nombre.includes('cuidado')) return <Droplets className="w-8 h-8 text-primary" />;
                            if (nombre.includes('prueba') || nombre.includes('test')) return <FlaskConical className="w-8 h-8 text-primary" />;
                            return <Tag className="w-8 h-8 text-primary" />;
                          })()}
                        </div>

                        <h3 className="text-foreground mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
                          {categoria.nombre}
                        </h3>

                        <p className="text-foreground-secondary mb-4" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                          {categoria.descripcion || 'Descubre productos increíbles en esta categoría'}
                        </p>

                        <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>Ver productos</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* PRODUCTOS DESTACADOS */}
            <section className="py-20 bg-surface">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-primary" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Lo Más Popular
                    </span>
                  </div>
                  <h2 className="text-foreground mb-4" style={{ fontSize: '40px', fontWeight: 600, lineHeight: 1.2 }}>
                    Productos destacados
                  </h2>
                  <p className="text-foreground-secondary" style={{ fontSize: '16px', lineHeight: 1.6 }}>
                    Los productos favoritos de nuestras clientas
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {productosDestacados.map((producto, index) => {
                    const categoria = categorias.find(c => c.id === producto.categoriaId);
                    const isNew = index < 2;
                    const hasDiscount = index === 3;

                    return (
                      <div
                        key={producto.id}
                        className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-square bg-surface overflow-hidden">
                          {producto.imagenUrl ? (
                            <img
                              src={producto.imagenUrl}
                              alt={producto.nombre}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-light/10">
                              <Package className="w-20 h-20 text-primary/30" />
                            </div>
                          )}

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {isNew && (
                              <Badge className="bg-primary text-primary-foreground border-0">
                                Nuevo
                              </Badge>
                            )}
                            {hasDiscount && (
                              <Badge className="bg-danger text-white border-0">
                                -20%
                              </Badge>
                            )}
                          </div>

                          {/* Favorite Button */}
                          <button className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card">
                            <Heart className="w-5 h-5 text-foreground-secondary hover:text-primary transition-colors" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <div className="mb-2">
                            <span className="text-primary" style={{ fontSize: '12px', fontWeight: 500 }}>
                              {categoria?.nombre || 'Sin categoría'}
                            </span>
                          </div>

                          <h3 className="text-foreground mb-2 line-clamp-2" style={{ fontSize: '16px', fontWeight: 600 }}>
                            {producto.nombre}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < 4 ? 'text-warning fill-warning' : 'text-foreground-secondary/30'}`}
                              />
                            ))}
                            <span className="text-foreground-secondary ml-1" style={{ fontSize: '12px' }}>
                              (4.5)
                            </span>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div>
                              {hasDiscount ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-foreground" style={{ fontSize: '20px', fontWeight: 600 }}>
                                    {formatCurrency(producto.precioVenta * 0.8)}
                                  </span>
                                  <span className="text-foreground-secondary line-through" style={{ fontSize: '14px' }}>
                                    {formatCurrency(producto.precioVenta)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-foreground" style={{ fontSize: '20px', fontWeight: 600 }}>
                                  {formatCurrency(producto.precioVenta)}
                                </span>
                              )}
                            </div>
                          </div>

                          <Button 
                            onClick={() => handleAddToCart(producto.id)}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-12">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => onNavigate ? onNavigate('catalogo') : setActiveSection('catalogo')}
                    className="border-border hover:bg-card px-8 gap-2"
                  >
                    Ver Todos los Productos
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </section>
          </>
        );

      case 'catalogo':
        return (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <span className="text-primary" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Catálogo Completo
                  </span>
                </div>
                <h2 className="text-foreground mb-4" style={{ fontSize: '40px', fontWeight: 600, lineHeight: 1.2 }}>
                  Todos nuestros productos
                </h2>
                <p className="text-foreground-secondary" style={{ fontSize: '16px', lineHeight: 1.6 }}>
                  Explora nuestra colección completa de productos de belleza
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productosActivos.map((producto) => {
                  const categoria = categorias.find(c => c.id === producto.categoriaId);

                  return (
                    <div
                      key={producto.id}
                      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-square bg-surface overflow-hidden">
                        {producto.imagenUrl ? (
                          <img
                            src={producto.imagenUrl}
                            alt={producto.nombre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-light/10">
                            <Package className="w-20 h-20 text-primary/30" />
                          </div>
                        )}

                        {/* Stock Badge */}
                        {producto.stock <= producto.stockMinimo && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-warning text-white border-0">
                              Pocas unidades
                            </Badge>
                          </div>
                        )}

                        {/* Favorite Button */}
                        <button className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card">
                          <Heart className="w-5 h-5 text-foreground-secondary hover:text-primary transition-colors" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="mb-2">
                          <span className="text-primary" style={{ fontSize: '12px', fontWeight: 500 }}>
                            {categoria?.nombre || 'Sin categoría'}
                          </span>
                        </div>

                        <h3 className="text-foreground mb-2 line-clamp-2" style={{ fontSize: '16px', fontWeight: 600 }}>
                          {producto.nombre}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < 4 ? 'text-warning fill-warning' : 'text-foreground-secondary/30'}`}
                            />
                          ))}
                          <span className="text-foreground-secondary ml-1" style={{ fontSize: '12px' }}>
                            (4.0)
                          </span>
                        </div>

                        <div className="mb-2">
                          <span className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                            Stock: {producto.stock} unidades
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-foreground" style={{ fontSize: '20px', fontWeight: 600 }}>
                            {formatCurrency(producto.precioVenta)}
                          </span>
                        </div>

                        <Button 
                          onClick={() => handleAddToCart(producto.id)}
                          disabled={producto.stock === 0}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 disabled:opacity-50"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          {producto.stock > 0 ? 'Agregar' : 'Agotado'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case 'nosotros':
        return (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-primary" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Sobre Nosotros
                  </span>
                </div>
                <h2 className="text-foreground mb-4" style={{ fontSize: '40px', fontWeight: 600, lineHeight: 1.2 }}>
                  GLAMOUR ML
                </h2>
                <p className="text-foreground-secondary" style={{ fontSize: '18px', lineHeight: 1.7 }}>
                  Tu tienda de confianza para productos de belleza en Medellín
                </p>
              </div>

              {/* Banner Image */}
              <div className="relative aspect-[16/6] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary-light/20 border border-border shadow-xl mb-16">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Sparkles className="w-32 h-32 text-primary mx-auto opacity-50" />
                    <p className="text-foreground-secondary" style={{ fontSize: '18px' }}>
                      GLAMOUR ML - Realza tu belleza
                    </p>
                  </div>
                </div>
              </div>

              {/* Historia */}
              <div className="max-w-4xl mx-auto mb-16">
                <div className="bg-card border border-border rounded-2xl p-8 lg:p-12">
                  <h3 className="text-foreground mb-6" style={{ fontSize: '28px', fontWeight: 600 }}>
                    Nuestra Historia
                  </h3>
                  <div className="space-y-4 text-foreground-secondary" style={{ fontSize: '16px', lineHeight: 1.8 }}>
                    <p>
                      <strong className="text-foreground">GLAMOUR ML</strong> nace en Medellín con la visión de ofrecer productos de belleza 
                      de alta calidad que realcen la belleza natural de cada mujer. Fundada por <strong className="text-foreground">Melissa López Patiño</strong>, 
                      nuestra empresa se ha convertido en un referente de confianza en el sector de cosméticos.
                    </p>
                    <p>
                      Comenzamos como una pequeña tienda con un gran sueño: democratizar el acceso a productos de belleza premium 
                      y brindar una experiencia de compra excepcional. Hoy, atendemos a miles de clientas satisfechas en toda la región.
                    </p>
                    <p>
                      Nos especializamos en maquillaje, cuidado de la piel y accesorios cuidadosamente seleccionados para garantizar 
                      la mejor calidad y resultados para nuestras clientas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Misión, Visión, Valores */}
              <div className="grid md:grid-cols-3 gap-6 mb-16">
                {/* Misión */}
                <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-foreground mb-4" style={{ fontSize: '22px', fontWeight: 600 }}>
                    Misión
                  </h3>
                  <p className="text-foreground-secondary" style={{ fontSize: '15px', lineHeight: 1.7 }}>
                    Ofrecer productos de belleza de alta calidad que realcen la confianza y autoestima de nuestras clientas, 
                    brindando una experiencia de compra excepcional y asesoría personalizada.
                  </p>
                </div>

                {/* Visión */}
                <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-foreground mb-4" style={{ fontSize: '22px', fontWeight: 600 }}>
                    Visión
                  </h3>
                  <p className="text-foreground-secondary" style={{ fontSize: '15px', lineHeight: 1.7 }}>
                    Ser la tienda de cosméticos líder en Medellín, reconocida por la excelencia en nuestros productos, 
                    servicio al cliente y por empoderar a las mujeres a través de la belleza.
                  </p>
                </div>

                {/* Valores */}
                <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-foreground mb-4" style={{ fontSize: '22px', fontWeight: 600 }}>
                    Valores
                  </h3>
                  <ul className="space-y-2 text-foreground-secondary" style={{ fontSize: '15px', lineHeight: 1.7 }}>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Calidad:</strong> Productos premium</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Confianza:</strong> Transparencia total</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Excelencia:</strong> Servicio superior</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Por qué elegirnos */}
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-foreground mb-4" style={{ fontSize: '32px', fontWeight: 600 }}>
                    ¿Por qué elegirnos?
                  </h3>
                  <p className="text-foreground-secondary" style={{ fontSize: '16px', lineHeight: 1.6 }}>
                    Estos son los beneficios que nos hacen diferentes
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {beneficios.map((beneficio, index) => (
                    <div key={index} className="flex items-start gap-4 bg-card border border-border rounded-xl p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <beneficio.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-foreground mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
                          {beneficio.title}
                        </h4>
                        <p className="text-foreground-secondary" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                          {beneficio.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case 'contacto':
        return (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-primary" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Contáctanos
                  </span>
                </div>
                <h2 className="text-foreground mb-4" style={{ fontSize: '40px', fontWeight: 600, lineHeight: 1.2 }}>
                  Envíanos un mensaje
                </h2>
                <p className="text-foreground-secondary" style={{ fontSize: '16px', lineHeight: 1.6 }}>
                  Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-foreground mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
                    Email
                  </h3>

                  <p className="text-foreground-secondary mb-4" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                    Envíanos un correo electrónico para cualquier consulta o duda.
                  </p>

                  <a href="mailto:hola@glamourml.com" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>hola@glamourml.com</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-foreground mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
                    Teléfono
                  </h3>

                  <p className="text-foreground-secondary mb-4" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                    Llámanos para asistencia inmediata o para más información.
                  </p>

                  <a href="tel:+573001234567" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>+57 300 123 4567</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-foreground mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
                    Dirección
                  </h3>

                  <p className="text-foreground-secondary mb-4" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                    Visítanos en nuestra tienda física en Medellín.
                  </p>

                  <div className="flex items-start gap-2 text-primary">
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Medellín, Antioquia, Colombia</span>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-card border border-border rounded-2xl p-8 lg:p-12">
                  <h3 className="text-foreground mb-6 text-center" style={{ fontSize: '28px', fontWeight: 600 }}>
                    Formulario de Contacto
                  </h3>
                  
                  <form onSubmit={handleContactFormSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                          Nombre <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="text"
                          id="nombre"
                          value={contactForm.nombre}
                          onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
                          className="h-12 bg-input-background border-border text-foreground"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                          Email <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="email"
                          id="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="h-12 bg-input-background border-border text-foreground"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensaje" className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                        Mensaje <span className="text-danger">*</span>
                      </Label>
                      <Textarea
                        id="mensaje"
                        value={contactForm.mensaje}
                        onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
                        className="min-h-32 bg-input-background border-border text-foreground"
                        placeholder="Escribe tu mensaje aquí..."
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                      <Mail className="w-5 h-5" />
                      Enviar Mensaje
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ===== PUBLIC HEADER WITH NAVBAR ===== */}
      {isPublic && (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="Glamour ML" className="w-full h-full object-cover" />
                </div>
                <span className="text-foreground" style={{ fontSize: '20px', fontWeight: 600 }}>
                  GLAMOUR ML
                </span>
              </div>

              {/* Navigation Menu - Desktop */}
              <nav className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setActiveSection('inicio')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'inicio'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-secondary hover:text-primary hover:bg-primary/5'
                  }`}
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Inicio
                </button>
                <button
                  onClick={() => setActiveSection('catalogo')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'catalogo'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-secondary hover:text-primary hover:bg-primary/5'
                  }`}
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Catálogo
                </button>
                <button
                  onClick={() => setActiveSection('nosotros')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'nosotros'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-secondary hover:text-primary hover:bg-primary/5'
                  }`}
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Nosotros
                </button>
                <button
                  onClick={() => setActiveSection('contacto')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'contacto'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-secondary hover:text-primary hover:bg-primary/5'
                  }`}
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Contacto
                </button>
              </nav>

              {/* Right Side: Theme Toggle + Auth Buttons */}
              <div className="flex items-center gap-3">
                {/* Theme Toggle - Integrated in header */}
                <div className="flex items-center">
                  <ThemeToggle inline />
                </div>
                
                {/* Auth Buttons - Desktop */}
                <div className="hidden sm:flex items-center gap-3">
                  <Button
                    onClick={onNavigateToLogin}
                    variant="ghost"
                    className="text-foreground hover:text-primary hover:bg-primary/10 gap-2"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden lg:inline">Iniciar Sesión</span>
                  </Button>
                  <Button
                    onClick={onNavigateToRegister}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden lg:inline">Registrarse</span>
                  </Button>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="sm:hidden flex items-center gap-2">
                  <Button
                    onClick={onNavigateToLogin}
                    size="sm"
                    variant="ghost"
                    className="text-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <LogIn className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={onNavigateToRegister}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className="md:hidden border-t border-border">
              <nav className="flex items-center justify-around py-2">
                <button
                  onClick={() => setActiveSection('inicio')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'inicio'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-secondary hover:text-primary hover:bg-primary/5'
                  }`}
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  Inicio
                </button>
                <button
                  onClick={() => setActiveSection('catalogo')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'catalogo'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-secondary hover:text-primary hover:bg-primary/5'
                  }`}
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  Catálogo
                </button>
                <button
                  onClick={() => setActiveSection('nosotros')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'nosotros'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-secondary hover:text-primary hover:bg-primary/5'
                  }`}
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  Nosotros
                </button>
                <button
                  onClick={() => setActiveSection('contacto')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'contacto'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-secondary hover:text-primary hover:bg-primary/5'
                  }`}
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  Contacto
                </button>
              </nav>
            </div>
          </div>
        </header>
      )}

      {/* ===== SECTION CONTENT ===== */}
      {renderSectionContent()}

      {/* ===== FOOTER ===== */}
      <footer className="bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="Glamour ML" className="w-14 h-14 object-cover" />
                </div>
                <span className="text-foreground" style={{ fontSize: '20px', fontWeight: 600 }}>
                  GLAMOUR ML
                </span>
              </div>
              <p className="text-foreground-secondary mb-4" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                Tu tienda de confianza para productos de belleza en Medellín.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Enlaces Rápidos */}
            <div>
              <h3 className="text-foreground mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                Enlaces Rápidos
              </h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => setActiveSection('inicio')} className="text-foreground-secondary hover:text-primary transition-colors" style={{ fontSize: '14px' }}>
                    Inicio
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate ? onNavigate('catalogo') : setActiveSection('catalogo')} className="text-foreground-secondary hover:text-primary transition-colors" style={{ fontSize: '14px' }}>
                    Catálogo
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveSection('nosotros')} className="text-foreground-secondary hover:text-primary transition-colors" style={{ fontSize: '14px' }}>
                    Sobre Nosotros
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveSection('contacto')} className="text-foreground-secondary hover:text-primary transition-colors" style={{ fontSize: '14px' }}>
                    Contacto
                  </button>
                </li>
              </ul>
            </div>

            {/* Categorías */}
            <div>
              <h3 className="text-foreground mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                Categorías
              </h3>
              <ul className="space-y-3">
                {categoriasDestacadas.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <button onClick={() => onNavigate ? onNavigate('catalogo', cat.id) : setActiveSection('catalogo')} className="text-foreground-secondary hover:text-primary transition-colors" style={{ fontSize: '14px' }}>
                      {cat.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-foreground mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                Contacto
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                    Medellín, Antioquia<br />Colombia
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="tel:+573001234567" className="text-foreground-secondary hover:text-primary transition-colors" style={{ fontSize: '14px' }}>
                    +57 300 123 4567
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="mailto:hola@glamourml.com" className="text-foreground-secondary hover:text-primary transition-colors" style={{ fontSize: '14px' }}>
                    hola@glamourml.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-foreground-secondary text-center sm:text-left" style={{ fontSize: '14px' }}>
                © 2026 GLAMOUR ML. Todos los derechos reservados.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-foreground-secondary hover:text-primary transition-colors" style={{ fontSize: '14px' }}>
                  Términos y Condiciones
                </a>
                <a href="#" className="text-foreground-secondary hover:text-primary transition-colors" style={{ fontSize: '14px' }}>
                  Política de Privacidad
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
