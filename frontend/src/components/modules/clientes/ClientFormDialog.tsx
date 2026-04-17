import { Pencil, Users, X, User, Mail, Phone, MapPin, CreditCard, Lock, Building2, Hash as HashIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { TipoDocumento } from "../../../lib/store";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCliente: any;
  formData: any;
  setFormData: (data: any) => void;
  fieldErrors: Record<string, string>;
  isSaving: boolean;
  onSave: () => void;
  onFieldChange: (name: string, value: string) => void;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  editingCliente,
  formData,
  setFormData,
  fieldErrors,
  isSaving,
  onSave,
  onFieldChange,
}: ClientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              {editingCliente ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {editingCliente
                  ? "Modifica la información del cliente existente"
                  : "Completa los campos para registrar un nuevo cliente"}
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

        <div className="px-6 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#c47b96]" />
                Nombres <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.nombres}
                onChange={(e) => onFieldChange("nombres", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.nombres ? "border-rose-400" : ""
                }`}
                placeholder="Ej: Juan"
                disabled={isSaving}
              />
              {fieldErrors.nombres && (
                <p className="text-rose-500 text-[10px] mt-1">{fieldErrors.nombres}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#c47b96]" />
                Apellidos <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.apellidos}
                onChange={(e) => onFieldChange("apellidos", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.apellidos ? "border-rose-400" : ""
                }`}
                placeholder="Ej: Pérez"
                disabled={isSaving}
              />
              {fieldErrors.apellidos && (
                <p className="text-rose-500 text-[10px] mt-1">{fieldErrors.apellidos}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-[#c47b96]" />
                Tipo de Documento <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.tipoDocumento}
                onValueChange={(val) => onFieldChange("tipoDocumento", val)}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl h-11">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100 rounded-xl shadow-lg">
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="PAS">Pasaporte</SelectItem>
                  <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <HashIcon className="w-3.5 h-3.5 text-[#c47b96]" />
                Número de Documento <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.numeroDocumento}
                onChange={(e) => onFieldChange("numeroDocumento", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.numeroDocumento ? "border-rose-400" : ""
                }`}
                placeholder="Ej: 123456789"
                disabled={isSaving}
              />
              {fieldErrors.numeroDocumento && (
                <p className="text-rose-500 text-[10px] mt-1">{fieldErrors.numeroDocumento}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#c47b96]" />
                Email <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.email}
                onChange={(e) => onFieldChange("email", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.email ? "border-rose-400" : ""
                }`}
                placeholder="ejemplo@correo.com"
                disabled={isSaving}
              />
              {fieldErrors.email && (
                <p className="text-rose-500 text-[10px] mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#c47b96]" />
                Teléfono <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={formData.telefono}
                onChange={(e) => onFieldChange("telefono", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.telefono ? "border-rose-400" : ""
                }`}
                placeholder="Ej: 3001234567"
                disabled={isSaving}
              />
              {fieldErrors.telefono && (
                <p className="text-rose-500 text-[10px] mt-1">{fieldErrors.telefono}</p>
              )}
            </div>
          </div>

          {!editingCliente && (
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#c47b96]" />
                Contraseña <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="password"
                value={formData.passwordHash}
                onChange={(e) => onFieldChange("passwordHash", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.passwordHash ? "border-rose-400" : ""
                }`}
                placeholder="Mínimo 8 caracteres"
                disabled={isSaving}
              />
              {fieldErrors.passwordHash && (
                <p className="text-rose-500 text-[10px] mt-1">{fieldErrors.passwordHash}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c47b96]" />
                Dirección
              </Label>
              <Input
                value={formData.direccion}
                onChange={(e) => onFieldChange("direccion", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.direccion ? "border-rose-400" : ""
                }`}
                placeholder="Ej: Cl. 10 # 5-10"
                disabled={isSaving}
              />
              {fieldErrors.direccion && (
                <p className="text-rose-500 text-[10px] mt-1">{fieldErrors.direccion}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#c47b96]" />
                Ciudad
              </Label>
              <Input
                value={formData.ciudad}
                onChange={(e) => onFieldChange("ciudad", e.target.value)}
                className={`bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11 ${
                  fieldErrors.ciudad ? "border-rose-400" : ""
                }`}
                placeholder="Ej: Bogotá"
                disabled={isSaving}
              />
              {fieldErrors.ciudad && (
                <p className="text-rose-500 text-[10px] mt-1">{fieldErrors.ciudad}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-2 bg-gray-50/50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-white rounded-xl px-6 h-11 text-sm font-semibold"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="rounded-xl font-bold px-8 h-11 text-sm border-0 luxury-button-modal shadow-lg shadow-[#c47b96]/20"
          >
            {isSaving ? "Guardando..." : editingCliente ? "Actualizar Cliente" : "Registrar Cliente"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
