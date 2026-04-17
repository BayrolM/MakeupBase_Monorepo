import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

interface DevolucionAnularDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devolucion: any;
  motivoAnulacion: string;
  onMotivoChange: (val: string) => void;
  onConfirm: () => void;
}

export function DevolucionAnularDialog({
  open,
  onOpenChange,
  devolucion,
  motivoAnulacion,
  onMotivoChange,
  onConfirm
}: DevolucionAnularDialogProps) {
  if (!devolucion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-3xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center flex-shrink-0" 
              style={{ width: 44, height: 44, borderRadius: 14, background: "#fff1f2", boxShadow: "0 4px 12px rgba(239,68,68,0.12)" }}>
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight tracking-tight">Anular Devolución</DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-0.5 tracking-tight">Operación irreversible de auditoría</DialogDescription>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="px-8 py-8 space-y-6">
          <div className="p-5 bg-rose-50/50 border border-rose-100 rounded-2xl flex gap-4">
             <Trash2 className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
             <p className="text-sm font-medium text-rose-600 leading-relaxed">
                ¿Estás seguro de que deseas anular permanentemente la devolución <strong>#{devolucion.id.slice(0, 8)}</strong>?<br />
                <span className="text-xs font-normal opacity-80 italic mt-1 block">Esta acción no devolverá productos al stock ni procesará reembolsos.</span>
             </p>
          </div>

          <div className="space-y-3">
             <Label className="text-gray-700 font-bold text-xs uppercase tracking-widest pl-1">Motivo de Anulación <span className="text-rose-500">*</span></Label>
             <Textarea
               value={motivoAnulacion}
               onChange={(e) => onMotivoChange(e.target.value)}
               className="bg-gray-50 border-gray-200 text-gray-800 rounded-2xl min-h-[100px] focus:ring-[#c47b96]/20 focus:border-[#c47b96] py-3 text-sm font-bold"
               placeholder="Ingresa los motivos técnicos o legales de la anulación (mínimo 5 caracteres)..."
             />
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right px-1">Mínimo: 5 caracteres</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-8 pb-8 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-11 text-sm font-bold flex-1 sm:flex-initial">
             No, Mantener
          </Button>
          <Button onClick={onConfirm} className="rounded-xl font-bold px-8 h-11 text-sm border-0 shadow-lg shadow-rose-200 transition-all hover:scale-[1.02] active:scale-95 bg-rose-600 text-white flex-1 sm:flex-initial">
             Confirmar Anulación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
