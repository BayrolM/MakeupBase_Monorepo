import { X, Trash2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";

interface ProveedorDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proveedor: any;
  isSaving: boolean;
  onConfirm: () => void;
}

export function ProveedorDeleteDialog({
  open,
  onOpenChange,
  proveedor,
  isSaving,
  onConfirm,
}: ProveedorDeleteDialogProps) {
  if (!proveedor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg shadow-rose-200" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Eliminar Proveedor
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-1">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-[15px] text-gray-700 leading-relaxed max-w-sm">
              ¿Estás segura de que deseas eliminar a <strong className="text-rose-600 font-bold">{proveedor.nombre}</strong>? 
              <br/>
              <span className="text-sm text-gray-500 mt-2 block">
                Se perderán todos los datos y facturas asociadas a este proveedor de forma permanente.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 bg-gray-50/50 border-t border-gray-100 mt-2 items-center">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="px-5 h-11 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all disabled:opacity-50 min-w-[100px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="px-6 h-11 text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 focus:ring-4 focus:ring-rose-200 rounded-xl shadow-lg shadow-rose-500/20 transition-all select-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : "Sí, Eliminar Proveedor"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
