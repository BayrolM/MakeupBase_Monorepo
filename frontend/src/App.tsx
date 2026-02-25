import {
  StoreProvider,
  useStore,
  UserRole,
} from "./lib/store";
import { ThemeProvider } from "./lib/theme-context";
import { AppSidebar } from "./components/AppSidebar";
import { Dashboard } from "./components/Dashboard";
import { SidebarProvider } from "./components/ui/sidebar";
import { ThemeToggle } from "./components/ThemeToggle";
import { useState, useEffect } from "react";
import { UsersModule } from "./components/modules/UsersModule";
import { UsuariosModule } from "./components/modules/UsuariosModule";
import { ClientesViewModule } from "./components/modules/ClientesViewModule";
import { ProductsModule } from "./components/modules/ProductsModule";
import { CategoriasModule } from "./components/modules/CategoriasModule";
import { ClientesModule } from "./components/modules/ClientesModule";
import { ProveedoresModule } from "./components/modules/ProveedoresModule";
import { VentasModule } from "./components/modules/VentasModule";
import { ComprasModule } from "./components/modules/ComprasModule";
import { PedidosModule } from "./components/modules/PedidosModule";
import { DevolucionesModule } from "./components/modules/DevolucionesModule";
import { RolesPermisosModule } from "./components/modules/RolesPermisosModule";
import { PerfilUsuarioModule } from "./components/modules/PerfilUsuarioModule";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPageColombia } from "./components/auth/RegisterPageColombia";
import { RecoverPage } from "./components/auth/RecoverPage";
import { InicioView } from "./components/client/InicioView";
import { CatalogoView } from "./components/client/CatalogoView";
import { FavoritosView } from "./components/client/FavoritosView";
import { MisPedidosView } from "./components/client/MisPedidosView";
import { HistorialView } from "./components/client/HistorialView";
import { PerfilView } from "./components/client/PerfilView";
import { CheckoutView } from "./components/client/CheckoutView";
import { FloatingCart } from "./components/client/FloatingCart";
import { Toaster, toast } from "sonner";
import { authService } from "./services/authService";
import { productService } from "./services/productService";
import { categoryService } from "./services/categoryService";
import { providerService } from "./services/providerService";
import { purchaseService } from "./services/purchaseService";

type Route =
  | "dashboard"
  | "usuarios"
  | "clientes-view"
  | "productos"
  | "categorias"
  | "ventas"
  | "pedidos"
  | "devoluciones"
  | "clientes"
  | "proveedores"
  | "compras"
  | "configuracion"
  | "roles"
  | "inicio"
  | "catalogo"
  | "favoritos"
  | "mis-pedidos"
  | "historial"
  | "perfil"
  | "checkout";

type AuthPage = "login" | "register" | "recover";

function AppContent() {
  const {
    userType,
    currentUser,
    setCurrentUser,
    setProductos,
    setCategorias,
    setProveedores,
    setCompras,
  } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [currentRoute, setCurrentRoute] = useState<Route>(
    userType === "admin" ? "dashboard" : "inicio",
  );

  const loadPublicData = async () => {
    try {
      const categoriesData = await categoryService.getAll();
      const mappedCategories = categoriesData.map(cat => ({
        id: cat.id_categoria.toString(),
        nombre: cat.nombre,
        descripcion: cat.descripcion || '',
        estado: cat.estado ? 'activo' as const : 'inactivo' as const,
      }));
      setCategorias(mappedCategories);

      const productsResponse = await productService.getAll({ limit: 100 });
      const mappedProducts = productsResponse.data.map(prod => ({
        id: prod.id_producto.toString(),
        sku: prod.sku,
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        categoriaId: prod.id_categoria.toString(),
        marca: (prod as any).nombre_marca || 'Genérica',
        precioCompra: Number(prod.costo_promedio) || 0,
        precioVenta: Number(prod.precio_venta) || 0,
        stock: prod.stock_actual || 0,
        stockMinimo: prod.stock_min || 0,
        stockMaximo: prod.stock_max || 100,
        estado: prod.estado ? 'activo' as const : 'inactivo' as const,
        fechaCreacion: new Date().toISOString(),
      }));
      setProductos(mappedProducts);
    } catch (error) {
      console.error('Error cargando datos públicos:', error);
    }
  };

  const loadPrivateData = async () => {
    try {
      const providersData = await providerService.getAll();
      const mappedProviders = providersData.map(prov => ({
        id: prov.id_proveedor.toString(),
        nombre: prov.nombre,
        email: prov.email || '',
        telefono: prov.telefono || '',
        nit: prov.documento_nit || '',
        direccion: '',
        estado: prov.estado ? 'activo' as const : 'inactivo' as const,
        fechaRegistro: new Date().toISOString(),
      }));
      setProveedores(mappedProviders);

      const purchasesResponse = await purchaseService.getAll();
      const mappedPurchases = purchasesResponse.data.map((purch: any) => ({
        id: purch.id_compra.toString(),
        proveedorId: purch.id_proveedor.toString(),
        fecha: purch.fecha_compra,
        total: Number(purch.total),
        estado: purch.estado ? 'confirmada' as const : 'anulada' as const,
        confirmada: purch.estado,
        observaciones: purch.observaciones || '',
        productos: [],
      }));
      setCompras(mappedPurchases);
    } catch (error) {
      console.error('Error cargando datos privados:', error);
    }
  };

  // Verificar si hay sesión activa al cargar
  const checkAuth = async () => {
    if (authService.isAuthenticated()) {
      try {
        const profile = await authService.getProfile();
        const user = {
          id: profile.id_usuario.toString(),
          nombre: profile.nombres,
          apellido: profile.apellidos,
          email: profile.email,
          telefono: profile.telefono,
          direccion: profile.direccion || '',
          ciudad: profile.ciudad || '',
          rol: Number(profile.id_rol) === 1 ? 'admin' as const : 'cliente' as const,
          estado: 'activo' as const,
          tipoDocumento: 'CC' as const,
          numeroDocumento: '',
          passwordHash: '',
          fechaCreacion: new Date().toISOString(),
        };

        setCurrentUser(user);
        setIsAuthenticated(true);
        await loadPublicData();
        await loadPrivateData();
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        authService.logout();
        await loadPublicData(); // Load public even if private fails
      }
    } else {
      await loadPublicData();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update route when userType changes
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentRoute(
        userType === "admin" ? "dashboard" : "inicio",
      );
    }
  }, [userType, isAuthenticated]);

  const handleLogin = async (email: string, password: string) => {
    try {
      // Llamar al backend
      await authService.login({ email, password });

      // Obtener perfil del usuario
      const profile = await authService.getProfile();

      // Transformar al formato del frontend
      const user = {
        id: profile.id_usuario.toString(),
        nombre: profile.nombres,
        apellido: profile.apellidos,
        email: profile.email,
        telefono: profile.telefono,
        direccion: profile.direccion || '',
        ciudad: profile.ciudad || '',
        rol: Number(profile.id_rol) === 1 ? 'admin' as const : 'cliente' as const,
        estado: 'activo' as const,
        tipoDocumento: 'CC' as const,
        numeroDocumento: '',
        passwordHash: '',
        fechaCreacion: new Date().toISOString(),
      };

      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Load public and private data
      await loadPublicData();
      await loadPrivateData();

      // Establecer ruta inicial según rol
      if (user.rol === 'cliente') {
        setCurrentRoute('inicio');
      } else {
        setCurrentRoute('dashboard');
      }

      toast.success('¡Bienvenido!', {
        description: `Has iniciado sesión como ${user.nombre}`,
      });

      return true;
    } catch (error: any) {
      toast.error('Error al iniciar sesión', {
        description: error.message || 'Credenciales incorrectas',
      });
      return false;
    }
  };

  const handleRegister = async (data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    password: string;
    rol: UserRole;
    tipoDocumento: string;
    documento: string;
    direccion: string;
    ciudad: string;
  }) => {
    try {
      await authService.register({
        nombres: data.nombre,
        apellidos: data.apellido,
        email: data.email,
        telefono: data.telefono,
        password: data.password,
        id_rol: data.rol === 'admin' ? 1 : 2,
        tipo_documento: data.tipoDocumento,
        documento: data.documento,
        direccion: data.direccion,
        ciudad: data.ciudad,
      });

      toast.success('¡Registro exitoso!', {
        description: 'Ahora puedes iniciar sesión',
      });

      // Redirigir a login
      setAuthPage('login');
    } catch (error: any) {
      toast.error('Error al registrar', {
        description: error.message,
      });
    }
  };

  const handleRecover = (email: string) => {
    // Simulate password recovery
    console.log("Recovering password for:", email);
  };

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show landing page or authentication pages if not authenticated
  if (!isAuthenticated) {
    // If showAuthPage is false, show the public landing page
    if (!showAuthPage) {
      return (
        <InicioView 
          isPublic={true}
          onNavigateToLogin={() => {
            setShowAuthPage(true);
            setAuthPage("login");
          }}
          onNavigateToRegister={() => {
            setShowAuthPage(true);
            setAuthPage("register");
          }}
        />
      );
    }

    // Show authentication pages
    let authContent;
    switch (authPage) {
      case "login":
        authContent = (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToRegister={() => setAuthPage("register")}
            onNavigateToRecover={() => setAuthPage("recover")}
            onBack={() => setShowAuthPage(false)}
          />
        );
        break;
      case "register":
        authContent = (
          <RegisterPageColombia
            onRegister={handleRegister}
            onNavigateToLogin={() => setAuthPage("login")}
            onBack={() => setShowAuthPage(false)}
          />
        );
        break;
      case "recover":
        authContent = (
          <RecoverPage
            onRecover={handleRecover}
            onNavigateToLogin={() => setAuthPage("login")}
            onBack={() => setShowAuthPage(false)}
          />
        );
        break;
    }

    return <>{authContent}</>;
  }

  const renderContent = () => {
    // Admin routes - only accessible when userType is 'admin'
    const adminRoutes = [
      "dashboard",
      "usuarios",
      "clientes-view",
      "productos",
      "categorias",
      "ventas",
      "pedidos",
      "devoluciones",
      "clientes",
      "proveedores",
      "compras",
      "configuracion",
      "roles",
    ];

    // If trying to access admin route but user is cliente, redirect to inicio
    if (
      adminRoutes.includes(currentRoute) &&
      userType === "cliente"
    ) {
      setCurrentRoute("inicio");
      return <InicioView />;
    }

    switch (currentRoute) {
      case "dashboard":
        return <Dashboard />;
      case "usuarios":
        return <UsuariosModule />;
      case "clientes-view":
        return <ClientesViewModule />;
      case "productos":
        return <ProductsModule />;
      case "categorias":
        return <CategoriasModule />;
      case "ventas":
        return <VentasModule />;
      case "pedidos":
        return <PedidosModule />;
      case "devoluciones":
        return <DevolucionesModule />;
      case "clientes":
        return <ClientesModule />;
      case "proveedores":
        return <ProveedoresModule />;
      case "compras":
        return <ComprasModule />;
      case "configuracion":
        return <PerfilUsuarioModule />;
      case "roles":
        return <RolesPermisosModule />;
      case "inicio":
        return <InicioView />;
      case "catalogo":
        return <CatalogoView />;
      case "favoritos":
        return <FavoritosView />;
      case "mis-pedidos":
        return <MisPedidosView />;
      case "historial":
        return <HistorialView />;
      case "perfil":
        return <PerfilView />;
      case "checkout":
        return (
          <CheckoutView
            onBack={() => setCurrentRoute("inicio")}
            onComplete={() => setCurrentRoute("mis-pedidos")}
          />
        );
      default:
        return userType === "admin" ? (
          <Dashboard />
        ) : (
          <InicioView />
        );
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthPage("login");
    setCurrentRoute("dashboard");

    toast.info('Sesión cerrada', {
      description: 'Has cerrado sesión correctamente',
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          onNavigate={(route) => setCurrentRoute(route as Route)}
          currentRoute={currentRoute}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>

        {/* Floating Cart - Only show for client view */}
        {userType === "cliente" &&
          currentRoute !== "checkout" && (
            <FloatingCart
              onCheckout={() => setCurrentRoute("checkout")}
            />
          )}
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AppContent />
        <Toaster />
      </StoreProvider>
    </ThemeProvider>
  );
}