import { 
  X, 
  ShoppingBag, 
  Building2, 
  Calendar, 
  DollarSign, 
  Package, 
  FileText 
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { formatCurrency, getCompraStatusColor } from "../../../utils/compraUtils";

interface CompraDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCompra: any;
  proveedores: any[];
  productos: any[];
}

export function CompraDetailDialog({
  open,
  onOpenChange,
  selectedCompra,
  proveedores,
  productos,
}: CompraDetailDialogProps) {
  if (!selectedCompra) return null;

  const proveedor = proveedores.find(p => p.id === selectedCompra.proveedorId);
  const statusColor = getCompraStatusColor(selectedCompra.estado);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 !w-[92vw] !max-w-[720px] rounded-2xl shadow-2xl p-0 overflow-hidden">
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
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white leading-tight">
                  Detalle de Compra
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/60 text-xs font-mono uppercase tracking-widest">REGISTRO #</span>
                  <span className="text-white font-bold font-mono tracking-wider">{selectedCompra.id}</span>
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
              <Building2 className="w-4 h-4 text-[#fad6e3]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-tight">Proveedor</span>
                <span className="text-sm text-white font-semibold">{proveedor?.nombre || "N/A"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#fad6e3]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-tight">Fecha Compra</span>
                <span className="text-sm text-white font-semibold">
                  {new Date(selectedCompra.fecha).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#fad6e3]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-tight">Observaciones</span>
                <span className="text-sm text-white font-semibold truncate max-w-[150px]">
                  {selectedCompra.observaciones || "Sin observación"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cuerpo: Lista de Productos (Si el backend los retornara en el detalle) */}
        {/* Nota: En el monolito original, el detalle de compra NO mostraba items individuales, 
            pero el diseño permite expandirlo si el store los incluye. */}
        <div className="p-8 space-y-6">
          <div className="bg-[#fcf8f9] rounded-2xl p-6 border border-[#fad6e3]/30 flex flex-col items-center justify-center text-center">
             <DollarSign className="w-8 h-8 text-[#c47b96] mb-3" />
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Monto Total de Operación</p>
             <h2 className="text-4xl font-black text-gray-900">{formatCurrency(selectedCompra.total)}</h2>
          </div>

          <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
            El stock ha sido actualizado automáticamente al confirmar este registro
          </p>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
             <Package className="w-4 h-4" /> Registro de entrada de mercancía
          </div>
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
