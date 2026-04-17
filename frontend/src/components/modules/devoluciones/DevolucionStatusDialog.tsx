import { Edit, X, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface DevolucionStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devolucion: any;
  motivoDecision: string;
  onMotivoChange: (val: string) => void;
  onConfirm: (status: string) => void;
}

export function DevolucionStatusDialog({
  open,
  onOpenChange,
  devolucion,
  motivoDecision,
  onMotivoChange,
  onConfirm
}: DevolucionStatusDialogProps) {
  if (!devolucion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-3xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0" 
              style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 4px 12px rgba(196,123,150,0.3)" }}>
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">Cambiar Estado</DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-0.5">Gestión de auditoría de devolución</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold text-sm">Nuevo Estado</Label>
              <Select defaultValue="en_revision" onValueChange={(v) => onConfirm(v)}>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11">
                  <SelectValue placeholder="Seleccione nuevo estado" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                  <SelectItem value="aprobada">Aprobar Devolución (Suma Stock)</SelectItem>
                  <SelectItem value="rechazada">Rechazar Permanentemente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-bold text-sm">Motivo de la Decisión <span className="text-rose-500">*</span></Label>
              <Textarea
                value={motivoDecision}
                onChange={(e) => onMotivoChange(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-800 rounded-2xl min-h-[100px] focus:ring-[#c47b96]/20 focus:border-[#c47b96] py-3 text-sm font-medium"
                placeholder="Explica detalladamente por qué se aprobó o rechazó esta solicitud de devolución..."
              />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">Mínimo: 3 caracteres</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex gap-3">
             <div className="p-1.5 bg-white rounded-lg border border-indigo-100 h-fit">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
             </div>
             <p className="text-[11px] text-indigo-600 font-medium leading-relaxed">
                Al marcar como <strong>"Aprobada"</strong>, las cantidades seleccionadas volverán automáticamente al inventario disponible para la venta.
             </p>
          </div>
        </div>

        <div className="flex flex-col px-8 pb-8 pt-2 gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl h-11 font-bold text-sm">
            Cancelar Operación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
