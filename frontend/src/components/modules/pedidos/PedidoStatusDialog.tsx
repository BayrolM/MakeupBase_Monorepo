import { 
  X, 
  Activity, 
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
import { Textarea } from "../../ui/textarea";
import { GenericCombobox } from "../../GenericCombobox";
import { OrderStatus } from "../../../lib/store";

interface PedidoStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPedido: any;
  newStatus: OrderStatus;
  setNewStatus: (status: OrderStatus) => void;
  motivoAnulacion: string;
  setMotivoAnulacion: (motivo: string) => void;
  isSaving: boolean;
  onUpdateStatus: () => void;
}

export function PedidoStatusDialog({
  open,
  onOpenChange,
  selectedPedido,
  newStatus,
  setNewStatus,
  motivoAnulacion,
  setMotivoAnulacion,
  isSaving,
  onUpdateStatus,
}: PedidoStatusDialogProps) {
  if (!selectedPedido) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Estado del Pedido #{selectedPedido.id.slice(0, 8)}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Actualiza el progreso del pedido actual
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

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Seleccionar Nuevo Estado
            </label>
            <GenericCombobox
              options={[
                { value: "pendiente", label: "Pedido Pendiente" },
                { value: "preparado", label: "Preparado para envío" },
                { value: "procesando", label: "En Procesamiento" },
                { value: "enviado", label: "Enviado a destino" },
                { value: "entregado", label: "Entregado con éxito" },
                { value: "cancelado", label: "Cancelar Pedido" },
              ]}
              value={newStatus}
              onChange={(val) => setNewStatus(val as OrderStatus)}
              placeholder="Elige un estado..."
              disabled={isSaving}
            />
          </div>

          {newStatus === "cancelado" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Motivo de Cancelación
              </label>
              <Textarea
                placeholder="Indica brevemente por qué se canceló el pedido..."
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                className="rounded-xl border-gray-200 focus:ring-[#c47b96]/20 focus:border-[#c47b96] resize-none min-h-[100px]"
                disabled={isSaving}
              />
            </div>
          )}

          {newStatus === "entregado" && (
            <div className="bg-emerald-50 rounded-xl p-4 flex gap-3 border border-emerald-100 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                Al marcar como <strong>Entregado</strong>, se generará automáticamente una venta en el registro contable y se confirmará el cierre del pedido.
              </p>
            </div>
          )}
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
            onClick={onUpdateStatus}
            disabled={isSaving}
            className="rounded-xl px-8 h-11 text-sm font-bold bg-[#c47b96] text-white hover:opacity-90 border-0 shadow-lg shadow-[#c47b96]/20"
          >
            {isSaving ? "Procesando..." : "Actualizar Estado"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
