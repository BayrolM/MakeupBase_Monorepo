import { useState, useEffect } from "react";
import { useStore } from "../../lib/store";
import { StatusBadge } from "../StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Package,
  FileText,
  RotateCcw,
  Truck,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Calendar,
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { generateOrderPDF } from "../../lib/pdfGenerator";
import { CONFIG } from "../../lib/constants";
import { toast } from "sonner";
import { PedidoReturnDialog } from "./PedidoReturnDialog";

export function MisPedidosView({
  onNavigate,
}: { onNavigate?: (route: string) => void } = {}) {
  const {
    pedidos,
    setPedidos,
    updatePedido,
    clientes,
    productos,
    currentUser,
  } = useStore();
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showEditDir, setShowEditDir] = useState(false);
  const [editDireccion, setEditDireccion] = useState("");
  const [isSavingDir, setIsSavingDir] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pedidoToCancel, setPedidoToCancel] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [pedidoToReturn, setPedidoToReturn] = useState<any>(null);

  // Get current client ID
  const currentCliente = clientes.find((c) => c.email === currentUser?.email);
  const myId = currentCliente?.id || currentUser?.id;

  // Filter pedidos for current client
  const misPedidos = pedidos.filter((p) => p.clienteId === myId);

  // Polling for live updates (estado, pago, dirección, pedidos nuevos)
  useEffect(() => {
    if (!myId) return;

    const pollOrders = async () => {
      try {
        const response = await orderService.getAll({ limit: 200 });
        const myLatestOrders = (response.data || []).filter(
          (o: any) => o.id_usuario_cliente?.toString() === myId.toString(),
        );

        myLatestOrders.forEach((serverOrder: any) => {
          const stringId = serverOrder.id_pedido.toString();
          const existsLocally = pedidos.some((p) => p.id === stringId);

          const updatedFields = {
            estado: serverOrder.estado,
            pago_confirmado: !!serverOrder.pago_confirmado,
            total: Number(serverOrder.total),
            direccionEnvio: serverOrder.direccion || "",
          };

          if (existsLocally) {
            updatePedido(stringId, updatedFields);
          } else {
            // Pedido nuevo creado por admin — agregarlo al store

            setPedidos([
              {
                id: stringId,
                clienteId: myId.toString(),
                fecha: serverOrder.fecha_pedido?.split("T")[0] || "",
                productos: [],
                subtotal: 0,
                iva: 0,
                costoEnvio: 0,
                direccionEnvio: serverOrder.direccion || "",
                estado: serverOrder.estado,
                pago_confirmado: !!serverOrder.pago_confirmado,
                total: Number(serverOrder.total),
              },
              ...pedidos,
            ]);
          }

          // Actualizar modal abierto si es el mismo pedido
          setSelectedPedido((prev: any) => {
            if (prev && prev.id === stringId) {
              return { ...prev, ...updatedFields };
            }
            return prev;
          });
        });
      } catch (_) {
        // Ignorar errores de red temporales durante el polling
      }
    };

    const intervalId = setInterval(pollOrders, 5000);
    return () => clearInterval(intervalId);
  }, [myId, updatePedido, pedidos, setPedidos]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const filteredPedidos = misPedidos.filter((p) => {
    // Filtro por estado
    const matchEstado = filterStatus === "all" || p.estado === filterStatus;
    if (!matchEstado) return false;

    // Filtro por búsqueda (ID o fecha) — sin recargar
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const matchId = p.id.toLowerCase().includes(q);
    const matchFecha = p.fecha?.toLowerCase().includes(q);
    return matchId || matchFecha;
  });

  const canRequestReturn = (pedido: any) => {
    // Normalizamos a minúsculas para evitar errores de capitalización
    const estado = (pedido.estado || "").toLowerCase();
    if (estado !== "entregado") return false;

    // El mes de garantía cuenta desde la fecha de venta (entrega real)
    // Fallback a fecha de pedido si no existe fechaVenta
    const dateStr = pedido.fechaVenta || pedido.fecha;
    if (!dateStr) return false;

    const referenceDate = new Date(dateStr);
    const today = new Date();

    // Calculamos la diferencia en días (Usamos 45 días para dar margen al "mes" del cliente)
    const diffTime = Math.abs(today.getTime() - referenceDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 45;
  };

  const handleViewDetail = async (pedido: any) => {
    setIsLoadingDetail(true);
    try {
      const fullOrder = await orderService.getById(Number(pedido.id));
      setSelectedPedido({
        ...pedido,
        ...fullOrder, // Include all fields from backend like transportadora, numero_guia, etc.
        productos: (fullOrder.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(),
          cantidad: i.cantidad,
          precioUnitario: i.precio_unitario || 0,
        })),
      });
      setShowDetail(true);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar detalle del pedido");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handlePrintInvoice = async (pedido: any) => {
    setIsLoadingDetail(true);
    try {
      const fullOrder = await orderService.getById(Number(pedido.id));
      const completePedido = {
        ...pedido,
        clienteNombre: currentUser
          ? `${currentUser.nombres || ""} ${currentUser.apellidos || ""}`.trim()
          : "",
        productos: (fullOrder.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(),
          cantidad: i.cantidad,
          precioUnitario: i.precio_unitario || 0,
          precio_unitario: i.precio_unitario || 0,
        })),
      };
      const cliente = clientes.find((c) => c.email === currentUser?.email);
      await generateOrderPDF(completePedido, cliente, productos, CONFIG);
    } catch (error) {
      console.error(error);
      toast.error("Error al generar el PDF");
    } finally {
      setIsLoadingDetail(false);
    }
  };
  const handleCancelPedido = async () => {
    if (!pedidoToCancel) return;
    setIsCancelling(true);
    try {
      await orderService.cancelByClient(Number(pedidoToCancel.id));
      toast.success("Pedido cancelado correctamente");
      // Refrescar pedidos
      const response = await orderService.getAll();
      const myId =
        clientes.find((c) => c.email === currentUser?.email)?.id ||
        currentUser?.id;
      const mapped = (response.data || [])
        .filter(
          (o: any) => o.id_usuario_cliente?.toString() === myId?.toString(),
        )
        .map((o: any) => ({
          id: o.id_pedido.toString(),
          clienteId: o.id_usuario_cliente?.toString() || "",
          fecha: o.fecha_pedido?.split("T")[0] || "",
          productos: [],
          subtotal: 0,
          iva: 0,
          costoEnvio: 0,
          total: Number(o.total),
          estado: o.estado,
          direccionEnvio: o.direccion || "",
          pago_confirmado: !!o.pago_confirmado,
          comprobante_url: o.comprobante_url || "",
          fechaVenta: o.fecha_venta || null,
        }));

      setPedidos(mapped);
      setShowCancelConfirm(false);
      setPedidoToCancel(null);
    } catch (error: any) {
      toast.error(error.message || "Error al cancelar el pedido");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSaveDireccion = async () => {
    if (!selectedPedido || !editDireccion.trim()) {
      toast.error("La dirección no puede estar vacía");
      return;
    }
    setIsSavingDir(true);
    try {
      await orderService.updateDireccion(
        Number(selectedPedido.id),
        editDireccion.trim(),
      );
      toast.success("Dirección actualizada correctamente");
      setShowEditDir(false);
      // Actualizar el pedido seleccionado localmente
      setSelectedPedido({
        ...selectedPedido,
        direccionEnvio: editDireccion.trim(),
        direccion: editDireccion.trim(),
      });
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la dirección");
    } finally {
      setIsSavingDir(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf5f8" }}>
      {/* Header */}
      <div style={{ background: "#fff8fb", borderBottom: "1px solid #f0d5e0" }}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Truck style={{ width: 28, height: 28, color: "#b06080" }} />
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#1a1a1a",
                margin: 0,
              }}
            >
              Mis Pedidos
            </h1>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setFilterStatus("all")}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
                transition: "all 0.2s",
                border: "none",
                cursor: "pointer",
                background:
                  filterStatus === "all"
                    ? "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)"
                    : "transparent",
                color: filterStatus === "all" ? "#fff" : "#666",
              }}
            >
              Todos ({misPedidos.length})
            </button>
            <button
              onClick={() => setFilterStatus("pendiente")}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
                transition: "all 0.2s",
                border: "none",
                cursor: "pointer",
                background:
                  filterStatus === "pendiente"
                    ? "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)"
                    : "transparent",
                color: filterStatus === "pendiente" ? "#fff" : "#666",
              }}
            >
              Pendientes (
              {misPedidos.filter((p) => p.estado === "pendiente").length})
            </button>
            <button
              onClick={() => setFilterStatus("enviado")}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
                transition: "all 0.2s",
                border: "none",
                cursor: "pointer",
                background:
                  filterStatus === "enviado"
                    ? "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)"
                    : "transparent",
                color: filterStatus === "enviado" ? "#fff" : "#666",
              }}
            >
              En camino (
              {misPedidos.filter((p) => p.estado === "enviado").length})
            </button>
            <button
              onClick={() => setFilterStatus("entregado")}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
                transition: "all 0.2s",
                border: "none",
                cursor: "pointer",
                background:
                  filterStatus === "entregado"
                    ? "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)"
                    : "transparent",
                color: filterStatus === "entregado" ? "#fff" : "#666",
              }}
            >
              Entregados (
              {misPedidos.filter((p) => p.estado === "entregado").length})
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative w-full mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-10 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all text-sm"
              placeholder="Buscar por ID de pedido o fecha (ej: 2025-01-15)..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {filteredPedidos.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 0",
            }}
          >
            <Package
              style={{
                width: 64,
                height: 64,
                color: "#f0e0e8",
                marginBottom: "20px",
              }}
            />
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#1a1a1a",
                marginBottom: "8px",
              }}
            >
              {searchQuery.trim()
                ? `Sin resultados para "${searchQuery.trim()}"`
                : `No tienes pedidos ${filterStatus !== "all" ? "en este estado" : ""}`}
            </h3>
            <p
              style={{ fontSize: "14px", color: "#888", marginBottom: "24px" }}
            >
              {searchQuery.trim()
                ? "Intenta buscar por otro ID o fecha. Ejemplo: 2025-01-15"
                : "Realiza tu primera compra desde el catálogo"}
            </p>
            {searchQuery.trim() ? (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  padding: "12px 28px",
                  borderRadius: "10px",
                  background: "#f9fafb",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "1px solid #e5e7eb",
                  cursor: "pointer",
                }}
              >
                Limpiar búsqueda
              </button>
            ) : (
              <button
                onClick={() => onNavigate?.("catalogo")}
                style={{
                  padding: "12px 28px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Ir al Catálogo
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPedidos.map((pedido) => (
              <div
                key={pedido.id}
                style={{
                  background: "#fff8fb",
                  border: "1px solid #f0d5e0",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 4px 12px rgba(196,123,150,0.08)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#c47b96";
                  e.currentTarget.style.boxShadow =
                    "0 10px 15px -3px rgba(196,123,150,0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#f0d5e0";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(196,123,150,0.08)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "10px",
                        background: "#fcfcfc",
                        border: "1px solid #d1d5db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Package
                        style={{ width: 22, height: 22, color: "#4b5563" }}
                      />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#1a1a1a",
                          margin: "0 0 6px 0",
                        }}
                      >
                        Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {!pedido.pago_confirmado ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 600,
                              background: "#f5f0ff",
                              color: "#7c3aed",
                              border: "1px solid #e9d5ff",
                            }}
                          >
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />{" "}
                            Verificando Pago
                          </span>
                        ) : (
                          <StatusBadge status={pedido.estado} size="sm" />
                        )}
                        <span
                          style={{ fontSize: "12px", color: "#999", margin: 0 }}
                        >
                          • {formatDate(pedido.fecha)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#b06080",
                      margin: 0,
                    }}
                  >
                    {formatCurrency(pedido.total)}
                  </p>
                </div>

                <div className="mb-4 space-y-2">
                  {pedido.productos
                    .slice(0, 2)
                    .map((item: any, index: number) => {
                      const producto = productos.find(
                        (p) => p.id === item.productoId,
                      );
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span style={{ color: "#1a1a1a", fontSize: "13px" }}>
                            {producto?.nombre} (x{item.cantidad})
                          </span>
                          <span style={{ color: "#666", fontSize: "13px" }}>
                            {formatCurrency(
                              item.precioUnitario * item.cantidad,
                            )}
                          </span>
                        </div>
                      );
                    })}
                  {pedido.productos.length > 2 && (
                    <p
                      className="text-foreground-secondary"
                      style={{ fontSize: "13px" }}
                    >
                      +{pedido.productos.length - 2} producto(s) más
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    onClick={() => handleViewDetail(pedido)}
                    disabled={isLoadingDetail}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      background: "#fff",
                      border: "1px solid #d1d5db",
                      color: "#374151",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#c47b96";
                      e.currentTarget.style.color = "#c47b96";
                      e.currentTarget.style.background = "#fdf4f7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.color = "#374151";
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    {isLoadingDetail && selectedPedido?.id === pedido.id ? (
                      <Loader2
                        style={{ width: 14, height: 14 }}
                        className="animate-spin"
                      />
                    ) : (
                      "Ver Detalle"
                    )}
                  </button>
                  <button
                    onClick={() => handlePrintInvoice(pedido)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      background: "#fff",
                      border: "1px solid #d1d5db",
                      color: "#374151",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#c47b96";
                      e.currentTarget.style.color = "#c47b96";
                      e.currentTarget.style.background = "#fdf4f7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.color = "#374151";
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <FileText style={{ width: 14, height: 14 }} />
                    PDF
                  </button>
                  {/* Cancelar — solo pendiente */}
                  {pedido.estado === "pendiente" && (
                    <button
                      onClick={() => {
                        setPedidoToCancel(pedido);
                        setShowCancelConfirm(true);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        background: "#fff",
                        border: "1px solid #d1d5db",
                        color: "#374151",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#ef4444";
                        e.currentTarget.style.color = "#ef4444";
                        e.currentTarget.style.background = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.color = "#374151";
                        e.currentTarget.style.background = "#fff";
                      }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                      Cancelar pedido
                    </button>
                  )}
                  {canRequestReturn(pedido) && (
                    <button
                      onClick={() => {
                        setPedidoToReturn(pedido);
                        setShowReturnDialog(true);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        background: "#fff",
                        border: "1px solid #d1d5db",
                        color: "#374151",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#ef4444";
                        e.currentTarget.style.color = "#ef4444";
                        e.currentTarget.style.background = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.color = "#374151";
                        e.currentTarget.style.background = "#fff";
                      }}
                    >
                      <RotateCcw style={{ width: 14, height: 14 }} />
                      Solicitar Devolución
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={showDetail}
        onOpenChange={(open: boolean) => {
          setShowDetail(open);
          if (!open) setSelectedPedido(null);
        }}
      >
        <DialogContent
          style={{
            width: "960px",
            maxWidth: "94vw",
            height: "600px",
            padding: 0,
            border: "1px solid #f3f4f6",
            borderRadius: "14px",
            overflow: "hidden",
            background: "#ffffff",
            boxShadow: "0 8px 40px rgba(46,16,32,0.12)",
          }}
        >
          {selectedPedido && (
            <div style={{ display: "flex", height: "100%", width: "100%" }}>
              {/* ── LEFT PANEL ── */}
              <div
                style={{
                  width: "340px",
                  flexShrink: 0,
                  height: "100%",
                  padding: "28px 28px",
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                  borderRight: "1px solid #f3f4f6",
                  background:
                    "linear-gradient(160deg, #fdf8fa 0%, #ffffff 100%)",
                }}
              >
                {/* Top content */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                    flex: 1,
                  }}
                >
                  {/* Order ID */}
                  <div>
                    <p
                      style={{
                        fontSize: "9px",
                        fontWeight: 900,
                        letterSpacing: "4px",
                        textTransform: "uppercase",
                        color: "#c47b96",
                        opacity: 0.8,
                        marginBottom: "4px",
                      }}
                    >
                      Pedido
                    </p>
                    <h2
                      style={{
                        fontSize: "26px",
                        fontWeight: 900,
                        color: "#1f2937",
                        letterSpacing: "-0.5px",
                        margin: 0,
                      }}
                    >
                      #{selectedPedido.id.slice(0, 8).toUpperCase()}
                    </h2>
                  </div>

                  {/* Status row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <StatusBadge status={selectedPedido.estado} size="sm" />
                    {selectedPedido.pago_confirmado && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 12px",
                          borderRadius: "999px",
                          background: "rgba(34,197,94,0.1)",
                          border: "1px solid rgba(34,197,94,0.25)",
                        }}
                      >
                        <CheckCircle2
                          style={{ width: 12, height: 12, color: "#16a34a" }}
                        />
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 900,
                            color: "#16a34a",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                          }}
                        >
                          Pago OK
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shipping info */}
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      background: "#f9fafb",
                      border: "1px solid #f3f4f6",
                    }}
                  >
                    {selectedPedido.estado === "enviado" ||
                    selectedPedido.estado === "entregado" ? (
                      selectedPedido.numero_guia ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Truck
                              style={{
                                width: 14,
                                height: 14,
                                color: "#c47b96",
                              }}
                            />
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 900,
                                letterSpacing: "3px",
                                textTransform: "uppercase",
                                color: "#c47b96",
                              }}
                            >
                              Datos de Envío
                            </span>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "16px",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  fontSize: "9px",
                                  fontWeight: 900,
                                  color: "#9ca3af",
                                  textTransform: "uppercase",
                                  letterSpacing: "2px",
                                  marginBottom: "4px",
                                }}
                              >
                                Empresa
                              </p>
                              <p
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#1f2937",
                                  margin: 0,
                                }}
                              >
                                {selectedPedido.transportadora}
                              </p>
                            </div>
                            <div>
                              <p
                                style={{
                                  fontSize: "9px",
                                  fontWeight: 900,
                                  color: "#9ca3af",
                                  textTransform: "uppercase",
                                  letterSpacing: "2px",
                                  marginBottom: "4px",
                                }}
                              >
                                N. Guía
                              </p>
                              <p
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#c47b96",
                                  fontFamily: "monospace",
                                  margin: 0,
                                }}
                              >
                                {selectedPedido.numero_guia}
                              </p>
                            </div>
                          </div>
                          {selectedPedido.tracking_link && (
                            <a
                              href={selectedPedido.tracking_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "block",
                                textAlign: "center",
                                padding: "10px",
                                borderRadius: "8px",
                                background: "#c47b96",
                                color: "#fff",
                                fontSize: "9px",
                                fontWeight: 900,
                                letterSpacing: "3px",
                                textTransform: "uppercase",
                                textDecoration: "none",
                              }}
                            >
                              Rastrear Pedido
                            </a>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <Truck
                            style={{
                              width: 18,
                              height: 18,
                              color: "#c47b96",
                              flexShrink: 0,
                            }}
                          />
                          <p
                            style={{
                              fontSize: "11px",
                              color: "#6b7280",
                              margin: 0,
                              lineHeight: 1.5,
                            }}
                          >
                            Tu pedido está en camino. Los datos de guía estarán
                            disponibles pronto.
                          </p>
                        </div>
                      )
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <Clock
                          style={{
                            width: 18,
                            height: 18,
                            color: "#d1d5db",
                            flexShrink: 0,
                          }}
                        />
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                            fontStyle: "italic",
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          Tu pedido se está preparando. Pronto verás los datos
                          de envío aquí.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <MapPin
                      style={{
                        width: 14,
                        height: 14,
                        color: "#c47b96",
                        marginTop: "3px",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "9px",
                          fontWeight: 900,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: "2px",
                          marginBottom: "4px",
                        }}
                      >
                        Entrega en
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#374151",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {selectedPedido.direccion ||
                          selectedPedido.direccionEnvio}
                        <br />
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                          }}
                        >
                          {selectedPedido.ciudad || "Colombia"}
                        </span>
                      </p>
                      {/* Botón cambiar dirección — solo pendiente o preparado */}
                      {["pendiente", "preparado"].includes(
                        selectedPedido.estado,
                      ) && (
                        <button
                          onClick={() => {
                            setEditDireccion(
                              selectedPedido.direccion ||
                                selectedPedido.direccionEnvio ||
                                "",
                            );
                            setShowEditDir(true);
                          }}
                          style={{
                            marginTop: "8px",
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#c47b96",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            textDecoration: "underline",
                          }}
                        >
                          Cambiar dirección
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <Calendar
                      style={{
                        width: 14,
                        height: 14,
                        color: "#c47b96",
                        marginTop: "3px",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: "9px",
                          fontWeight: 900,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: "2px",
                          marginBottom: "4px",
                        }}
                      >
                        Fecha
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#374151",
                          margin: 0,
                        }}
                      >
                        {formatDate(selectedPedido.fecha)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total at bottom */}
                <div
                  style={{
                    borderTop: "1px solid #f3f4f6",
                    paddingTop: "16px",
                    marginTop: "18px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "9px",
                      fontWeight: 900,
                      color: "#c47b96",
                      textTransform: "uppercase",
                      letterSpacing: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    Total
                  </p>
                  <p
                    style={{
                      fontSize: "28px",
                      fontWeight: 900,
                      color: "#1f2937",
                      letterSpacing: "-1px",
                      margin: 0,
                    }}
                  >
                    {formatCurrency(selectedPedido.total)}
                  </p>
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div
                style={{
                  flex: 1,
                  height: "100%",
                  padding: "28px 28px",
                  display: "flex",
                  flexDirection: "column",
                  background: "#fafafa",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "28px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Package
                      style={{ width: 16, height: 16, color: "#c47b96" }}
                    />
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 900,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "4px",
                      }}
                    >
                      Artículos ({selectedPedido.productos.length})
                    </span>
                  </div>
                  <div
                    style={{
                      width: "40px",
                      height: "2px",
                      background: "#f0d5e0",
                      borderRadius: "2px",
                    }}
                  />
                </div>

                {/* Product list */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    paddingRight: "8px",
                  }}
                >
                  {selectedPedido.productos.map((item: any, i: number) => {
                    const producto = productos.find(
                      (p) => p.id === item.productoId,
                    );
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: "14px 16px",
                          borderRadius: "10px",
                          background: "#ffffff",
                          border: "1px solid #f3f4f6",
                          transition: "all 0.2s",
                        }}
                      >
                        {/* Image */}
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            background: "#f9fafb",
                            border: "1px solid #f3f4f6",
                            flexShrink: 0,
                          }}
                        >
                          {producto?.imagenUrl ? (
                            <img
                              src={producto.imagenUrl}
                              alt={producto?.nombre}
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
                                fontSize: "20px",
                              }}
                            >
                              💄
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: 800,
                              color: "#1f2937",
                              margin: "0 0 4px 0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {producto?.nombre || "Producto"}
                          </p>
                          <p
                            style={{
                              fontSize: "10px",
                              color: "#9ca3af",
                              margin: 0,
                            }}
                          >
                            {producto?.marca || "Glamour ML"} · {item.cantidad}{" "}
                            uni. · {formatCurrency(item.precioUnitario)} c/u
                          </p>
                        </div>

                        {/* Subtotal */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p
                            style={{
                              fontSize: "16px",
                              fontWeight: 900,
                              color: "#1f2937",
                              margin: 0,
                            }}
                          >
                            {formatCurrency(
                              item.cantidad * item.precioUnitario,
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Close button */}
                <div
                  style={{
                    marginTop: "24px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => setShowDetail(false)}
                    style={{
                      padding: "11px 28px",
                      borderRadius: "8px",
                      background: "#c47b96",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 900,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar cancelación */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#fff1f2",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.12)",
                }}
              >
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Cancelar Pedido
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-0.5">
                  Esta acción no se puede deshacer
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <div
              style={{
                background: "#fef2f2",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                border: "1px solid #fecaca",
              }}
            >
              <AlertCircle
                style={{
                  color: "#ef4444",
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
                  }}
                >
                  ¿Estás segura de cancelar el pedido{" "}
                  <strong>
                    #{pedidoToCancel?.id?.slice(0, 8).toUpperCase()}
                  </strong>
                  ?
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  El stock de los productos será devuelto automáticamente.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
              disabled={isCancelling}
            >
              Volver
            </Button>
            <Button
              onClick={handleCancelPedido}
              disabled={isCancelling}
              style={{ backgroundColor: "#ef4444", color: "#ffffff" }}
              className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
            >
              {isCancelling ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Cancelando...
                </div>
              ) : (
                "Sí, cancelar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Cambiar dirección */}
      <Dialog open={showEditDir} onOpenChange={setShowEditDir}>
        <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
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
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Cambiar Dirección
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-0.5">
                  Pedido #{selectedPedido?.id?.slice(0, 8).toUpperCase()}
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => setShowEditDir(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Nueva dirección de envío
            </label>
            <input
              value={editDireccion}
              onChange={(e) => setEditDireccion(e.target.value)}
              placeholder="Ej: Calle 50 #30-20, Medellín"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 text-sm"
              maxLength={100}
            />
          </div>
          <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowEditDir(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
              disabled={isSavingDir}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveDireccion}
              disabled={isSavingDir}
              className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
              style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
            >
              {isSavingDir ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Devolución */}
      <PedidoReturnDialog
        open={showReturnDialog}
        onOpenChange={setShowReturnDialog}
        pedido={pedidoToReturn}
        productosStore={productos}
      />

      {/* Hidden Invoice to Print */}

      {selectedPedido && (
        <div
          className="fixed left-0 top-0 w-full h-auto bg-white p-10 z-[-9999] opacity-0 pointer-events-none printable-invoice"
          style={{ visibility: "hidden" }}
        >
          {/* Barra superior vino tinto */}
          <div
            style={{
              height: "4px",
              background: "#2e1020",
              marginBottom: "32px",
              marginLeft: "-40px",
              marginRight: "-40px",
            }}
          />

          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <img
                src="/logo.png"
                alt="Glamour ML"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  objectFit: "cover",
                }}
              />
              <div>
                <h1
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#2e1020" }}
                >
                  GLAMOUR ML
                </h1>
                <p className="text-gray-500 text-sm">
                  TIENDA DE BELLEZA & CUIDADO PERSONAL
                </p>
                <p className="text-gray-400 text-xs">Medellín, Colombia</p>
              </div>
            </div>
            <div className="text-right">
              <div
                className="px-6 py-4 rounded-xl"
                style={{ border: "2px solid #c47b96" }}
              >
                <p
                  className="font-bold text-sm uppercase tracking-widest mb-1 text-center"
                  style={{ color: "#c47b96" }}
                >
                  COMPROBANTE DE PEDIDO
                </p>
                <p
                  className="font-bold text-2xl text-center"
                  style={{ color: "#2e1020" }}
                >
                  #{selectedPedido.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <p className="text-gray-600 text-sm mt-3">
                Fecha:{" "}
                <span className="font-bold" style={{ color: "#2e1020" }}>
                  {formatDate(selectedPedido.fecha)}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12 py-8 border-t border-b border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                DATOS DEL CLIENTE
              </p>
              <p className="font-bold text-lg" style={{ color: "#2e1020" }}>
                {currentUser?.nombres || "Cliente"}{" "}
                {currentUser?.apellidos || ""}
              </p>
              <p className="text-gray-600">{currentUser?.email || "N/A"}</p>
              <p className="text-gray-600">{currentUser?.telefono || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                DIRECCIÓN DE ENVÍO
              </p>
              <p className="font-medium" style={{ color: "#2e1020" }}>
                {selectedPedido.direccionEnvio}
              </p>
              <p className="text-gray-600">Medellín, CO</p>
              <p className="text-gray-600 mt-1">
                Estado:{" "}
                <span
                  className="font-bold uppercase"
                  style={{ color: "#c47b96" }}
                >
                  {selectedPedido.estado}
                </span>
              </p>
            </div>
          </div>

          <table className="w-full mb-12">
            <thead>
              <tr
                className="text-xs font-bold uppercase tracking-widest"
                style={{ borderBottom: "2px solid #2e1020", color: "#2e1020" }}
              >
                <th className="py-4 text-left">Descripción del Artículo</th>
                <th className="py-4 text-center">Cantidad</th>
                <th className="py-4 text-right">Precio Unit.</th>
                <th className="py-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedPedido.productos.map((item: any, i: number) => {
                const producto = productos.find(
                  (p) => p.id === item.productoId,
                );
                return (
                  <tr
                    key={i}
                    className="text-sm"
                    style={{
                      background: i % 2 !== 0 ? "#f9fafb" : "transparent",
                    }}
                  >
                    <td className="py-4">
                      <p className="font-bold" style={{ color: "#2e1020" }}>
                        {producto?.nombre || "Producto no identificado"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {producto?.marca || "Glamour ML"}
                      </p>
                    </td>
                    <td
                      className="py-4 text-center font-medium"
                      style={{ color: "#2e1020" }}
                    >
                      {item.cantidad}
                    </td>
                    <td className="py-4 text-right text-gray-600">
                      {formatCurrency(item.precioUnitario)}
                    </td>
                    <td
                      className="py-4 text-right font-bold"
                      style={{ color: "#2e1020" }}
                    >
                      {formatCurrency(item.cantidad * item.precioUnitario)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div
            className="flex justify-end pt-8"
            style={{ borderTop: "2px solid #2e1020" }}
          >
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(selectedPedido.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Envío:</span>
                <span className="font-bold text-green-600">EXENTO</span>
              </div>
              <div
                className="flex justify-between text-2xl font-bold pt-3 border-t border-gray-100"
                style={{ color: "#2e1020" }}
              >
                <span>TOTAL:</span>
                <span>{formatCurrency(selectedPedido.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center bg-gray-50 p-6 rounded-xl">
            <p className="text-gray-400 text-xs italic mb-2">
              Comprobante digital. Su validez legal está sujeta a la normativa
              vigente.
            </p>
            <p className="font-bold text-sm" style={{ color: "#c47b96" }}>
              Gracias por tu confianza en GLAMOUR ML
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
