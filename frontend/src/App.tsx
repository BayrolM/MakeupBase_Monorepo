import { StoreProvider, useStore, UserRole, Cliente } from "./lib/store";
import { ThemeProvider } from "./lib/theme-context";
import { AppSidebar } from "./components/AppSidebar";
import { Dashboard } from "./components/Dashboard";
import { SidebarProvider } from "./components/ui/sidebar";
import { useState, useEffect } from "react";
import { UsuariosModule } from "./components/modules/UsuariosModule";
import { ClientesViewModule } from "./components/modules/ClientesViewModule";
import { ProductsModule } from "./components/modules/ProductsModule";
import { CategoriasModule } from "./components/modules/CategoriasModule";

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
import { ClientNavbar } from "./components/client/ClientNavbar";
import { Toaster, toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { Lock, X } from "lucide-react";
import { authService } from "./services/authService";
import { orderService } from "./services/orderService";
import { productService } from "./services/productService";
import { categoryService } from "./services/categoryService";
import { providerService } from "./services/providerService";
import { purchaseService } from "./services/purchaseService";
import { userService } from "./services/userService";
import { marcaService } from "./services/marcaService";

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
    setMarcas,
    setProveedores,
    setCompras,
    setClientes,
    setPedidos,
  } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [currentRoute, setCurrentRoute] = useState<Route>(
    userType === "admin" ? "dashboard" : "inicio",
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const loadPublicData = async () => {
    try {
      const categoriesData = await categoryService.getAll({ limit: 100 });
      const mappedCategories = categoriesData.data.map((cat: any) => ({
        id: cat.id_categoria.toString(),
        nombre: cat.nombre,
        descripcion: cat.descripcion || "",
        estado: cat.estado ? ("activo" as const) : ("inactivo" as const),
      }));
      setCategorias(mappedCategories);

      const brandsData = await marcaService.getAll();
      const mappedBrands = brandsData.map((brand: any) => ({
        id: brand.id_marca.toString(),
        nombre: brand.nombre,
        descripcion: brand.descripcion || "",
        estado: brand.estado ? ("activo" as const) : ("inactivo" as const),
      }));
      setMarcas(mappedBrands);

      const productsResponse = await productService.getAll({ limit: 100 });
      const mappedProducts = productsResponse.data.map((prod) => ({
        id: prod.id_producto.toString(),
        nombre: prod.nombre,
        descripcion: prod.descripcion || "",
        categoriaId: prod.id_categoria.toString(),
        marca: (prod as any).nombre_marca || "Genérica",
        precioCompra: Number(prod.costo_promedio) || 0,
        precioVenta: Number(prod.precio_venta) || 0,
        stock: prod.stock_actual || 0,
        stockMinimo: prod.stock_min || 0,
        stockMaximo: prod.stock_max || 100,
        imagenUrl: prod.imagen_url || undefined,
        estado: prod.estado ? ("activo" as const) : ("inactivo" as const),
        fechaCreacion: new Date().toISOString(),
      }));
      setProductos(mappedProducts);
    } catch (error) {
      console.error("Error cargando datos públicos:", error);
    }
  };

  const loadPrivateData = async (userRol?: string | number) => {
    // If no role provided, use current or default to cliente
    const role = userRol || currentUser?.rol || userType;
    const isAdmin = role === "admin" || role === 1;

    try {
      if (isAdmin) {
        const providersData = await providerService.getAll();
        const mappedProviders = providersData.map((prov) => ({
          id: prov.id_proveedor.toString(),
          nombre: prov.nombre,
          email: prov.email || "",
          telefono: prov.telefono || "",
          nit: prov.documento_nit || "",
          direccion: "",
          estado: prov.estado ? ("activo" as const) : ("inactivo" as const),
          fechaRegistro: new Date().toISOString(),
        }));
        setProveedores(mappedProviders);

        const purchasesData = await purchaseService.getAll();
        const purchasesArray = Array.isArray(purchasesData)
          ? purchasesData
          : (purchasesData as any).data || [];
        const mappedPurchases = purchasesArray.map((purch: any) => ({
          id: purch.id_compra.toString(),
          proveedorId: purch.id_proveedor.toString(),
          fecha: purch.fecha_compra,
          total: Number(purch.total),
          estado:
            purch.estado === true || purch.estado === 1
              ? ("confirmada" as const)
              : ("anulada" as const),
          confirmada: !!purch.estado,
          observaciones: purch.observaciones || "",
          productos: [],
        }));
        setCompras(mappedPurchases);

        // Cargar clientes REALES de la base de datos
        const clientsData = await userService.getAll({ id_rol: 2 });
        const mappedClients: Cliente[] = clientsData.data.map((c: any) => {
          const nombres = c.nombres || c.nombre || "";
          const apellidos = c.apellidos || c.apellido || "";
          return {
            id: c.id_usuario.toString(),
            nombre: `${nombres} ${apellidos}`.trim() || "Sin Nombre",
            nombres: nombres,
            apellidos: apellidos,
            email: c.email,
            telefono: c.telefono || "",
            documento: c.documento || "",
            numeroDocumento: c.documento || "",
            estado: c.estado ? ("activo" as const) : ("inactivo" as const),
            totalCompras: Number(c.total_ventas) || 0,
            foto_perfil: c.foto_perfil,
            fechaRegistro:
              c.get_fecha_creacion ||
              c.fecha_creacion ||
              new Date().toISOString(),
          };
        });
        setClientes(mappedClients);
      }

      // Cargar Pedidos REALES
      const ordersData = await orderService.getAll({ limit: 100 });
      const mappedOrders = ordersData.data.map((o: any) => ({
        id: o.id_pedido?.toString() || "0",
        clienteId: (o.id_usuario_cliente || o.id_usuario)?.toString() || "0",
        fecha: o.fecha_pedido,
        total: Number(o.total) || 0,
        subtotal: (Number(o.total) || 0) / 1.19,
        iva: (Number(o.total) || 0) - (Number(o.total) || 0) / 1.19,
        costoEnvio: 0,
        estado: o.estado as any,
        direccionEnvio: o.direccion || "",
        pago_confirmado: !!o.pago_confirmado,
        comprobante_url: o.comprobante_url || "",
        productos: (o.items || []).map((i: any) => ({
          productoId: (i.id_producto || i.id_detalle_pedido)?.toString() || "0",
          cantidad: i.cantidad || 0,
          precioUnitario: Number(i.precio_unitario) || 0,
        })),
      }));
      setPedidos(mappedOrders);
    } catch (error) {
      console.error("Error cargando datos privados:", error);
    }
  };

  // Verificar si hay sesión activa al cargar
  const checkAuth = async () => {
    if (authService.isAuthenticated()) {
      try {
        const profile = await authService.getProfile();
        const user = {
          id: profile.id_usuario.toString(),
          nombres: profile.nombres,
          apellidos: profile.apellidos,
          email: profile.email,
          telefono: profile.telefono,
          direccion: profile.direccion || "",
          ciudad: profile.ciudad || "",
          id_rol: Number(profile.id_rol),
          foto_perfil: profile.foto_perfil,
          rol:
            Number(profile.id_rol) === 1
              ? ("admin" as const)
              : ("cliente" as const),
          estado: "activo" as const,
          tipoDocumento: "CC" as const,
          numeroDocumento: "",
          passwordHash: "",
          fechaCreacion: new Date().toISOString(),
        };

        setCurrentUser(user);
        setIsAuthenticated(true);
        await loadPublicData();
        await loadPrivateData(user.rol);
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
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
      setCurrentRoute(userType === "admin" ? "dashboard" : "inicio");
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
        nombres: profile.nombres,
        apellidos: profile.apellidos,
        email: profile.email,
        telefono: profile.telefono,
        direccion: profile.direccion || "",
        ciudad: profile.ciudad || "",
        id_rol: Number(profile.id_rol),
        foto_perfil: profile.foto_perfil,
        rol:
          Number(profile.id_rol) === 1
            ? ("admin" as const)
            : ("cliente" as const),
        estado: "activo" as const,
        tipoDocumento: "CC" as const,
        numeroDocumento: "",
        passwordHash: "",
        fechaCreacion: new Date().toISOString(),
      };

      setCurrentUser(user);
      setIsAuthenticated(true);

      // Load public and private data
      await loadPublicData();
      await loadPrivateData(user.rol);

      // Establecer ruta inicial según rol
      if (user.rol === "cliente") {
        setCurrentRoute("inicio");
      } else {
        setCurrentRoute("dashboard");
      }

      toast.success("¡Bienvenido!", {
        description: `Has iniciado sesión como ${user.nombres}`,
      });

      return true;
    } catch (error: any) {
      // Cuenta inactiva — mostrar modal específico
      if (
        error.response?.status === 403 &&
        error.response?.data?.code === "USER_INACTIVE"
      ) {
        setShowInactiveModal(true);
        return false;
      }
      toast.error("Error al iniciar sesión", {
        description: error.message || "Credenciales incorrectas",
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
        id_rol: data.rol === "admin" ? 1 : 2,
        tipo_documento: data.tipoDocumento,
        documento: data.documento,
        direccion: data.direccion,
        ciudad: data.ciudad,
      });

      toast.success("¡Registro exitoso!", {
        description: "Ahora puedes iniciar sesión",
      });

      // Redirigir a login
      setAuthPage("login");
    } catch (error: any) {
      toast.error("Error al registrar", {
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

  // Show authentication pages if requested
  if (showAuthPage && !isAuthenticated) {
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

    return (
      <>
        {authContent}
        {/* Modal: cuenta inactiva */}
        <Dialog open={showInactiveModal} onOpenChange={setShowInactiveModal}>
          <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#c47b96,#e092b2)",
                    boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
                  }}
                >
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                    Cuenta inactiva
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-400 mt-0.5">
                    No puedes iniciar sesión en este momento
                  </DialogDescription>
                </div>
              </div>
              <button
                onClick={() => setShowInactiveModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  background: "#fff0f5",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid #f0d5e0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <Lock
                  style={{
                    color: "#c47b96",
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#374151",
                      lineHeight: 1.5,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    Tu cuenta ha sido desactivada
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      lineHeight: 1.5,
                    }}
                  >
                    No tienes permiso para iniciar sesión. Si crees que esto es
                    un error, comunícate con el administrador del sistema.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end px-6 pb-6 pt-2">
              <button
                onClick={() => setShowInactiveModal(false)}
                className="rounded-lg font-semibold px-6 h-10 text-sm text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#c47b96" }}
              >
                Entendido
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const renderContent = () => {
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
    if (adminRoutes.includes(currentRoute) && userType === "cliente") {
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
        return <ClientesViewModule />;
      case "proveedores":
        return <ProveedoresModule />;
      case "compras":
        return <ComprasModule />;
      case "configuracion":
        return <PerfilUsuarioModule />;
      case "roles":
        return <RolesPermisosModule />;
      case "inicio":
        return (
          <InicioView
            isPublic={!isAuthenticated}
            onNavigate={(route, catId) => {
              if (route === "login" || route === "register") {
                setShowAuthPage(true);
                setAuthPage(route as AuthPage);
              } else {
                if (catId) setActiveCategory(catId);
                setCurrentRoute(route as Route);
              }
            }}
          />
        );
      case "catalogo":
        return (
          <CatalogoView
            initialCategory={activeCategory || "all"}
            onClearCategory={() => setActiveCategory(null)}
          />
        );
      case "favoritos":
        return (
          <FavoritosView
            onNavigate={(route) => setCurrentRoute(route as Route)}
          />
        );
      case "mis-pedidos":
        if (!isAuthenticated) {
          setShowAuthPage(true);
          setAuthPage("login");
          return null;
        }
        return (
          <MisPedidosView
            onNavigate={(route) => setCurrentRoute(route as Route)}
          />
        );
      case "historial":
        return <HistorialView />;
      case "perfil":
        if (!isAuthenticated) {
          setShowAuthPage(true);
          setAuthPage("login");
          return null;
        }
        return <PerfilView />;
      case "checkout":
        if (!isAuthenticated) {
          setShowAuthPage(true);
          setAuthPage("login");
          return null;
        }
        return (
          <CheckoutView
            onBack={() => setCurrentRoute("inicio")}
            onComplete={() => setCurrentRoute("mis-pedidos")}
          />
        );
      default:
        return userType === "admin" ? <Dashboard /> : <InicioView />;
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthPage("login");
    setCurrentRoute("dashboard");

    toast.info("Sesión cerrada", {
      description: "Has cerrado sesión correctamente",
    });
  };

  // Layout cliente: navbar horizontal, sin sidebar
  if (userType === "cliente") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <ClientNavbar
          currentRoute={currentRoute}
          onNavigate={(route) => {
            if (route === "login" || route === "register") {
              setShowAuthPage(true);
              setAuthPage(route as AuthPage);
            } else {
              if (route === "catalogo") setActiveCategory(null);
              setCurrentRoute(route as Route);
            }
          }}
          onLogout={handleLogout}
        />
        <main className="flex-1">{renderContent()}</main>
      </div>
    );
  }

  // Layout admin: sidebar
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          onNavigate={(route) => {
            if (route === "catalogo") setActiveCategory(null);
            setCurrentRoute(route as Route);
          }}
          currentRoute={currentRoute}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto">{renderContent()}</main>
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
