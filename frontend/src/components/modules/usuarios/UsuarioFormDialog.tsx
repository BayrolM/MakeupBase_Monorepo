import { Pencil, UserPlus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { TipoDocumento } from '../../../lib/store';

interface UsuarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: any;
  formData: any;
  fieldErrors: Record<string, string>;
  isSaving: boolean;
  onFieldChange: (name: string, value: string) => void;
  onSelectChange: (name: string, value: string) => void;
  onSave: () => void;
}

export function UsuarioFormDialog({
  open,
  onOpenChange,
  editingUser,
  formData,
  fieldErrors,
  isSaving,
  onFieldChange,
  onSelectChange,
  onSave
}: UsuarioFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isSaving) onOpenChange(false); }}>
      <DialogContent className="bg-white border border-gray-100 max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-0">
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0" 
              style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 4px 12px rgba(196,123,150,0.3)" }}>
              {editingUser ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-0.5">
                {editingUser ? 'Modifica la información del usuario' : 'Completa los campos para registrar un nuevo usuario'}
              </DialogDescription>
            </div>
          </div>
          <button onClick={() => { if (!isSaving) onOpenChange(false); }} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Nombre <span className="text-rose-500">*</span></Label>
              <Input 
                value={formData.nombres} 
                onChange={(e) => onFieldChange('nombres', e.target.value)} 
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.nombres ? 'border-rose-400' : ''}`} 
                placeholder="Ej: Juan" 
                disabled={isSaving} 
                maxLength={80} 
              />
              {fieldErrors.nombres && <p className="text-rose-500 text-xs mt-1">{fieldErrors.nombres}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Apellido <span className="text-rose-500">*</span></Label>
              <Input 
                value={formData.apellidos} 
                onChange={(e) => onFieldChange('apellidos', e.target.value)} 
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.apellidos ? 'border-rose-400' : ''}`} 
                placeholder="Ej: Pérez" 
                disabled={isSaving} 
                maxLength={80} 
              />
              {fieldErrors.apellidos && <p className="text-rose-500 text-xs mt-1">{fieldErrors.apellidos}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Tipo de Documento <span className="text-rose-500">*</span></Label>
              <Select value={formData.tipoDocumento} onValueChange={(v) => onSelectChange('tipoDocumento', v)} disabled={isSaving}>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="PAS">Pasaporte</SelectItem>
                  <SelectItem value="NIT">NIT</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Número de Documento <span className="text-rose-500">*</span></Label>
              <Input 
                value={formData.numeroDocumento} 
                onChange={(e) => onFieldChange('numeroDocumento', e.target.value)} 
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.numeroDocumento ? 'border-rose-400' : ''}`} 
                placeholder="Ej: 1234567890" 
                disabled={isSaving} 
                maxLength={10} 
              />
              {fieldErrors.numeroDocumento && <p className="text-rose-500 text-xs mt-1">{fieldErrors.numeroDocumento}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Teléfono <span className="text-rose-500">*</span></Label>
              <Input 
                value={formData.telefono} 
                onChange={(e) => onFieldChange('telefono', e.target.value)} 
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.telefono ? 'border-rose-400' : ''}`} 
                placeholder="Ej: 3001234567" 
                disabled={isSaving} 
                maxLength={20} 
              />
              {fieldErrors.telefono && <p className="text-rose-500 text-xs mt-1">{fieldErrors.telefono}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Email <span className="text-rose-500">*</span></Label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={(e) => onFieldChange('email', e.target.value)} 
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.email ? 'border-rose-400' : ''}`} 
                placeholder="Ej: usuario@correo.com" 
                disabled={isSaving} 
                maxLength={100} 
              />
              {fieldErrors.email && <p className="text-rose-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>
          </div>

          {!editingUser && (
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Contraseña <span className="text-rose-500">*</span></Label>
              <Input 
                type="password" 
                value={formData.passwordHash} 
                onChange={(e) => onFieldChange('passwordHash', e.target.value)} 
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.passwordHash ? 'border-rose-400' : ''}`} 
                placeholder="Mínimo 8 caracteres" 
                disabled={isSaving} 
              />
              {fieldErrors.passwordHash && <p className="text-rose-500 text-xs mt-1">{fieldErrors.passwordHash}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold text-sm">Dirección</Label>
            <Input 
              value={formData.direccion} 
              onChange={(e) => onFieldChange('direccion', e.target.value)} 
              className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.direccion ? 'border-rose-400' : ''}`} 
              placeholder="Ej: Calle 50 #30-20" 
              disabled={isSaving} 
              maxLength={100} 
            />
            {fieldErrors.direccion && <p className="text-rose-500 text-xs mt-1">{fieldErrors.direccion}</p>}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Ciudad</Label>
              <Input 
                value={formData.ciudad} 
                onChange={(e) => onFieldChange('ciudad', e.target.value)} 
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11 ${fieldErrors.ciudad ? 'border-rose-400' : ''}`} 
                placeholder="Ej: Medellín" 
                disabled={isSaving} 
              />
              {fieldErrors.ciudad && <p className="text-rose-500 text-xs mt-1">{fieldErrors.ciudad}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">País</Label>
              <Input 
                value={formData.pais} 
                onChange={(e) => onFieldChange('pais', e.target.value)} 
                className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] h-11" 
                placeholder="Ej: Colombia" 
                disabled={isSaving} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm">Rol <span className="text-rose-500">*</span></Label>
              <Select value={formData.rol} onValueChange={(v) => onSelectChange('rol', v)} disabled={isSaving}>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="bodeguero">Bodeguero</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingUser && (
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Estado</Label>
                <Select value={formData.estado} onValueChange={(v) => onSelectChange('estado', v)} disabled={isSaving}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {!editingUser && (
            <div className="p-4 rounded-2xl bg-[#fff0f5] border border-[#f0d5e0]">
              <p className="text-[#c47b96] text-xs font-medium">El usuario se creará con estado "Activo" por defecto.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-8 pb-8 pt-5 border-t border-gray-100 sticky bottom-0 bg-white z-10">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-11 text-sm font-semibold" disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="rounded-xl font-bold px-8 h-11 text-sm border-0 shadow-lg shadow-[#c47b96]/20 transition-all hover:scale-[1.02] active:scale-95" style={{ backgroundColor: "#c47b96", color: "#ffffff" }}>
            {isSaving ? (
              <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{editingUser ? 'Actualizando...' : 'Creando...'}</div>
            ) : (editingUser ? 'Actualizar Usuario' : 'Crear Usuario')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
