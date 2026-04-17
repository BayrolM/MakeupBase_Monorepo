import { 
  X, 
  User as UserIcon, 
  MapPin, 
  Package, 
  Trash2, 
  Plus 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { AsyncClientSelect } from "../../AsyncClientSelect";
import { AsyncProductSelect } from "../../AsyncProductSelect";
import { formatCurrency } from "../../../utils/pedidoUtils";

interface PedidoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPedido: any;
  formData: any;
  setFormData: (data: any) => void;
  isSaving: boolean;
  onSave: () => void;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
  onUpdateProduct: (index: number, field: string, value: any, prodObj?: any) => void;
}

export function PedidoEditDialog({
  open,
  onOpenChange,
  editingPedido,
  formData,
  setFormData,
  isSaving,
  onSave,
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct,
}: PedidoEditDialogProps) {
  if (!editingPedido) return null;
  const isPending = editingPedido.estado === "pendiente";
  const subtotal = formData.productos.reduce((s: number, p: any) => s + (p.cantidad * p.precioUnitario), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[95vw] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-amber-500 shadow-lg shadow-amber-200"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Editar Pedido #{editingPedido.id.slice(0, 8)}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                {isPending ? "Puedes modificar productos y cliente" : "Solo puedes modificar la dirección de envío"}
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

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Fila superior: Cliente y Dirección */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-[#c47b96]" /> Cliente
              </label>
              <AsyncClientSelect
                value={formData.clienteId}
                onChange={(val) => setFormData({ ...formData, clienteId: val })}
                disabled={!isPending || isSaving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c47b96]" /> Dirección de Envío <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.direccionEnvio}
                onChange={(e) => setFormData({ ...formData, direccionEnvio: e.target.value })}
                placeholder="Ej: Carrera 50 # 10-20, Medellín"
                className="rounded-xl h-10 border-gray-200"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Sección de Productos - Solo editable en pendiente */}
          {isPending && (
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" /> Items del Pedido
                </h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={onAddProduct}
                  className="h-8 bg-[#c47b96] hover:opacity-90 rounded-lg text-white font-bold text-xs border-0"
                  disabled={isSaving}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Añadir Producto
                </Button>
              </div>

              <div className="p-4 space-y-4">
                {formData.productos.map((prod: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end bg-white p-4 rounded-xl shadow-sm border border-gray-50 relative">
                    <div className="col-span-6">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Producto</label>
                      <AsyncProductSelect
                        value={prod.productoId}
                        onChange={(val, prodObj) => onUpdateProduct(index, "productoId", val, prodObj)}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Cantidad</label>
                      <Input
                        type="number"
                        min="1"
                        value={prod.cantidad}
                        onChange={(e) => onUpdateProduct(index, "cantidad", e.target.value)}
                        className="rounded-lg h-10"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">P. Unitario</label>
                      <div className="h-10 px-3 bg-gray-50 border border-gray-100 flex items-center text-sm font-semibold text-gray-600 rounded-lg">
                        {formatCurrency(prod.precioUnitario)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Total</label>
                      <div className="h-10 px-3 bg-[#fff0f5] border border-[#fad6e3] flex items-center text-sm font-black text-[#c47b96] rounded-lg">
                        {formatCurrency(prod.cantidad * prod.precioUnitario)}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveProduct(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                      disabled={isSaving}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subtotal Productos</span>
              <span className="text-xl font-black text-gray-700">{formatCurrency(subtotal)}</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Est. (inc. Envío)</span>
              <span className="text-2xl font-black text-[#c47b96]">{formatCurrency(subtotal > 0 ? subtotal + 10000 : 0)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-6 h-11 text-sm font-bold border-gray-200 text-gray-500 hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="rounded-xl px-8 h-11 text-sm font-bold bg-[#c47b96] text-white hover:opacity-90 border-0 shadow-lg shadow-[#c47b96]/20"
            >
              {isSaving ? "Guardando..." : "Actualizar Pedido"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
