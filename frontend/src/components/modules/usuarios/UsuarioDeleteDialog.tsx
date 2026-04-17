import { AlertCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';

interface UsuarioDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function UsuarioDeleteDialog({
  open,
  onOpenChange,
  user,
  isDeleting,
  onConfirm
}: UsuarioDeleteDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isDeleting) onOpenChange(false); }}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-3xl shadow-2xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center flex-shrink-0" 
              style={{ width: 44, height: 44, borderRadius: 14, background: "#fff1f2", boxShadow: "0 4px 12px rgba(239,68,68,0.12)" }}>
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">Eliminar Usuario</DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-0.5">Esta acción es definitiva</DialogDescription>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-8 text-center space-y-4">
          <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
            <p className="text-gray-700 text-sm leading-relaxed">
              ¿Estás seguro que deseas eliminar permanentemente a <span className="font-bold text-gray-900">{user.nombres} {user.apellidos}</span>?
            </p>
            <p className="text-xs text-rose-500 font-medium">
              Toda la información personal de este usuario será borrada del sistema de forma irreversible.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-8 pb-8 pt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-11 text-sm font-semibold" 
            disabled={isDeleting}
          >
            No, Mantener
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isDeleting} 
            className="rounded-xl font-bold px-8 h-11 text-sm border-0 shadow-lg shadow-rose-200 transition-all hover:scale-[1.02] active:scale-95 bg-rose-600 text-white"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Eliminando...
              </div>
            ) : 'Sí, Eliminar Permanentemente'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
