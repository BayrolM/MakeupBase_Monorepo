import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "../../lib/store";
import {
  Heart,
  Package,
  User,
  LogOut,
  ChevronDown,
  LogOut as LogoutIcon,
  ShoppingCart,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { productService } from "../../services/productService";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface ClientNavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

const COLORS = {
  accent: "#c47b96",
  accentDark: "#a85d77",
  accentDeep: "#7b1347",
  accentSoft: "#fce8f0",
};

export function ClientNavbar({
  currentRoute,
  onNavigate,
  onLogout,
}: ClientNavbarProps) {
  const {
    currentUser,
    favoritos,
    carrito,
    productos,
    removeFromCarrito,
    updateCarritoQuantity,
  } = useStore();

  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>(
    {},
  );

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [stockIssues, setStockIssues] = useState<
    Record<string, { available: number; requested: number }>
  >({});
  const [isValidating, setIsValidating] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalFavoritos = (favoritos as any[])?.length ?? 0;
  const cartItemCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  // Lógica de Carrito
  const getLiveQuantity = (item: (typeof carrito)[number]) => {
    const draft = quantityInputs[item.productoId];
    if (draft && /^\d+$/.test(draft)) {
      return Math.min(
        productos.find((p) => p.id === item.productoId)?.stock ?? item.cantidad,
        parseInt(draft, 10),
      );
    }
    return item.cantidad;
  };

  const cartTotal = carrito.reduce((sum, item) => {
    const producto = productos.find((p) => p.id === item.productoId);
    const cantidad = getLiveQuantity(item);
    return sum + (producto ? producto.precioVenta * cantidad : 0);
  }, 0);

  const total = cartTotal;

  // Use a ref so validateStock doesn't re-create on every carrito change
  const carritoRef = useRef(carrito);
  carritoRef.current = carrito;

  const validateStock = useCallback(async () => {
    const currentCarrito = carritoRef.current;
    if (currentCarrito.length === 0) return;
    setIsValidating(true);
    const issues: Record<string, { available: number; requested: number }> = {};
    try {
      for (const item of currentCarrito) {
        try {
          const freshProduct = await productService.getById(
            parseInt(item.productoId, 10),
          );
          const availableStock = freshProduct.stock_actual;
          if (availableStock <= 0) {
            issues[item.productoId] = {
              available: 0,
              requested: item.cantidad,
            };
          } else if (item.cantidad > availableStock) {
            issues[item.productoId] = {
              available: availableStock,
              requested: item.cantidad,
            };
            updateCarritoQuantity(item.productoId, availableStock);
          }
        } catch {
          /* skip if fetch fails */
        }
      }
      setStockIssues(issues);
      if (Object.keys(issues).length > 0) {
        const outOfStock = Object.values(issues).filter(
          (i) => i.available === 0,
        ).length;
        if (outOfStock > 0)
          toast.warning(`${outOfStock} producto(s) sin stock disponible`);
      }
    } finally {
      setIsValidating(false);
    }
  }, [updateCarritoQuantity]);

  // Only validate when the cart OPENS, not on every quantity change
  useEffect(() => {
    if (isCartOpen && carritoRef.current.length > 0) validateStock();
    if (!isCartOpen) setStockIssues({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCartOpen]);

  const hasBlockingIssues = Object.values(stockIssues).some(
    (i) => i.available === 0,
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { label: "Inicio", route: "inicio" },
    { label: "Catálogo", route: "catalogo" },
    { label: "Nosotros", route: "nosotros" },
    { label: "Contáctanos", route: "contacto" },
  ];

  const isActive = (route: string) => currentRoute === route;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Logo + Nav links juntos */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <button
                onClick={() => onNavigate("inicio")}
                className="flex items-center gap-3 shrink-0 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shadow-sm bg-black shrink-0">
                  <img
                    src="/logo.png"
                    alt="Glamour ML"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span
                    className="text-foreground font-bold"
                    style={{ fontSize: "18px", letterSpacing: "-0.01em" }}
                  >
                    GLAMOUR ML
                  </span>
                  <span
                    className="text-foreground-secondary"
                    style={{ fontSize: "11px", fontWeight: 500 }}
                  >
                    Belleza & Cuidado Personal
                  </span>
                </div>
              </button>

              {/* Nav links */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(({ label, route }) => (
                  <button
                    key={route}
                    onClick={() => onNavigate(route)}
                    className={`px-4 py-2 rounded-lg transition-colors cursor-pointer font-medium ${
                      isActive(route)
                        ? "bg-[#fce8f0] text-ring shadow-sm"
                        : "text-gray-600 hover:text-ring hover:bg-[#fce8f0]/60"
                    }`}
                    style={{ fontSize: "14px" }}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Íconos derecha */}
            <div className="flex items-center gap-1">
              {/* Favoritos (Solo Logueado) */}
              {currentUser && (
                <button
                  onClick={() => onNavigate("favoritos")}
                  title="Favoritos"
                  className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                    isActive("favoritos")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground-secondary hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  {totalFavoritos > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {totalFavoritos > 9 ? "9+" : totalFavoritos}
                    </span>
                  )}
                </button>
              )}
              {/* Carrito (Solo Logueado) */}

              <button
                onClick={() => setIsCartOpen(true)}
                title="Carrito"
                className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                  isCartOpen
                    ? "bg-primary/10 text-primary"
                    : "text-foreground-secondary hover:text-primary hover:bg-primary/5"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "var(--luxury-pink)",
                      border: "2px solid white",
                      boxShadow: "0 0 6px var(--luxury-shadow)",
                    }}
                  />
                )}
              </button>

              {/* Mis Pedidos (Solo Logueado) */}
              {currentUser && (
                <button
                  onClick={() => onNavigate("mis-pedidos")}
                  title="Mis Pedidos"
                  className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                    isActive("mis-pedidos")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground-secondary hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Package className="w-5 h-5" />
                </button>
              )}

              {/* Tema (Solo Logueado, Inline) */}
              {currentUser && <div className="flex items-center px-1"></div>}

              {/* Acceso / Usuario */}
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((p) => !p)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-primary/5 transition-colors"
                  >
                    {currentUser?.foto_perfil ? (
                      <img
                        src={currentUser.foto_perfil}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">
                          {currentUser?.nombres?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <>
                      <style>{`
                        @keyframes dropdownFade {
                          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
                          to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                      `}</style>
                      <div
                        className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl overflow-hidden z-50"
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid var(--luxury-pink-soft)",
                          animation:
                            "dropdownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                          transformOrigin: "top right",
                        }}
                      >
                        <div
                          className="px-4 py-3 border-b"
                          style={{ borderColor: "var(--luxury-pink-soft)" }}
                        >
                          <p className="text-sm font-semibold text-foreground truncate">
                            {currentUser?.nombres} {currentUser?.apellidos}
                          </p>
                          <p className="text-xs text-foreground-secondary truncate">
                            {currentUser?.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              onNavigate("perfil");
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface transition-colors text-left"
                          >
                            <User className="w-4 h-4 text-foreground-secondary" />
                            Mi Perfil
                          </button>
                        </div>

                        <div className="border-t border-border py-1">
                          <button
                            onClick={() => {
                              setShowLogoutConfirm(true);
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-2 h-10">
                  <button
                    onClick={() => onNavigate("login")}
                    className="px-5 py-2 text-sm font-semibold text-primary/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer h-full"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => onNavigate("register")}
                    className="px-8 py-0 h-9 text-sm font-bold text-white rounded-xl transition-all shadow-md active:scale-95 hover:brightness-110 hover:shadow-lg cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
                      boxShadow: `0 4px 12px ${COLORS.accent}40`,
                    }}
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Drawer del Carrito */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent
          className="p-0"
          style={{
            maxWidth: "440px",
            background: "var(--luxury-bg-soft)",
            borderLeft: "1px solid var(--luxury-accent-soft)",
          }}
        >
          <div className="flex flex-col h-full">
            <SheetHeader
              className="p-6"
              style={{
                borderBottom: "1px solid var(--luxury-accent-soft)",
                background: "var(--luxury-bg-header)",
              }}
            >
              <div
                style={{
                  height: "3px",
                  background:
                    "linear-gradient(90deg, var(--luxury-pink-soft), var(--luxury-pink))",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              />
              <SheetTitle
                className="flex items-center gap-3 font-serif text-xl font-bold"
                style={{ color: "var(--luxury-text-dark)" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg, var(--luxury-pink-soft), var(--luxury-pink))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px var(--luxury-shadow)",
                  }}
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                Mi Carrito
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--luxury-text-muted)",
                    textTransform: "none",
                  }}
                >
                  ({cartItemCount}{" "}
                  {cartItemCount === 1 ? "producto" : "productos"})
                </span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "var(--luxury-accent-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <ShoppingCart
                      className="w-10 h-10"
                      style={{ color: "var(--luxury-pink-soft)" }}
                    />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "var(--luxury-text-dark)",
                    }}
                  >
                    Tu carrito está vacío
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--luxury-text-muted)",
                      marginTop: "6px",
                    }}
                  >
                    Descubre nuestros productos en el catálogo
                  </p>
                  <button
                    onClick={() => {
                      onNavigate("catalogo");
                      setIsCartOpen(false);
                    }}
                    style={{
                      marginTop: "24px",
                      padding: "10px 32px",
                      borderRadius: "14px",
                      border: "1.5px solid var(--luxury-pink-soft)",
                      background: "transparent",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--luxury-pink)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "var(--luxury-accent-soft)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Ir al catálogo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item) => {
                    const producto = productos.find(
                      (p) => p.id === item.productoId,
                    );
                    if (!producto) return null;

                    const inputValue =
                      quantityInputs[item.productoId] ?? String(item.cantidad);

                    const hasStockIssue =
                      stockIssues[item.productoId]?.available === 0;

                    return (
                      <div
                        key={item.productoId}
                        className={`flex gap-4 p-4 rounded-xl transition-all ${
                          hasStockIssue ? "bg-red-50/50 border-red-200" : ""
                        }`}
                        style={{
                          border: hasStockIssue
                            ? undefined
                            : "1.5px solid var(--luxury-accent-soft)",
                          background: hasStockIssue ? undefined : "white",
                          boxShadow: hasStockIssue
                            ? undefined
                            : "0 2px 12px var(--luxury-shadow-xs)",
                        }}
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-border shrink-0 bg-white">
                          <img
                            src={
                              producto.imagenUrl ||
                              "https://via.placeholder.com/80"
                            }
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {producto.nombre}
                            </h4>
                            <button
                              onClick={() => {
                                removeFromCarrito(item.productoId);
                                setStockIssues((prev) => {
                                  const next = { ...prev };
                                  delete next[item.productoId];
                                  return next;
                                });
                              }}
                              className="text-foreground-secondary hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p
                            className="text-sm font-bold mt-1"
                            style={{ color: "var(--luxury-pink)" }}
                          >
                            {formatCurrency(producto.precioVenta)}
                          </p>

                          {stockIssues[item.productoId] && (
                            <div className="flex items-center gap-1.5 mt-2 text-amber-600">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-[11px] font-medium leading-tight">
                                {stockIssues[item.productoId].available === 0
                                  ? "Agotado — por favor retíralo"
                                  : `Quedan ${stockIssues[item.productoId].available} unidades`}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center mt-3">
                            <div className="flex items-center gap-3 bg-background border border-border rounded-lg p-1">
                              <button
                                onClick={() => {
                                  const next = item.cantidad - 1;
                                  if (next >= 1) {
                                    updateCarritoQuantity(
                                      item.productoId,
                                      next,
                                    );
                                    setQuantityInputs((prev) => ({
                                      ...prev,
                                      [item.productoId]: String(next),
                                    }));
                                  }
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface text-foreground transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={producto.stock}
                                step={1}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="quantity-input text-xs font-bold w-20 text-center rounded-lg border border-border bg-white"
                                value={inputValue}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (/^\d*$/.test(raw)) {
                                    setQuantityInputs((prev) => ({
                                      ...prev,
                                      [item.productoId]: raw,
                                    }));
                                  }
                                }}
                                onBlur={(e) => {
                                  const raw = e.target.value;
                                  const parsed = parseInt(raw, 10);

                                  if (Number.isNaN(parsed) || parsed < 1) {
                                    updateCarritoQuantity(item.productoId, 1);
                                    setQuantityInputs((prev) => ({
                                      ...prev,
                                      [item.productoId]: "1",
                                    }));
                                    return;
                                  }

                                  if (parsed > producto.stock) {
                                    toast.error(
                                      `Sólo hay ${producto.stock} unidades disponibles de ${producto.nombre}`,
                                    );
                                    updateCarritoQuantity(
                                      item.productoId,
                                      producto.stock,
                                    );
                                    setQuantityInputs((prev) => ({
                                      ...prev,
                                      [item.productoId]: String(producto.stock),
                                    }));
                                    return;
                                  }

                                  updateCarritoQuantity(
                                    item.productoId,
                                    parsed,
                                  );
                                  setQuantityInputs((prev) => ({
                                    ...prev,
                                    [item.productoId]: String(parsed),
                                  }));
                                }}
                              />
                              <button
                                onClick={() => {
                                  const next = item.cantidad + 1;
                                  if (next <= producto.stock) {
                                    updateCarritoQuantity(
                                      item.productoId,
                                      next,
                                    );
                                    setQuantityInputs((prev) => ({
                                      ...prev,
                                      [item.productoId]: String(next),
                                    }));
                                  }
                                }}
                                disabled={
                                  item.cantidad >= producto.stock ||
                                  hasStockIssue
                                }
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface text-foreground transition-colors disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div
                className="p-6"
                style={{
                  borderTop: "1px solid var(--luxury-accent-soft)",
                  background: "var(--luxury-bg-header)",
                }}
              >
                <div className="space-y-3 mb-6">
                  <div
                    className="flex justify-between text-sm"
                    style={{ color: "var(--luxury-text-secondary)" }}
                  >
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div
                    className="flex justify-between text-lg font-bold pt-4"
                    style={{
                      borderTop: "1.5px dashed var(--luxury-accent-soft)",
                    }}
                  >
                    <span style={{ color: "var(--luxury-text-dark)" }}>
                      Total
                    </span>
                    <span style={{ color: "var(--luxury-pink)" }}>
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {isValidating && (
                  <div className="flex items-center justify-center gap-2 mb-4 text-xs text-foreground-secondary">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Validando stock disponible...
                  </div>
                )}
                {/* ====MANEJO DE PAGO DE USUARIO NO AUTENTICADO DESDE EL CARRITO==== */}
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    if (currentUser) {
                      onNavigate("checkout");
                    } else {
                      onNavigate("login");
                    }
                  }}
                  disabled={
                    carrito.length === 0 || hasBlockingIssues || isValidating
                  }
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                  style={{
                    background: hasBlockingIssues
                      ? "#cbd5e1"
                      : "linear-gradient(135deg, var(--luxury-pink-soft) 0%, var(--luxury-pink) 100%)",
                    boxShadow: hasBlockingIssues
                      ? "none"
                      : "0 10px 20px var(--luxury-shadow)",
                  }}
                >
                  {hasBlockingIssues ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      PROBLEMAS DE STOCK
                    </>
                  ) : (
                    "IR A PAGAR 🎀"
                  )}
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#c47b96,#e092b2)",
                  boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
                }}
              >
                <LogoutIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Cerrar Sesión
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  ¿Estás segura de que deseas salir?
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="bg-[#fff0f5] rounded-xl p-4 border border-[#f0d5e0]">
              <p className="text-sm text-gray-600 leading-relaxed">
                Tu sesión se cerrará y tendrás que volver a iniciar sesión para
                acceder a tu cuenta.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowLogoutConfirm(false);
                onLogout();
              }}
              className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
              style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
            >
              Cerrar Sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
