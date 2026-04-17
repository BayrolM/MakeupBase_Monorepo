import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../ui/dialog";
import { Categoria } from "../../../lib/store";

interface CategoryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Categoria | null;
}

export function CategoryDetailDialog({
  open,
  onOpenChange,
  category,
}: CategoryDetailDialogProps) {
  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-xl flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              {category.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Detalle de Categoría
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                ID #{category.id.slice(0, 8)}
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

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Nombre
              </p>
              <p className="text-sm font-bold text-gray-800">{category.nombre}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Estado
              </p>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  category.estado === "activo"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {category.estado === "activo" ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Descripción
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {category.descripcion || (
                <span className="text-gray-400 italic">
                  Sin descripción registrada
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl text-white font-bold text-sm luxury-button-modal"
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
