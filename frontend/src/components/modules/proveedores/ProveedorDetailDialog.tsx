import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Calendar 
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { StatusBadge } from "../../StatusBadge";
import { formatNIT } from "../../../utils/proveedorUtils";

interface ProveedorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proveedor: any;
}

export function ProveedorDetailDialog({
  open,
  onOpenChange,
  proveedor,
}: ProveedorDetailDialogProps) {
  if (!proveedor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header Premium */}
        <div className="luxury-header-gradient px-6 py-6 border-b border-[#fce8f0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Ficha del Proveedor
                </DialogTitle>
                <div className="flex items-center gap-2 mt-0.5">
                   <StatusBadge status={proveedor.estado} />
                </div>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-[#c47b96]" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Proveedor / NIT</p>
                <p className="text-sm font-bold text-gray-800">{proveedor.nombre}</p>
                <p className="text-xs font-mono text-gray-500">{formatNIT(proveedor.nit)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-[#c47b96]" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Email</p>
                  <p className="text-sm font-semibold text-gray-700 break-all">{proveedor.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[#c47b96]" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Teléfono</p>
                  <p className="text-sm font-semibold text-gray-700">{proveedor.telefono || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-2">
              <div className="w-9 h-9 rounded-lg bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-[#c47b96]" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Dirección</p>
                <p className="text-sm font-semibold text-gray-700">{proveedor.direccion || "No especificada"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-2">
              <div className="w-9 h-9 rounded-lg bg-[#fff0f5] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-[#c47b96]" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Fecha Registro</p>
                <p className="text-sm font-semibold text-gray-700">
                  {new Date(proveedor.fechaRegistro).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/50 flex justify-end border-t border-gray-100">
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-10 h-11 text-sm font-bold bg-[#c47b96] text-white hover:opacity-90 border-0"
          >
            Cerrar ficha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
