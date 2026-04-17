import { 
  X, 
  CreditCard, 
  AlertCircle 
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
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${isCurrentlyConfirmed ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'} shadow-lg`}
              style={{ width: 44, height: 44, borderRadius: 12 }}
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

        <div className="p-6 space-y-4">
          <div className={`rounded-xl p-4 flex gap-3 border ${isCurrentlyConfirmed ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <AlertCircle className={`w-5 h-5 ${isCurrentlyConfirmed ? 'text-rose-500' : 'text-emerald-500'} shrink-0`} />
            <div className="space-y-1">
              <p className={`text-sm font-bold ${isCurrentlyConfirmed ? 'text-rose-700' : 'text-emerald-700'}`}>
                {isCurrentlyConfirmed ? "¿Deseas anular la confirmación de pago?" : "¿Deseas confirmar la recepción del pago?"}
              </p>
              <p className={`text-xs ${isCurrentlyConfirmed ? 'text-rose-600' : 'text-emerald-600'} leading-relaxed`}>
                {isCurrentlyConfirmed 
                  ? "Esta acción marcará el pedido como pendiente de pago nuevamente." 
                  : "Esta acción marcará el pedido como PAGADO en el sistema de gestión."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-4 bg-gray-50/50">
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
            className={`rounded-xl px-8 h-11 text-sm font-bold text-white hover:opacity-90 border-0 shadow-lg ${isCurrentlyConfirmed ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`}
          >
            {isSaving ? "Procesando..." : "Confirmar Acción"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
