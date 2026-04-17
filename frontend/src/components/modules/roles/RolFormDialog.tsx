import { Pencil, Shield, X, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { StatusSwitch } from '../../StatusSwitch';
import { MODULOS } from '../../../utils/rolUtils';

interface RolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRol: any;
  formData: any;
  onFieldChange: (name: string, value: any) => void;
  onPermisoChange: (modulo: string, tipo: 'ver' | 'crear' | 'editar' | 'eliminar', value: boolean) => void;
  onSave: () => void;
}

export function RolFormDialog({
  open,
  onOpenChange,
  editingRol,
  formData,
  onFieldChange,
  onPermisoChange,
  onSave
}: RolFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-0">
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0" 
              style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 4px 12px rgba(196,123,150,0.3)" }}>
              {editingRol ? <Pencil className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                {editingRol ? 'Editar Rol Administrativo' : 'Crear Nuevo Rol'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-0.5">Define los privilegios de acceso del sistema</DialogDescription>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Información Básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-6 bg-[#c47b96] rounded-full"></span>
              <h3 className="text-gray-900 font-bold text-base">Información General</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-gray-700 font-bold text-sm">Nombre del Rol <span className="text-rose-500">*</span></Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => onFieldChange('nombre', e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11 focus:ring-[#c47b96]/20 focus:border-[#c47b96]"
                  placeholder="Ej: Gerente, Supervisor..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-bold text-sm">Estado del Rol</Label>
                <div className="h-11 flex items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
                   <StatusSwitch
                    status={formData.estado}
                    onChange={(newStatus) => onFieldChange('estado', newStatus)}
                  />
                  <span className="ml-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                    {formData.estado === 'activo' ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label htmlFor="descripcion" className="text-gray-700 font-bold text-sm">Descripción y Responsabilidades</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => onFieldChange('descripcion', e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl min-h-[80px] focus:ring-[#c47b96]/20 focus:border-[#c47b96]"
                  placeholder="Explica brevemente para qué sirve este rol..."
                />
              </div>
            </div>
          </div>

          {/* Permisos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-6 bg-[#c47b96] rounded-full"></span>
              <h3 className="text-gray-900 font-bold text-base">Matriz de Privilegios</h3>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-inner">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
                    <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-[0.1em] py-4 pl-6">Módulo</TableHead>
                    <TableHead className="text-center text-gray-700 font-bold text-xs uppercase tracking-[0.1em] py-4">Ver</TableHead>
                    <TableHead className="text-center text-gray-700 font-bold text-xs uppercase tracking-[0.1em] py-4">Crear</TableHead>
                    <TableHead className="text-center text-gray-700 font-bold text-xs uppercase tracking-[0.1em] py-4">Editar</TableHead>
                    <TableHead className="text-center text-gray-700 font-bold text-xs uppercase tracking-[0.1em] py-4">Borrar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULOS.map((modulo) => (
                    <TableRow key={modulo.key} className="border-b border-gray-100 bg-white hover:bg-gray-50/50 group transition-colors">
                      <TableCell className="text-gray-800 font-bold text-sm pl-6 py-4">{modulo.label}</TableCell>
                      <TableCell className="text-center py-4">
                        <Checkbox
                          checked={formData.permisos[modulo.key]?.ver || false}
                          onCheckedChange={(checked) => onPermisoChange(modulo.key, 'ver', !!checked)}
                          className="mx-auto w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-[#c47b96] data-[state=checked]:border-[#c47b96]"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Checkbox
                          checked={formData.permisos[modulo.key]?.crear || false}
                          onCheckedChange={(checked) => onPermisoChange(modulo.key, 'crear', !!checked)}
                          className="mx-auto w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-[#c47b96] data-[state=checked]:border-[#c47b96]"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Checkbox
                          checked={formData.permisos[modulo.key]?.editar || false}
                          onCheckedChange={(checked) => onPermisoChange(modulo.key, 'editar', !!checked)}
                          className="mx-auto w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-[#c47b96] data-[state=checked]:border-[#c47b96]"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Checkbox
                          checked={formData.permisos[modulo.key]?.eliminar || false}
                          onCheckedChange={(checked) => onPermisoChange(modulo.key, 'eliminar', !!checked)}
                          className="mx-auto w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-[#c47b96] data-[state=checked]:border-[#c47b96]"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 px-8 pb-8 pt-6 border-t border-gray-100 bg-white sticky bottom-0 z-10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 flex-1 rounded-xl h-11 font-semibold"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            className="flex-1 rounded-xl h-11 font-bold border-0 shadow-lg shadow-[#c47b96]/20 transition-all hover:scale-[1.02] active:scale-95 text-white"
            style={{ backgroundColor: "#c47b96" }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {editingRol ? 'Guardar Cambios' : 'Registrar Nuevo Rol'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
