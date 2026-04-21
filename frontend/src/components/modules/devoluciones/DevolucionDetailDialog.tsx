import {
  X,
  Building2,
  Calendar,
  FileText,
  Download,
  Package,
  Hash,
  CheckCircle2,
  XCircle,
  User,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { formatCurrency, getEstadoColor } from "../../../utils/devolucionUtils";

interface DevolucionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devolucion: any;
  clientes: any[];
  productos: any[];
}

export function DevolucionDetailDialog({
  open,
  onOpenChange,
  devolucion,
  clientes,
  productos,
}: DevolucionDetailDialogProps) {
  if (!devolucion) return null;

  const cliente = clientes.find((c) => c.id === devolucion.clienteId);
  const statusInfo = getEstadoColor(devolucion.estado);
  const itemCount = (devolucion.productos || []).length;

  const isAprobada = devolucion.estado === "aprobada";
  const isAnulada = devolucion.estado === "anulada";
  const isRechazada = devolucion.estado === "rechazada";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-0 rounded-2xl shadow-2xl p-0 flex flex-col"
        style={{
          backgroundColor: "#fff",
          width: "95vw",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          className="shrink-0 px-6 py-5"
          style={{ background: "linear-gradient(135deg, #2e1020 0%, #4a2035 100%)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 40, height: 40,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <FileText style={{ width: 18, height: 18, color: "white" }} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white" style={{ lineHeight: 1.3 }}>
                  Detalle de Devolución
                </DialogTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <Hash style={{ width: 12, height: 12, color: "rgba(255,255,255,0.5)" }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 700, fontFamily: "monospace" }}>
                    DEV-{devolucion.id}
                    {devolucion.ventaId ? ` · Venta #${devolucion.ventaId}` : ""}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Status badge */}
              <span
                className="flex items-center gap-1.5 rounded-full"
                style={{
                  fontSize: 11, fontWeight: 800, padding: "5px 12px",
                  backgroundColor: isAprobada ? "rgba(34,197,94,0.15)" : isAnulada || isRechazada ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)",
                  color: isAprobada ? "#16a34a" : isAnulada || isRechazada ? "#dc2626" : "#ca8a04",
                }}
              >
                {isAprobada ? <CheckCircle2 style={{ width: 13, height: 13 }} /> : (isAnulada || isRechazada) ? <XCircle style={{ width: 13, height: 13 }} /> : null}
                {statusInfo.label}
              </span>
              <button
                onClick={() => onOpenChange(false)}
                style={{ padding: 6, borderRadius: "50%", color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer" }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1" style={{ overflowY: "auto", padding: 24 }}>
          {/* Info Cards Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
            {/* Cliente */}
            <div style={{ backgroundColor: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                <User style={{ width: 14, height: 14, color: "#c47b96" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Cliente
                </span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                {devolucion.clienteNombre || cliente?.nombre || "N/A"}
              </p>
              {devolucion.emailCliente && (
                <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 0 0" }}>{devolucion.emailCliente}</p>
              )}
            </div>
            {/* Fecha */}
            <div style={{ backgroundColor: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                <Calendar style={{ width: 14, height: 14, color: "#c47b96" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Fecha
                </span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{devolucion.fecha}</p>
            </div>
            {/* Total */}
            <div style={{ backgroundColor: "#fdf2f6", borderRadius: 12, padding: "14px 16px", border: "1px solid #fad6e3" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Total Devuelto
              </span>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#c47b96", margin: 0 }}>
                {formatCurrency(devolucion.totalDevuelto)}
              </p>
            </div>
          </div>

          {/* Empleado & Venta Ref */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {devolucion.empleadoNombre && (
              <div style={{ backgroundColor: "#f9fafb", borderRadius: 12, padding: "12px 16px", border: "1px solid #f0f0f0" }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <Briefcase style={{ width: 14, height: 14, color: "#c47b96" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Procesada por</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{devolucion.empleadoNombre}</p>
              </div>
            )}
            {devolucion.ventaId && (
              <div style={{ backgroundColor: "#f9fafb", borderRadius: 12, padding: "12px 16px", border: "1px solid #f0f0f0" }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <FileText style={{ width: 14, height: 14, color: "#c47b96" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ref. Venta</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>#{devolucion.ventaId}</p>
              </div>
            )}
          </div>

          {/* Motivo */}
          <div style={{ backgroundColor: "#f9fafb", borderRadius: 12, padding: "12px 16px", border: "1px solid #f0f0f0", marginBottom: 24 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <MessageSquare style={{ width: 14, height: 14, color: "#c47b96" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Motivo</span>
            </div>
            <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>{devolucion.motivo}</p>
          </div>

          {/* Auditoría */}
          {(devolucion.motivoDecision || devolucion.motivoAnulacion) && (
            <div style={{ backgroundColor: "#fef2f2", borderRadius: 12, padding: "12px 16px", border: "1px solid #fecaca", marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Seguimiento de Auditoría
              </span>
              {devolucion.motivoDecision && (
                <p style={{ fontSize: 12, color: "#374151", margin: "0 0 4px 0" }}>
                  <strong style={{ color: "#6b7280" }}>Decisión:</strong>{" "}
                  <span style={{ fontStyle: "italic" }}>"{devolucion.motivoDecision}"</span>
                </p>
              )}
              {devolucion.motivoAnulacion && (
                <p style={{ fontSize: 12, color: "#991b1b", margin: "0 0 2px 0" }}>
                  <strong>Anulación:</strong>{" "}
                  <span style={{ fontStyle: "italic" }}>"{devolucion.motivoAnulacion}"</span>
                  {devolucion.fechaAnulacion && <span style={{ color: "#9ca3af", marginLeft: 8 }}>({devolucion.fechaAnulacion})</span>}
                </p>
              )}
            </div>
          )}

          {/* Productos Table */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <div className="flex items-center gap-2">
                <Package style={{ width: 15, height: 15, color: "#c47b96" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>Productos Devueltos</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#c47b96", backgroundColor: "#fdf2f6", padding: "4px 10px", borderRadius: 8 }}>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              {/* Table Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 80px 1fr 1fr",
                  gap: 0,
                  padding: "10px 16px",
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>Producto</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "center" }}>Cant.</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "right" }}>P. Unit.</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "right" }}>Subtotal</span>
              </div>

              {/* Table Body */}
              {(devolucion.productos || []).length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                  No hay productos cargados en detalle.
                </div>
              ) : (
                (devolucion.productos || []).map((item: any, i: number) => {
                  const prod = productos.find((p) => p.id === item.productoId);
                  const subtotal = item.subtotal || item.cantidad * (item.precioUnitario || 0);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 80px 1fr 1fr",
                        gap: 0,
                        padding: "12px 16px",
                        borderBottom: i < (devolucion.productos || []).length - 1 ? "1px solid #f3f4f6" : "none",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {item.productoNombre || prod?.nombre || "Producto desconocido"}
                        </span>
                        <span style={{ fontSize: 10, color: "#aaa" }}>ID: {item.productoId}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#374151", textAlign: "center" }}>
                        {item.cantidad}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textAlign: "right" }}>
                        {formatCurrency(item.precioUnitario || 0)}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#c47b96", textAlign: "right" }}>
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="shrink-0 flex items-center justify-end"
          style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", backgroundColor: "#fafafa", gap: 12 }}
        >
          <button
            onClick={() => onOpenChange(false)}
            style={{
              height: 42, padding: "0 28px", borderRadius: 10, fontWeight: 700, fontSize: 13,
              border: "none", backgroundColor: "#c47b96", color: "white", cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#b06a84")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#c47b96")}
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
