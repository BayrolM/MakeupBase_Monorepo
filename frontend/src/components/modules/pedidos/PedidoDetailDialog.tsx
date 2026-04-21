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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 w-[92vw] max-w-[680px] sm:max-w-[680px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header con gradiente */}
        <div
          className="relative px-8 py-6"
          style={{ backgroundColor: "#c47b96" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/15 rounded-xl border border-white/20">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white leading-tight">
                  Detalle del Pedido
                </DialogTitle>
                <p className="text-white font-bold mt-0.5 font-mono tracking-wider">
                  PEDIDO #{selectedPedido.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{
                  background: selectedPedido.estado === "entregado" || selectedPedido.estado === "preparado" ? "rgba(209,250,229,0.9)" : selectedPedido.estado === "cancelado" ? "rgba(254,226,226,0.9)" : "rgba(254,243,199,0.9)",
                  color: selectedPedido.estado === "entregado" || selectedPedido.estado === "preparado" ? "#065f46" : selectedPedido.estado === "cancelado" ? "#991b1b" : "#92400e",
                }}
              >
                {getStatusColor(selectedPedido.estado).label}
              </span>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/15 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info rápida en el header */}
          <div className="flex items-center gap-6 mt-5">
            <div className="flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-sm font-semibold">
                {selectedPedido.clienteNombre}
              </span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-sm font-semibold">{selectedPedido.fecha}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-sm font-semibold truncate max-w-[180px]">{selectedPedido.direccionEnvio}</span>
            </div>
          </div>
        </div>

        {/* Artículos */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Artículos</p>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-[#c47b96] bg-[#fff1f2]">
              {(selectedPedido.productos || []).length} {(selectedPedido.productos || []).length === 1 ? "ítem" : "ítems"}
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {/* Cabecera */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div className="col-span-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Producto</div>
              <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Cant.</div>
              <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Precio</div>
              <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Total</div>
            </div>

            {/* Filas */}
            <div className="max-h-[240px] overflow-y-auto">
              {(selectedPedido.productos || []).map((p: any, i: number) => {
                const producto = productos.find((prod) => prod.id === p.productoId);
                return (
                  <div
                    key={i}
                    className={`grid grid-cols-12 gap-4 px-4 py-3.5 items-center ${i < selectedPedido.productos.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50/60 transition-colors`}
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {producto?.imagenUrl
                          ? <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-contain" />
                          : <Package className="w-4 h-4 text-gray-300" />
                        }
                      </div>
                      <span className="text-sm font-semibold text-gray-800 truncate">{producto?.nombre || "Producto"}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-gray-600 font-medium">{p.cantidad}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm text-gray-600">{formatCurrency(p.precioUnitario)}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-bold text-gray-800">{formatCurrency(p.cantidad * p.precioUnitario)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Totales */}
        <div className="px-8 py-5">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-700">{formatCurrency(selectedPedido.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">IVA 19%</span>
                <span className="font-semibold text-gray-700">{formatCurrency(selectedPedido.iva)}</span>
              </div>
              <div className="flex justify-between text-sm pb-3 border-b border-gray-100">
                <span className="text-gray-500">Envío</span>
                <span className="font-semibold text-gray-700">{formatCurrency(selectedPedido.costoEnvio)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-bold text-gray-800">Total</span>
                <span className="text-xl font-black text-[#c47b96]">{formatCurrency(selectedPedido.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl text-white font-semibold h-11 text-sm border-0"
            style={{ backgroundColor: "#c47b96" }}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
