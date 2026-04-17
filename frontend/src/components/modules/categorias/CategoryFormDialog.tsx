import { Pencil, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { Categoria } from "../../../lib/store";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategoria: Categoria | null;
  formData: { nombre: string; descripcion: string; estado: "activo" | "inactivo" };
  setFormData: (data: any) => void;
  fieldErrors: Record<string, string>;
  isSaving: boolean;
  onSave: () => void;
  validateNombre: (val: string) => string;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  editingCategoria,
  formData,
  setFormData,
  fieldErrors,
  isSaving,
  onSave,
  validateNombre,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient" style={{ width: 44, height: 44, borderRadius: 12 }}>
              {editingCategoria ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {editingCategoria
                  ? "Modifica los datos de la categoría"
                  : "Completa el formulario para crear una nueva categoría"}
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

        {/* Cuerpo */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Nombre <span className="text-rose-500">*</span>
            </p>
            <Input
              value={formData.nombre}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, nombre: val });
              }}
              className={`border-gray-200 text-gray-800 rounded-lg h-9 text-sm focus:ring-[#c47b96]/20 focus:border-[#c47b96] ${
                fieldErrors.nombre ? "border-rose-400" : ""
              }`}
              placeholder="Ej: Maquillaje, Cuidado Facial..."
              maxLength={50}
            />
            {fieldErrors.nombre && (
              <p className="text-rose-500 text-xs mt-1">{fieldErrors.nombre}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Descripción (Opcional)
            </p>
            <Textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Describe brevemente esta categoría..."
              className="border-gray-200 text-gray-800 rounded-lg text-sm resize-none focus:ring-[#c47b96]/20 focus:border-[#c47b96]"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="rounded-lg font-semibold px-6 h-10 text-sm border-0 luxury-button-modal"
          >
            {isSaving ? "Guardando..." : editingCategoria ? "Actualizar" : "Crear Categoría"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
