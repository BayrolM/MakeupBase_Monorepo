import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { Producto } from "../../../lib/store";

interface ProductDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Producto | null;
  onConfirm: () => Promise<void>;
  isSaving: boolean;
}

export function ProductDeleteDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
  isSaving,
}: ProductDeleteDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                Eliminar Producto
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Confirmar eliminación definitiva
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 p-4 bg-orange-50/50 border border-orange-100 rounded-2xl mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-orange-700">Atención: Acción irreversible</p>
              <p className="text-xs text-orange-600 leading-relaxed">
                Estás a punto de eliminar <strong>"{product.nombre}"</strong>. 
                Esta acción no se puede deshacer y el producto desaparecerá de todo el historial.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center px-4">
            ¿Realmente deseas proceder con la eliminación?
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-11"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-8 h-11 font-bold shadow-lg shadow-red-200 transition-all border-0"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Eliminando...</span>
              </div>
            ) : (
              "Sí, Eliminar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
