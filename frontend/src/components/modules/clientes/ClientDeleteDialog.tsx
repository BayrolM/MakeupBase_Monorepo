import { AlertCircle, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";

interface ClientDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
  isSaving: boolean;
  onConfirm: () => void;
}

export function ClientDeleteDialog({
  open,
  onOpenChange,
  cliente,
  isSaving,
  onConfirm,
}: ClientDeleteDialogProps) {
  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center flex-shrink-0 bg-red-50 text-red-500"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Eliminar Cliente
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

        {/* Cuerpo */}
        <div className="px-6 py-5">
          <div className="bg-red-50 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                ¿Estás seguro de eliminar permanentemente al cliente{" "}
                <span className="font-bold text-[#c47b96]">
                  "{cliente.nombres} {cliente.apellidos}"
                </span>
                ?
              </p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Esta acción borrará toda su información personal de la base de datos. Solo procede si no tiene transacciones activas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-5 h-11 text-sm font-semibold"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSaving}
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 h-11 text-sm border-0 font-bold shadow-md shadow-red-100"
          >
            {isSaving ? "Eliminando..." : "Eliminar Permanentemente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
