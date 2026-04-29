import { X, Mail, Phone, MapPin, CreditCard, Calendar, User, Shield, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../ui/dialog";
import { getRolLabel, getTipoDocumentoLabel } from "../../../utils/usuarioUtils";

interface UsuarioDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  roles: any[];
}

export function UsuarioDetailDialog({
  open,
  onOpenChange,
  user,
  roles
}: UsuarioDetailDialogProps) {
  if (!user) return null;

  const rolNombre = roles.find((r: any) => String(r.id) === String(user.rol))?.nombre || user.rol;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-2xl rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-xl flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              {user.nombres.charAt(0).toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Perfil del Usuario
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Rol: {rolNombre}
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

        <div className="px-6 py-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider">
                Información Personal
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Nombre Completo</p>
                    <p className="text-sm font-bold text-gray-800">{user.nombres} {user.apellidos}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">{getTipoDocumentoLabel(user.tipoDocumento)}</p>
                    <p className="text-sm font-bold text-gray-800">{user.numeroDocumento}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Fecha Registro</p>
                    <p className="text-sm font-bold text-gray-800">
                      {new Date(user.fechaCreacion).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto y Ubicación */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider">
                Contacto y Ubicación
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Email</p>
                    <p className="text-sm font-bold text-gray-800 truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Teléfono</p>
                    <p className="text-sm font-bold text-gray-800">{user.telefono}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Ubicación</p>
                    <p className="text-sm font-bold text-gray-800">
                      {user.direccion ? `${user.direccion}, ` : ""}{user.ciudad || "N/A"}{user.pais ? ` - ${user.pais}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas Rápidas / Estado */}
          <div className="mt-6">
            <h3 className="text-[11px] font-bold text-[#c47b96] uppercase tracking-wider mb-4">
              Estado y Permisos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#fff0f5] border border-pink-100 rounded-xl p-4 text-center">
                <Shield className="w-5 h-5 text-[#c47b96] mx-auto mb-2" />
                <p className="text-xl font-bold text-gray-800">{rolNombre}</p>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Nivel de Acceso</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <Activity className={`w-5 h-5 mx-auto mb-2 ${user.estado === 'activo' ? 'text-emerald-500' : 'text-gray-400'}`} />
                <p className={`text-sm font-bold uppercase ${user.estado === 'activo' ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Estado de Cuenta</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl text-white font-bold text-sm luxury-button-modal shadow-lg shadow-[#c47b96]/20"
          >
            Cerrar Perfil
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
