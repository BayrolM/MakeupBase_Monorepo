import { 
  X, 
  Truck, 
  Hash, 
  Calendar, 
  Clock 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { GenericCombobox } from "../../GenericCombobox";

interface PedidoShippingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shippingFormData: any;
  setShippingFormData: (data: any) => void;
  isSaving: boolean;
  onConfirm: () => void;
}

export function PedidoShippingDialog({
  open,
  onOpenChange,
  shippingFormData,
  setShippingFormData,
  isSaving,
  onConfirm,
}: PedidoShippingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-purple-600 shadow-lg shadow-purple-200"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Información de Envío
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Registra los datos de la transportadora
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

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" /> Transportadora
            </label>
            <GenericCombobox
              options={[
                { value: "Servientrega", label: "Servientrega" },
                { value: "Envia", label: "Envía Colvanes" },
                { value: "Coordinadora", label: "Coordinadora" },
                { value: "Interrapidisimo", label: "Interrapidísimo" },
                { value: "Mensajeria Interna", label: "Mensajería Interna" },
              ]}
              value={shippingFormData.transportadora}
              onChange={(v) => setShippingFormData({ ...shippingFormData, transportadora: v })}
              placeholder="Seleccionar transportadora"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" /> Número de Guía <span className="text-red-500">*</span>
            </label>
            <Input
              value={shippingFormData.numero_guia}
              onChange={(e) => setShippingFormData({ ...shippingFormData, numero_guia: e.target.value })}
              placeholder="Ej: 1234567890"
              className="rounded-xl h-10 border-gray-200"
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Fecha Envío
              </label>
              <Input
                type="date"
                value={shippingFormData.fecha_envio}
                onChange={(e) => setShippingFormData({ ...shippingFormData, fecha_envio: e.target.value })}
                className="rounded-xl h-10 border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Entrega Est.
              </label>
              <Input
                placeholder="Ej: 3-5 días"
                value={shippingFormData.fecha_estimada}
                onChange={(e) => setShippingFormData({ ...shippingFormData, fecha_estimada: e.target.value })}
                className="rounded-xl h-10 border-gray-200"
              />
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
            className="rounded-xl px-8 h-11 text-sm font-bold bg-[#c47b96] text-white hover:opacity-90 border-0 shadow-lg"
          >
            {isSaving ? "Confirmando..." : "Confirmar Envío"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
