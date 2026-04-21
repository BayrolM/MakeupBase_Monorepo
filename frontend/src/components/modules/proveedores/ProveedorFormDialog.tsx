import { 
  X, 
  Building2, 
  Settings, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck 
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";

interface ProveedorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProveedor: any;
  formData: {
    tipo_proveedor: string;
    nombre: string;
    email: string;
    telefono: string;
    nit: string;
    direccion: string;
    estado: "activo" | "inactivo";
  };
  setFormData: (data: any) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ProveedorFormDialog({
  open,
  onOpenChange,
  editingProveedor,
  formData,
  setFormData,
  isSaving,
  onSave,
}: ProveedorFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-lg rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient" style={{ width: 44, height: 44, borderRadius: 12 }}>
              {editingProveedor ? <Settings className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {editingProveedor ? "Actualiza los datos del aliado" : "Registra un nuevo contacto comercial"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                Tipo Persona
              </Label>
              <select
                value={formData.tipo_proveedor}
                onChange={(e) => setFormData({ ...formData, tipo_proveedor: e.target.value })}
                className="w-full h-11 px-3 border border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-xl"
              >
                <option value="Persona Natural">Persona Natural</option>
                <option value="Persona Jurídica">Persona Jurídica</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#c47b96]" /> Nombre o Razón Social *
              </Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                maxLength={100}
                required
                className="h-11 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-xl"
                placeholder="Ej: Suministros Cosméticos S.A.S"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#c47b96]" /> NIT / Documento *
              </Label>
              <Input
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                maxLength={20}
                required
                className="h-11 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-xl font-mono"
                placeholder="900.123.456-7"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#c47b96]" /> Teléfono *
              </Label>
              <Input
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                maxLength={20}
                required
                className="h-11 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-xl"
                placeholder="+57 321..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#c47b96]" /> Correo Electrónico *
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              maxLength={100}
              required
              className="h-11 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-xl"
              placeholder="contacto@proveedor.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#c47b96]" /> Dirección *
            </Label>
            <Input
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              maxLength={150}
              required
              className="h-11 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-xl"
              placeholder="Av. Siempre Viva 123"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
          >
            Cancelar
          </Button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="rounded-lg font-semibold px-6 h-10 text-sm border-0 luxury-button-modal disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          >
            {isSaving ? "Guardando..." : editingProveedor ? "Actualizar" : "Registrar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
