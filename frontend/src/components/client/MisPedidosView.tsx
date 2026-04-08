import { useState } from "react";
import { useStore } from "../../lib/store";
import { StatusBadge } from "../StatusBadge";
import { Dialog, DialogContent } from "../ui/dialog";
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
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { toast } from "sonner";

export function MisPedidosView({
  onNavigate,
}: { onNavigate?: (route: string) => void } = {}) {
  const { pedidos, clientes, productos, currentUser } = useStore();
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Get current client ID
  const currentCliente = clientes.find((c) => c.email === currentUser?.email);
  const myId = currentCliente?.id || currentUser?.id;

  // Filter pedidos for current client
  const misPedidos = pedidos.filter((p) => p.clienteId === myId);

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

  const filteredPedidos =
    filterStatus === "all"
      ? misPedidos
      : misPedidos.filter((p) => p.estado === filterStatus);

  const canRequestReturn = (pedido: any) => {
    if (pedido.estado !== "entregado") return false;
    const pedidoDate = new Date(pedido.fecha);
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - pedidoDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 30;
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
        productos: (fullOrder.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(),
          cantidad: i.cantidad,
          precioUnitario: i.precio_unitario || 0,
        })),
      };
      setSelectedPedido(completePedido);
      setTimeout(() => {
        window.print();
      }, 150);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar factura");
    } finally {
      setIsLoadingDetail(false);
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f8' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Truck style={{ width: 28, height: 28, color: '#b06080' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              Mis Pedidos
            </h1>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              style={{
                padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                background: filterStatus === "all" ? 'linear-gradient(135deg, #c47b96 0%, #a85d77 100%)' : 'transparent',
                color: filterStatus === "all" ? '#fff' : '#666',
              }}
            >
              Todos ({misPedidos.length})
            </button>
            <button
              onClick={() => setFilterStatus("pendiente")}
              style={{
                padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                background: filterStatus === "pendiente" ? 'linear-gradient(135deg, #c47b96 0%, #a85d77 100%)' : 'transparent',
                color: filterStatus === "pendiente" ? '#fff' : '#666',
              }}
            >
              Pendientes ({misPedidos.filter((p) => p.estado === "pendiente").length})
            </button>
            <button
              onClick={() => setFilterStatus("enviado")}
              style={{
                padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                background: filterStatus === "enviado" ? 'linear-gradient(135deg, #c47b96 0%, #a85d77 100%)' : 'transparent',
                color: filterStatus === "enviado" ? '#fff' : '#666',
              }}
            >
              En camino ({misPedidos.filter((p) => p.estado === "enviado").length})
            </button>
            <button
              onClick={() => setFilterStatus("entregado")}
              style={{
                padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                background: filterStatus === "entregado" ? 'linear-gradient(135deg, #c47b96 0%, #a85d77 100%)' : 'transparent',
                color: filterStatus === "entregado" ? '#fff' : '#666',
              }}
            >
              Entregados ({misPedidos.filter((p) => p.estado === "entregado").length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {filteredPedidos.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <Package style={{ width: 64, height: 64, color: '#f0e0e8', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
              No tienes pedidos {filterStatus !== "all" && "en este estado"}
            </h3>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px' }}>
              Realiza tu primera compra desde el catálogo
            </p>
            <button
              onClick={() => onNavigate?.("catalogo")}
              style={{
                padding: '12px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #c47b96 0%, #a85d77 100%)',
                color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPedidos.map((pedido) => (
              <div
                key={pedido.id}
                style={{
                  background: '#fff', border: '1px solid #d1d5db', borderRadius: '12px', padding: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c47b96'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(176,96,128,0.1), 0 4px 6px -2px rgba(176,96,128,0.05)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fcfcfc', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package style={{ width: 22, height: 22, color: '#4b5563' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px 0' }}>
                        Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!pedido.pago_confirmado ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: '#f5f0ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Verificando Pago
                          </span>
                        ) : (
                          <StatusBadge status={pedido.estado} size="sm" />
                        )}
                        <span style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                          • {formatDate(pedido.fecha)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#b06080', margin: 0 }}>
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
                          <span style={{ color: '#1a1a1a', fontSize: '13px' }}>
                            {producto?.nombre} (x{item.cantidad})
                          </span>
                          <span style={{ color: '#666', fontSize: '13px' }}>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={() => handleViewDetail(pedido)}
                    disabled={isLoadingDetail}
                    style={{
                      padding: '8px 16px', borderRadius: '20px', background: '#fff', border: '1px solid #d1d5db',
                      color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c47b96'; e.currentTarget.style.color = '#c47b96'; e.currentTarget.style.background = '#fdf4f7'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#fff'; }}
                  >
                    {isLoadingDetail && selectedPedido?.id === pedido.id ? (
                      <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                    ) : (
                      "Ver Detalle"
                    )}
                  </button>
                  <button
                    onClick={() => handlePrintInvoice(pedido)}
                    style={{
                      padding: '8px 16px', borderRadius: '20px', background: '#fff', border: '1px solid #d1d5db',
                      color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c47b96'; e.currentTarget.style.color = '#c47b96'; e.currentTarget.style.background = '#fdf4f7'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#fff'; }}
                  >
                    <FileText style={{ width: 14, height: 14 }} />
                    Factura
                  </button>
                  {canRequestReturn(pedido) && (
                    <button
                      style={{
                        padding: '8px 16px', borderRadius: '20px', background: '#fff', border: '1px solid #d1d5db',
                        color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#fff'; }}
                    >
                      <RotateCcw style={{ width: 14, height: 14 }} />
                      Devolver
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
            border: "none",
            borderRadius: "14px",
            overflow: "hidden",
            background: "#130b10",
            boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
          }}
        >
          {selectedPedido && (
            <div style={{ display: "flex", height: "100%", width: "100%" }}>

              {/* ── LEFT PANEL ── */}
              <div style={{
                width: "340px",
                flexShrink: 0,
                height: "100%",
                padding: "28px 28px",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                background: "linear-gradient(160deg, rgba(52,18,36,0.5) 0%, #130b10 100%)",
              }}>

                {/* Top content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1 }}>

                  {/* Order ID */}
                  <div>
                    <p style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase", color: "#e092b2", opacity: 0.7, marginBottom: "4px" }}>
                      Pedido
                    </p>
                    <h2 style={{ fontSize: "26px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", margin: 0 }}>
                      #{selectedPedido.id.slice(0, 8).toUpperCase()}
                    </h2>
                  </div>

                  {/* Status row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <StatusBadge status={selectedPedido.estado} size="sm" />
                    {selectedPedido.pago_confirmado && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "4px 12px", borderRadius: "999px",
                        background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                      }}>
                        <CheckCircle2 style={{ width: 12, height: 12, color: "#4ade80" }} />
                        <span style={{ fontSize: "9px", fontWeight: 900, color: "#4ade80", letterSpacing: "2px", textTransform: "uppercase" }}>
                          Pago OK
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shipping info */}
                  <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {(selectedPedido.estado === "enviado" || selectedPedido.estado === "entregado") && selectedPedido.numero_guia ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Truck style={{ width: 14, height: 14, color: "#e092b2" }} />
                          <span style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "3px", textTransform: "uppercase", color: "#e092b2" }}>Envío</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          <div>
                            <p style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>Empresa</p>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.9)", margin: 0 }}>{selectedPedido.transportadora}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>N. Guía</p>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "#e092b2", fontFamily: "monospace", margin: 0 }}>{selectedPedido.numero_guia}</p>
                          </div>
                        </div>
                        {selectedPedido.tracking_link && (
                          <a
                            href={selectedPedido.tracking_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "block", textAlign: "center",
                              padding: "10px", borderRadius: "8px",
                              background: "#e092b2", color: "#fff",
                              fontSize: "9px", fontWeight: 900,
                              letterSpacing: "3px", textTransform: "uppercase",
                              textDecoration: "none",
                            }}
                          >
                            Rastrear
                          </a>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Clock style={{ width: 18, height: 18, color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
                          Tu pedido se está preparando. Pronto verás los datos de envío aquí.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <MapPin style={{ width: 14, height: 14, color: "#e092b2", marginTop: "3px", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>Entrega en</p>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>
                        {selectedPedido.direccion || selectedPedido.direccionEnvio}<br />
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                          {selectedPedido.ciudad || "Colombia"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <Calendar style={{ width: 14, height: 14, color: "#e092b2", marginTop: "3px", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "9px", fontWeight: 900, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>Fecha</p>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: 0 }}>{formatDate(selectedPedido.fecha)}</p>
                    </div>
                  </div>
                </div>

                {/* Total at bottom */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", marginTop: "18px" }}>
                  <p style={{ fontSize: "9px", fontWeight: 900, color: "#e092b2", textTransform: "uppercase", letterSpacing: "4px", marginBottom: "4px" }}>Total</p>
                  <p style={{ fontSize: "28px", fontWeight: 900, color: "#fff", letterSpacing: "-1px", margin: 0 }}>
                    {formatCurrency(selectedPedido.total)}
                  </p>
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div style={{
                flex: 1,
                height: "100%",
                padding: "28px 28px",
                display: "flex",
                flexDirection: "column",
                background: "rgba(0,0,0,0.25)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Package style={{ width: 16, height: 16, color: "#e092b2" }} />
                    <span style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "4px" }}>
                      Artículos ({selectedPedido.productos.length})
                    </span>
                  </div>
                  <div style={{ width: "40px", height: "2px", background: "rgba(224,146,178,0.3)", borderRadius: "2px" }} />
                </div>

                {/* Product list */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "8px" }}>
                  {selectedPedido.productos.map((item: any, i: number) => {
                    const producto = productos.find((p) => p.id === item.productoId);
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex", alignItems: "center", gap: "14px",
                          padding: "14px 16px", borderRadius: "10px",
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          transition: "all 0.2s",
                        }}
                      >
                        {/* Image */}
                        <div style={{
                          width: "52px", height: "52px",
                          borderRadius: "8px", overflow: "hidden",
                          background: "rgba(0,0,0,0.4)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          flexShrink: 0,
                        }}>
                          {producto?.imagenUrl ? (
                            <img src={producto.imagenUrl} alt={producto?.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>💄</div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 800, color: "#fff", margin: "0 0 4px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {producto?.nombre || "Producto"}
                          </p>
                          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                            {producto?.marca || "Glamour ML"} · {item.cantidad} uni. · {formatCurrency(item.precioUnitario)} c/u
                          </p>
                        </div>

                        {/* Subtotal */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: "16px", fontWeight: 900, color: "#fff", margin: 0 }}>
                            {formatCurrency(item.cantidad * item.precioUnitario)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Close button */}
                <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setShowDetail(false)}
                    style={{
                      padding: "11px 28px", borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "10px", fontWeight: 900,
                      letterSpacing: "3px", textTransform: "uppercase",
                      cursor: "pointer", transition: "all 0.2s",
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


      {/* Hidden Invoice to Print */}
      {selectedPedido && (
        <div
          className="fixed left-0 top-0 w-full h-auto bg-white p-10 z-[-9999] opacity-0 pointer-events-none printable-invoice"
          style={{ visibility: "hidden" }}
        >
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-bold text-pink-500 mb-2">
                GLAMOUR ML
              </h1>
              <p className="text-gray-500 text-sm">
                Medellín, Antioquia, Colombia
              </p>
              <p className="text-gray-500 text-sm">NIT: 123.456.789-0</p>
              <p className="text-gray-500 text-sm">
                Contacto: administracion@glamourml.com
              </p>
            </div>
            <div className="text-right">
              <div className="border-2 border-pink-500 px-6 py-4 rounded-2xl">
                <p className="text-pink-500 font-bold text-sm uppercase tracking-widest mb-1 text-center">
                  FACTURA DE VENTA
                </p>
                <p className="text-black font-bold text-2xl text-center">
                  #{selectedPedido.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <p className="text-gray-600 text-sm mt-3">
                Fecha de Emisión:{" "}
                <span className="text-black font-bold">
                  {formatDate(selectedPedido.fecha)}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12 py-8 border-t border-b border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                DATOS DEL CLIENTE
              </p>
              <p className="text-black font-bold text-lg">
                {currentUser?.nombres || "Cliente"}{" "}
                {currentUser?.apellidos || ""}
              </p>
              <p className="text-gray-600">{currentUser?.email || "N/A"}</p>
              <p className="text-gray-600">{currentUser?.telefono || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                DIRECCIÓN DE ENVÍO
              </p>
              <p className="text-black font-medium">
                {selectedPedido.direccionEnvio}
              </p>
              <p className="text-gray-600">Medellín, CO</p>
              <p className="text-gray-600">
                Estado Pedido:{" "}
                <span className="font-bold text-pink-500 uppercase">
                  {selectedPedido.estado}
                </span>
              </p>
            </div>
          </div>

          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-pink-500 text-xs font-bold text-pink-600 uppercase tracking-widest">
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
                  <tr key={i} className="text-sm">
                    <td className="py-5">
                      <p className="font-bold text-black">
                        {producto?.nombre || "Producto no identificado"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {producto?.marca || "Glamour ML"}
                      </p>
                    </td>
                    <td className="py-5 text-center text-black font-medium">
                      {item.cantidad}
                    </td>
                    <td className="py-5 text-right text-gray-600">
                      {formatCurrency(item.precioUnitario)}
                    </td>
                    <td className="py-5 text-right font-bold text-black">
                      {formatCurrency(item.cantidad * item.precioUnitario)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end pt-8 border-t-2 border-pink-500">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Total Gravado:</span>
                <span>{formatCurrency(selectedPedido.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Envío:</span>
                <span className="text-green-600 font-bold">EXENTO</span>
              </div>
              <div className="flex justify-between text-3xl font-bold text-pink-600 pt-3 border-t-2 border-gray-100">
                <span>TOTAL A PAGAR:</span>
                <span>{formatCurrency(selectedPedido.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-32 text-center bg-gray-50 p-6 rounded-2xl">
            <p className="text-gray-500 text-xs italic mb-2">
              Factura digital. Su validez legal está sujeta a la normativa
              vigente.
            </p>
            <p className="text-pink-500 font-bold text-sm">
              Gracias por tu confianza en GLAMOUR ML
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
