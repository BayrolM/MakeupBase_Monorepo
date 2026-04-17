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
        <div className="px-6 py-5">
          <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-rose-900 leading-relaxed">
              ¿Estás segura de que deseas eliminar a <strong>{proveedor.nombre}</strong>? 
              Se perderán todos los datos asociados a este proveedor de forma permanente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
          >
            Cancelar
          </Button>
          <button
            onClick={onConfirm}
            disabled={isSaving}
            className="rounded-lg font-semibold px-6 h-10 text-sm text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all shadow-md shadow-rose-100 disabled:opacity-50 min-w-[120px]"
          >
            {isSaving ? "Eliminando..." : "Confirmar Eliminación"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
