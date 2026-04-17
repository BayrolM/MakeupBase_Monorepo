import { User, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { getRolLabel, getTipoDocumentoLabel } from '../../../utils/usuarioUtils';

interface UsuarioDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export function UsuarioDetailDialog({
  open,
  onOpenChange,
  user
}: UsuarioDetailDialogProps) {
  if (!user) return null;

  const details = [
    { label: 'Nombre Completo', value: `${user.nombres} ${user.apellidos}` },
    { label: 'Email', value: user.email },
    { label: 'Tipo de Documento', value: getTipoDocumentoLabel(user.tipoDocumento) },
    { label: 'Número de Documento', value: user.numeroDocumento },
    { label: 'Teléfono', value: user.telefono },
    { label: 'Rol', value: getRolLabel(user.rol) },
    { label: 'Dirección', value: user.direccion || 'No especificada' },
    { label: 'Ciudad', value: user.ciudad || 'No especificada' },
    { label: 'País', value: user.pais || 'Colombia' },
    { label: 'Fecha de Registro', value: new Date(user.fechaCreacion).toLocaleDateString() },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-2xl rounded-3xl shadow-2xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0" 
              style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#2e1020,#4a2035)", boxShadow: "0 4px 12px rgba(46,16,32,0.2)" }}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">Detalle de Usuario</DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-0.5">{user.nombres} {user.apellidos}</DialogDescription>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-6">
          <div className="grid grid-cols-2 gap-4">
            {details.map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
                <p className="text-sm font-bold text-gray-800 break-words">{value}</p>
              </div>
            ))}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50 col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Estado de la Cuenta</p>
              <div className="flex">
                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold ${user.estado === 'activo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-[#fff0f5] text-[#c47b96] border border-[#fce8f0]'}`}>
                  {user.estado === 'activo' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {user.estado === 'activo' ? 'Usuario Activo' : 'Usuario Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-8 pb-8 pt-4 border-t border-gray-100">
          <Button 
            onClick={() => onOpenChange(false)} 
            className="rounded-xl font-bold px-8 h-11 text-sm border-0 shadow-lg shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95 bg-gray-900 text-white"
          >
            Cerrar Detalle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
