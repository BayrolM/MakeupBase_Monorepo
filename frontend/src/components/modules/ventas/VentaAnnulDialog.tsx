import { AlertCircle, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle 
} from "../../ui/dialog";
import { Button } from "../../ui/button";

interface VentaAnnulDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onConfirm: () => void;
}

export function VentaAnnulDialog({
  open,
  onOpenChange,
  isSaving,
  onConfirm,
}: VentaAnnulDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#fff1f2",
                boxShadow: "0 2px 8px rgba(239,68,68,0.12)",
              }}
            >
              <AlertCircle className="w-5 h-5" style={{ color: "#ef4444" }} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Anular Venta
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
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Tarjeta de advertencia */}
          <div
            className="bg-red-50 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle
              className="text-red-500 w-4.5 h-4.5 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                ¿Estás seguro que deseas anular esta venta?
              </p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Esta acción devolverá el stock a los productos y marcará la
                venta como anulada permanentemente en los registros.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSaving}
            className="rounded-lg text-white font-semibold px-6 h-10 text-sm"
            style={{ background: "#ef4444" }}
          >
            {isSaving ? "Procesando..." : "Confirmar Anulación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
