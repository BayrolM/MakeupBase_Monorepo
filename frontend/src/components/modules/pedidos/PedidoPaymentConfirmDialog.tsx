import { 
  X, 
  CreditCard, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "../../ui/dialog";
import { Button } from "../../ui/button";

interface PedidoPaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedidoToConfirm: any;
  isSaving: boolean;
  onConfirm: () => void;
}

export function PedidoPaymentConfirmDialog({
  open,
  onOpenChange,
  pedidoToConfirm,
  isSaving,
  onConfirm,
}: PedidoPaymentConfirmDialogProps) {
  if (!pedidoToConfirm) return null;
  const isCurrentlyConfirmed = !!pedidoToConfirm.pago_confirmado;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 w-[95vw] max-w-[450px] sm:max-w-[450px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 12,
                background: isCurrentlyConfirmed 
                  ? "linear-gradient(135deg, #ef4444, #f87171)" 
                  : "linear-gradient(135deg, #10b981, #34d399)",
                boxShadow: isCurrentlyConfirmed 
                  ? "0 2px 8px rgba(239,68,68,0.3)" 
                  : "0 2px 8px rgba(16,185,129,0.3)"
              }}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {isCurrentlyConfirmed ? "Remover Confirmación" : "Confirmar Pago"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Pedido #{pedidoToConfirm.id.slice(0, 8)}
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

        {/* Body */}
        <div className="p-8 space-y-6">
          <div 
            className="rounded-2xl p-5 flex gap-4 border"
            style={{ 
              backgroundColor: isCurrentlyConfirmed ? "#fef2f2" : "#f0fdf4",
              borderColor: isCurrentlyConfirmed ? "#fecaca" : "#bbf7d0"
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: "white" }}
            >
              {isCurrentlyConfirmed ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-800">
                {isCurrentlyConfirmed ? "¿Anular confirmación de pago?" : "¿Confirmar recepción del pago?"}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {isCurrentlyConfirmed 
                  ? "Esta acción marcará el pedido como pendiente de pago nuevamente en el sistema." 
                  : "Esta acción marcará el pedido como PAGADO y permitirá proceder con el despacho."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2 bg-white">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-6 h-11 text-sm font-bold border-gray-200 text-gray-500 hover:bg-gray-50"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSaving}
            className="rounded-xl px-8 h-11 text-sm font-bold text-white transition-all shadow-md hover:shadow-lg active:scale-95 border-0"
            style={{ 
              background: isCurrentlyConfirmed 
                ? "linear-gradient(135deg, #ef4444, #f87171)" 
                : "linear-gradient(135deg, #10b981, #34d399)" 
            }}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </div>
            ) : (
              isCurrentlyConfirmed ? "Sí, Anular Pago" : "Sí, Confirmar Pago"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
