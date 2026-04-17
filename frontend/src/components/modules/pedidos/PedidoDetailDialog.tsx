import { 
  X, 
  ShoppingBag, 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  Package, 
  ClipboardList 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { formatCurrency, getStatusColor } from "../../../utils/pedidoUtils";

interface PedidoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPedido: any;
  productos: any[];
}

export function PedidoDetailDialog({
  open,
  onOpenChange,
  selectedPedido,
  productos,
}: PedidoDetailDialogProps) {
  if (!selectedPedido) return null;
  const statusColor = getStatusColor(selectedPedido.estado);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[92vw] !max-w-[720px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header con gradiente premium */}
        <div
          className="relative px-8 py-7"
          style={{
            background: "linear-gradient(135deg, #2e1020 0%, #4a2035 100%)"
          }}
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white leading-tight">
                  Detalle del Pedido
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/60 text-xs font-mono uppercase tracking-widest">PEDIDO #</span>
                  <span className="text-white font-bold font-mono tracking-wider">{selectedPedido.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${statusColor.bg} ${statusColor.text}`}>
                {statusColor.label}
              </span>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-8 mt-6 relative z-10 border-t border-white/10 pt-5">
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4 text-[#fad6e3]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-tight">Cliente</span>
                <span className="text-sm text-white font-semibold">{selectedPedido.clienteNombre}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#fad6e3]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-tight">Fecha Solicitud</span>
                <span className="text-sm text-white font-semibold">{selectedPedido.fecha}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#fad6e3]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-tight">Dirección de Entrega</span>
                <span className="text-sm text-white font-semibold truncate max-w-[180px]">{selectedPedido.direccionEnvio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cuerpo: Lista de Productos */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[50vh]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-[#c47b96]" /> Productos del Pedido
              </h3>
              <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#fff0f5] text-[#c47b96]">
                {(selectedPedido.productos || []).length} Items totales
              </span>
            </div>

            <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50/50 border-b border-gray-100">
                <div className="col-span-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">#</div>
                <div className="col-span-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Producto</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Cant.</div>
                <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Subtotal</div>
              </div>

              <div className="divide-y divide-gray-50">
                {(selectedPedido.productos || []).map((item: any, idx: number) => {
                  const prodData = productos.find(p => p.id === item.productoId);
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/30 transition-colors">
                      <div className="col-span-1 text-xs font-mono text-gray-400 text-center">{idx + 1}</div>
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {prodData?.imagenUrl 
                            ? <img src={prodData.imagenUrl} alt={prodData.nombre} className="w-full h-full object-contain" />
                            : <Package className="w-5 h-5 text-gray-300" />
                          }
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800 line-clamp-1">{prodData?.nombre || "Cargando..."}</span>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase">{formatCurrency(item.precioUnitario)} p/u</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-sm font-bold text-gray-700">{item.cantidad}</span>
                      </div>
                      <div className="col-span-3 text-right">
                        <span className="text-sm font-black text-gray-800">{formatCurrency(item.cantidad * item.precioUnitario)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resumen de Totales */}
          <div className="flex justify-end pt-2">
            <div className="w-full max-w-[280px] space-y-3 bg-[#fff0f5]/20 p-6 rounded-2xl border border-[#fad6e3]/30">
              <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedPedido.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                <span>IVA 19%</span>
                <span>{formatCurrency(selectedPedido.iva)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-gray-500 pb-3 border-b border-[#fad6e3]">
                <span>Costo Envío</span>
                <span>{formatCurrency(selectedPedido.costoEnvio)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-bold text-gray-700">Total a Pagar</span>
                <span className="text-2xl font-black text-[#c47b96]">{formatCurrency(selectedPedido.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
          <button
             onClick={() => {/* Lógica sugerida para imprimir o descargar detallado */}}
             className="text-xs font-bold text-[#c47b96] hover:underline flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Exportar desglose detallado
          </button>
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-10 h-11 text-sm font-bold bg-[#c47b96] text-white hover:opacity-90 border-0"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
