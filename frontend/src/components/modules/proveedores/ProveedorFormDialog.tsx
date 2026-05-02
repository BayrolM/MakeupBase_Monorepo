import { X, Building2, Settings, FileText, Phone, Mail, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
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
  fieldErrors?: Record<string, string>;
  onChange?: (field: string, value: any) => void;
}

export function ProveedorFormDialog({
  open,
  onOpenChange,
  editingProveedor,
  formData,
  setFormData,
  isSaving,
  onSave,
  fieldErrors = {},
  onChange,
}: ProveedorFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[700px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg,#c47b96,#e092b2)",
                boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
              }}
            >
              {editingProveedor ? <Settings className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {editingProveedor ? "Actualiza los datos del aliado" : "Registra un nuevo contacto comercial"}
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

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh", overflowY: "auto" }}>
          
          {/* Fila 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                Tipo Persona <span style={{ color: "#f87171" }}>*</span>
              </p>
              <select
                value={formData.tipo_proveedor}
                onChange={(e) => onChange ? onChange("tipo_proveedor", e.target.value) : setFormData({ ...formData, tipo_proveedor: e.target.value })}
                className="w-full h-10 px-3 border border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 rounded-lg text-sm bg-white"
              >
                <option value="Persona Natural">Persona Natural</option>
                <option value="Persona Jurídica">Persona Jurídica</option>
              </select>
            </div>

            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: fieldErrors.nombre ? "#ef4444" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Building2 className={`w-3.5 h-3.5 ${fieldErrors.nombre ? "text-red-400" : "text-gray-400"}`} /> Nombre / Razón Social <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.nombre}
                onChange={(e) => onChange ? onChange("nombre", e.target.value) : setFormData({ ...formData, nombre: e.target.value })}
                maxLength={100}
                required
                className={`h-10 text-sm bg-white transition-colors ${fieldErrors.nombre ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10"}`}
                placeholder="Ej: Suministros S.A.S"
              />
              {fieldErrors.nombre && (
                <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.nombre}</p>
              )}
            </div>
          </div>

          {/* Fila 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: fieldErrors.nit ? "#ef4444" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText className={`w-3.5 h-3.5 ${fieldErrors.nit ? "text-red-400" : "text-gray-400"}`} /> NIT / Documento <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.nit}
                onChange={(e) => onChange ? onChange("nit", e.target.value) : setFormData({ ...formData, nit: e.target.value })}
                maxLength={20}
                required
                className={`h-10 text-sm bg-white font-mono transition-colors ${fieldErrors.nit ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10"}`}
                placeholder="900.123.456-7"
              />
              {fieldErrors.nit && (
                <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.nit}</p>
              )}
            </div>

            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: fieldErrors.telefono ? "#ef4444" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Phone className={`w-3.5 h-3.5 ${fieldErrors.telefono ? "text-red-400" : "text-gray-400"}`} /> Teléfono <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.telefono}
                onChange={(e) => onChange ? onChange("telefono", e.target.value) : setFormData({ ...formData, telefono: e.target.value })}
                maxLength={20}
                required
                className={`h-10 text-sm bg-white transition-colors ${fieldErrors.telefono ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10"}`}
                placeholder="+57 321..."
              />
              {fieldErrors.telefono && (
                <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.telefono}</p>
              )}
            </div>
          </div>

          {/* Fila 3 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: fieldErrors.email ? "#ef4444" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail className={`w-3.5 h-3.5 ${fieldErrors.email ? "text-red-400" : "text-gray-400"}`} /> Correo Electrónico <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => onChange ? onChange("email", e.target.value) : setFormData({ ...formData, email: e.target.value })}
                maxLength={100}
                required
                className={`h-10 text-sm bg-white transition-colors ${fieldErrors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10"}`}
                placeholder="contacto@proveedor.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: fieldErrors.direccion ? "#ef4444" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin className={`w-3.5 h-3.5 ${fieldErrors.direccion ? "text-red-400" : "text-gray-400"}`} /> Dirección <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                value={formData.direccion}
                onChange={(e) => onChange ? onChange("direccion", e.target.value) : setFormData({ ...formData, direccion: e.target.value })}
                maxLength={150}
                required
                className={`h-10 text-sm bg-white transition-colors ${fieldErrors.direccion ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10"}`}
                placeholder="Av. Siempre Viva 123"
              />
              {fieldErrors.direccion && (
                <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.direccion}</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 pb-6 pt-4 border-t border-gray-100 bg-white z-10 gap-3">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: isSaving ? "not-allowed" : "pointer",
              border: "1.5px solid #f0d5e0",
              background: "#fff8fb",
              color: "#c47b96",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fdf2f6"; e.currentTarget.style.borderColor = "#c47b96"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff8fb"; e.currentTarget.style.borderColor = "#f0d5e0"; }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            style={{
              padding: "10px 28px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: isSaving ? "not-allowed" : "pointer",
              border: "none",
              background: "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(196,123,150,0.3)",
              transition: "all 0.2s",
              opacity: isSaving ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(196,123,150,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(196,123,150,0.3)"; }}
          >
            {isSaving ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
                Guardando...
              </span>
            ) : editingProveedor ? (
              "Actualizar Proveedor"
            ) : (
              "Registrar Proveedor"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
