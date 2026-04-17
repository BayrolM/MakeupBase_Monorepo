import { Shield, CheckCircle2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Checkbox } from '../../ui/checkbox';
import { MODULOS } from '../../../utils/rolUtils';

interface RolMatrizPermisosProps {
  roles: any[];
  onPermisoChange: (rolId: string, modulo: string, tipo: 'ver' | 'crear' | 'editar' | 'eliminar', value: boolean) => void;
}

export function RolMatrizPermisos({ roles, onPermisoChange }: RolMatrizPermisosProps) {
  const activeRoles = roles.filter(r => r.estado === 'activo');

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fff0f5] flex items-center justify-center border border-[#fce8f0]">
            <Shield className="w-6 h-6 text-[#c47b96]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Matriz de Permisos Directa</h2>
            <p className="text-sm text-gray-400 mt-1 font-medium">Gestiona accesos en tiempo real para todos los roles activos</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
              <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-widest pl-8 sticky left-0 bg-[#fff0f5] z-30 border-r border-[#fce8f0] w-[200px]">
                Módulo del Sistema
              </TableHead>
              {activeRoles.map((rol) => (
                <TableHead key={rol.id} className="text-center border-r border-[#fce8f0] min-w-[320px] p-0">
                  <div className="flex flex-col items-center gap-2 py-4 px-2">
                    <span className="text-[#2e1020] text-sm font-bold uppercase tracking-wider">{rol.nombre}</span>
                    <div className="grid grid-cols-4 gap-0 w-full mt-2 border-t border-[#fce8f0] pt-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Ver</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Crear</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Edit</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Del</span>
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {MODULOS.map((modulo) => (
              <TableRow key={modulo.key} className="transition-colors hover:bg-gray-50/50 group">
                <TableCell className="text-gray-900 font-bold text-sm pl-8 sticky left-0 bg-white group-hover:bg-gray-50/50 z-20 border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  {modulo.label}
                </TableCell>
                {activeRoles.map((rol) => {
                  const permisos = rol.permisos[modulo.key];
                  return (
                    <TableCell key={`${rol.id}-${modulo.key}`} className="border-r border-gray-50 p-0" colSpan={4}>
                      <div className="grid grid-cols-4 divide-x divide-gray-50">
                        {(['ver', 'crear', 'editar', 'eliminar'] as const).map((tipo) => (
                          <div key={tipo} className="flex items-center justify-center py-4 bg-white/30 group-hover:bg-transparent">
                            <Checkbox
                              checked={permisos?.[tipo] || false}
                              onCheckedChange={(checked: boolean) =>
                                onPermisoChange(rol.id, modulo.key, tipo, !!checked)
                              }
                              className="w-4.5 h-4.5 rounded-md border-gray-200 data-[state=checked]:bg-[#c47b96] data-[state=checked]:border-[#c47b96] transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <p className="text-gray-500 text-xs font-semibold italic">
          Los cambios en la matriz se guardan automáticamente y afectan la sesión de los usuarios inmediatamente.
        </p>
      </div>
    </div>
  );
}
