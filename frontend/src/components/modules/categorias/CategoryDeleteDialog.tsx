import { AlertCircle, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Categoria } from "../../../lib/store";

interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Categoria | null;
  isSaving: boolean;
  onConfirm: () => void;
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  isSaving,
  onConfirm,
}: CategoryDeleteDialogProps) {
  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center flex-shrink-0 bg-red-50 text-red-500"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Eliminar Categoría
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="bg-red-50 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                ¿Estás seguro de eliminar la categoría{" "}
                <span className="font-bold text-[#c47b96]">
                  "{category.nombre}"
                </span>
                ?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Esta acción eliminará permanentemente la categoría del sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSaving}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-6 h-10 text-sm border-0 font-bold"
          >
            {isSaving ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
