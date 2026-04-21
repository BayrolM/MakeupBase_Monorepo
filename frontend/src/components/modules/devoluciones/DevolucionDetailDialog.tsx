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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
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
      <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[900px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header con gradiente premium */}
        <div 
          className="flex items-center justify-between px-8 py-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #c47b96 0%, #e092b2 100%)" }}
        >
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white leading-tight">
                Detalle de Devolución
              </DialogTitle>
              <DialogDescription className="text-white font-bold mt-0.5 font-mono tracking-wider opacity-90">
                DEV-{devolucion.id}{devolucion.ventaId ? ` · VENTA #${devolucion.ventaId}` : ""}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10">
            <span
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm border border-white/20 backdrop-blur-sm"
              style={{
                backgroundColor: isAprobada ? "rgba(34,197,94,0.25)" : isAnulada || isRechazada ? "rgba(239,68,68,0.25)" : "rgba(234,179,8,0.25)",
                color: "#fff",
              }}
            >
              {isAprobada ? <CheckCircle2 className="w-3.5 h-3.5" /> : (isAnulada || isRechazada) ? <XCircle className="w-3.5 h-3.5" /> : null}
              {statusInfo.label}
            </span>
            <button
              onClick={() => onOpenChange(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* Body */}
        <div 
          className="no-scrollbar overflow-y-auto"
          style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: "24px", maxHeight: "65vh" }}
        >
          
          {/* Fila de Cards de Información */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div style={{ backgroundColor: "#f9fafb", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-[#c47b96]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</span>
              </div>
              <p className="text-sm font-bold text-gray-800 line-clamp-1">
                {devolucion.clienteNombre || cliente?.nombre || "N/A"}
              </p>
              {devolucion.emailCliente && (
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{devolucion.emailCliente}</p>
              )}
            </div>

            <div style={{ backgroundColor: "#f9fafb", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-[#c47b96]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
              </div>
              <p className="text-sm font-bold text-gray-800">
                {devolucion.fecha}
              </p>
            </div>

            <div style={{ background: "linear-gradient(to bottom right, #fdf2f6, #fffbff)", borderRadius: "16px", padding: "16px", border: "1px solid #fad6e3" }}>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-3.5 h-3.5 text-[#c47b96]" />
                <span className="text-[10px] font-bold text-[#c47b96] uppercase tracking-widest">Monto Total</span>
              </div>
              <p className="text-xl font-black text-[#c47b96]">
                {formatCurrency(devolucion.totalDevuelto)}
              </p>
            </div>
          </div>

          {/* Segunda Fila: Empleado y Ref Venta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {devolucion.empleadoNombre && (
              <div style={{ backgroundColor: "#f9fafb", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#c47b96]" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Procesada por</span>
                </div>
                <p className="text-sm font-bold text-gray-800">{devolucion.empleadoNombre}</p>
              </div>
            )}
            {devolucion.ventaId && (
              <div style={{ backgroundColor: "#f9fafb", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#c47b96]" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ref. Venta</span>
                </div>
                <p className="text-sm font-bold text-gray-800">Orden #{devolucion.ventaId}</p>
              </div>
            )}
          </div>

          {/* Motivo */}
          <div style={{ backgroundColor: "#f9fafb", borderRadius: "16px", padding: "16px", border: "1px solid #f3f4f6" }}>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#c47b96]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Motivo de la Devolución</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed italic">"{devolucion.motivo}"</p>
          </div>

          {/* Seguimiento Auditoría */}
          {(devolucion.motivoDecision || devolucion.motivoAnulacion) && (
            <div style={{ backgroundColor: "#fef2f2", borderRadius: "16px", padding: "16px", border: "1px solid #fecaca" }}>
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest block mb-2">Seguimiento de Auditoría</span>
              {devolucion.motivoDecision && (
                <p className="text-[12px] text-gray-700 mb-1">
                  <span className="font-bold">Decisión:</span> <span className="italic">"{devolucion.motivoDecision}"</span>
                </p>
              )}
              {devolucion.motivoAnulacion && (
                <p className="text-[12px] text-red-800">
                  <span className="font-bold">Anulación:</span> <span className="italic">"{devolucion.motivoAnulacion}"</span>
                  {devolucion.fechaAnulacion && <span className="text-gray-400 ml-2">({devolucion.fechaAnulacion})</span>}
                </p>
              )}
            </div>
          )}

          {/* Tabla de Productos */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#c47b96]" />
                <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Productos Devueltos</span>
              </div>
              <span className="text-[10px] font-black text-[#c47b96] bg-[#fff0f5] px-3 py-1 rounded-full uppercase">
                {itemCount} {itemCount === 1 ? "ítem" : "ítems"}
              </span>
            </div>

            <div style={{ border: "1px solid #f3f4f6", borderRadius: "16px", overflow: "hidden" }}>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-[#f9fafb] border-b border-gray-100">
                <div className="col-span-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Producto</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Cant.</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">P. Unit.</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Subtotal</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-50 bg-white">
                {(devolucion.productos || []).length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm italic">No hay productos registrados</div>
                ) : (
                  (devolucion.productos || []).map((item: any, i: number) => {
                    const prod = productos.find((p) => p.id === item.productoId);
                    const subtotal = item.subtotal || item.cantidad * (item.precioUnitario || 0);
                    return (
                      <div key={i} className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                        <div className="col-span-6">
                          <span className="text-sm font-bold text-gray-800 block truncate">
                            {item.productoNombre || prod?.nombre || "Producto desconocido"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">SKU: {item.productoId}</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-sm font-black text-gray-600 border border-gray-200">
                            {item.cantidad}
                          </span>
                        </div>
                        <div className="col-span-2 text-right text-xs font-bold text-gray-500">
                          {formatCurrency(item.precioUnitario || 0)}
                        </div>
                        <div className="col-span-2 text-right text-sm font-black text-[#c47b96]">
                          {formatCurrency(subtotal)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer con banner de total */}
        <div className="flex items-center justify-between px-8 pb-8 pt-4 border-t border-gray-100 bg-white">
          <div className="bg-gradient-to-r from-[#fff0f5] to-[#fce8f0] rounded-xl border border-[#f0d5e0]" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
              Reembolso Total
            </p>
            <span className="text-[#c47b96] font-black text-2xl">
              {formatCurrency(devolucion.totalDevuelto)}
            </span>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="h-12 px-10 rounded-xl font-bold text-sm text-white transition-all shadow-md hover:shadow-lg active:scale-95"
            style={{ backgroundColor: "#c47b96" }}
          >
            Cerrar Detalle
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
