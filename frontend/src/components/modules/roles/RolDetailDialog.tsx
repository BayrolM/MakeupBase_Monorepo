import { Shield, X, Users as UsersIcon, CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { MODULOS } from '../../../utils/rolUtils';

interface RolDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol: any;
  users: any[];
}

export function RolDetailDialog({
  open,
  onOpenChange,
  rol,
  users
}: RolDetailDialogProps) {
  if (!rol) return null;

  const usersForRole = users.filter(u => u.rolAsignadoId === rol.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-0">
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0" 
              style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#2e1020,#4a2035)", boxShadow: "0 4px 12px rgba(46,16,32,0.2)" }}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">Detalles del Rol</DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-0.5">Visión completa de accesos y usuarios asignados</DialogDescription>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre del Rol</p>
                <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{rol.nombre}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado Actual</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${rol.estado === 'activo' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${rol.estado === 'activo' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {rol.estado === 'activo' ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Usuarios Asignados</p>
                <p className="text-sm font-bold text-gray-900">{usersForRole.length} Personas</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 md:col-span-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descripción de Responsabilidades</p>
                <p className="text-sm font-medium text-gray-600 italic">"{rol.descripcion || 'Sin descripción detallada registrada para este rol.'}"</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Permisos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-5 bg-[#c47b96] rounded-full"></span>
                <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider">Matriz de Acceso</h3>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-inner">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
                      <TableHead className="text-gray-600 font-bold text-[10px] py-3 pl-4">Módulo</TableHead>
                      <TableHead className="text-center text-gray-600 font-bold text-[10px] py-3">Ver</TableHead>
                      <TableHead className="text-center text-gray-600 font-bold text-[10px] py-3">Cr</TableHead>
                      <TableHead className="text-center text-gray-600 font-bold text-[10px] py-3">Ed</TableHead>
                      <TableHead className="text-center text-gray-600 font-bold text-[10px] py-3">Del</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MODULOS.map((m) => {
                      const p = rol.permisos[m.key];
                      return (
                        <TableRow key={m.key} className="border-b border-gray-50 group transition-colors hover:bg-gray-50/30">
                          <TableCell className="text-gray-700 font-bold text-[11px] py-2.5 pl-4">{m.label}</TableCell>
                          {(['ver', 'crear', 'editar', 'eliminar'] as const).map(t => (
                            <TableCell key={t} className="text-center py-2.5">
                              {p?.[t] 
                                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> 
                                : <XCircle className="w-3.5 h-3.5 text-rose-300 mx-auto opacity-50" />
                              }
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Usuarios Asignados */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-5 bg-[#c47b96] rounded-full"></span>
                <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider">Personas Vinculadas</h3>
              </div>
              {usersForRole.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-200 text-center space-y-3">
                  <UsersIcon className="w-10 h-10 text-gray-300 mx-auto" strokeWidth={1.5} />
                  <p className="text-sm text-gray-400 font-medium italic">No hay usuarios con este rol actualmente.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {usersForRole.map((u) => (
                    <div key={u.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group transition-all hover:bg-white hover:shadow-md hover:border-[#c47b96]/20">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center group-hover:bg-[#fff0f5]">
                            <UsersIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#c47b96]" />
                         </div>
                         <div>
                            <p className="text-[13px] font-bold text-gray-800">{u.nombres} {u.apellidos}</p>
                            <p className="text-[10px] text-gray-400 font-medium italic">{u.email}</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 pb-8 pt-4 border-t border-gray-100 bg-white sticky bottom-0 z-10">
          <Button onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-11 font-bold border-0 bg-gray-900 text-white shadow-lg shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95">
            Cerrar Consulta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
