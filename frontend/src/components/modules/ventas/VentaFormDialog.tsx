import { 
  Plus, 
  Trash2, 
  X, 
  User as UserIcon, 
  CreditCard, 
  Package, 
  ShoppingBag 
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
import { GenericCombobox } from "../../GenericCombobox";
import { formatCurrency } from "../../../utils/ventaUtils";

interface VentaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  isSaving: boolean;
  onSave: () => void;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
  onUpdateProduct: (index: number, field: string, value: any, prodObj?: any) => void;
}

export function VentaFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  isSaving,
  onSave,
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct,
}: VentaFormDialogProps) {
  const totalVenta = formData.productos.reduce(
    (sum: number, p: any) => sum + (p.cantidad * p.precioUnitario),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[95vw] rounded-2xl shadow-2xl p-0 overflow-hidden">
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
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Nueva Venta
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Formulario para crear una nueva venta
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

        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        <div 
          className="no-scrollbar overflow-y-auto"
          style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh" }}
        >
          {/* Fila superior: Cliente + Método de Pago */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "16px" }}>
            {/* Cliente */}
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <UserIcon className="w-3.5 h-3.5" /> Cliente <span style={{ color: "#f87171" }}>*</span>
              </p>
              <div style={{ background: "#ffffff", borderRadius: "8px" }}>
                <AsyncClientSelect
                  value={formData.clienteId}
                  onChange={(val) => setFormData({ ...formData, clienteId: val })}
                />
              </div>
            </div>

            {/* Método de Pago */}
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CreditCard className="w-3.5 h-3.5" /> Método de Pago <span style={{ color: "#f87171" }}>*</span>
              </p>
              <GenericCombobox
                options={[
                  { value: "Efectivo", label: "Efectivo" },
                  { value: "Transferencia", label: "Transferencia" },
                ]}
                value={formData.metodoPago}
                onChange={(v) => setFormData({ ...formData, metodoPago: v as any })}
                placeholder="Seleccionar método"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Sección de Productos */}
          <div style={{ background: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px" }}>
            {/* Header productos */}
            <div className="flex items-center justify-between" style={{ background: "#f9fafb", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                <Package className="w-3.5 h-3.5" /> Productos <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Button
                type="button"
                size="sm"
                onClick={onAddProduct}
                className="hover:opacity-90 rounded-lg font-bold text-xs h-7 px-3 border-0 flex items-center"
                style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
              </Button>
            </div>

            {/* Lista de productos */}
            <div style={{ padding: "0 16px", maxHeight: "300px", overflowY: "auto" }}>
              {formData.productos.map((prod: any, index: number) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px 0",
                    borderBottom: index < formData.productos.length - 1 ? "1px solid #f3f4f6" : "none",
                    position: "relative",
                    zIndex: 100 - index,
                  }}
                >
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-6">
                      <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                        Producto
                      </p>
                      <div style={{ background: "#ffffff", borderRadius: "8px" }}>
                        <AsyncProductSelect
                          value={prod.productoId}
                          onChange={(val, prodObj) => onUpdateProduct(index, "productoId", val, prodObj)}
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                        Cant.
                      </p>
                      <Input
                        type="number"
                        min="1"
                        value={prod.cantidad}
                        onChange={(e) => onUpdateProduct(index, "cantidad", parseInt(e.target.value))}
                        className="border-gray-200 text-gray-800 h-9 rounded-lg"
                      />
                    </div>
                    <div className="col-span-2">
                      <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                        Precio
                      </p>
                      <Input
                        type="number"
                        value={prod.precioUnitario}
                        onChange={(e) => onUpdateProduct(index, "precioUnitario", parseFloat(e.target.value))}
                        className="border-gray-200 text-gray-800 h-9 rounded-lg"
                      />
                    </div>
                    <div className="col-span-2">
                      <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                        Total
                      </p>
                      <div style={{ height: "36px", padding: "0 12px", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#1f2937" }}>
                          {formatCurrency(prod.cantidad * prod.precioUnitario)}
                        </span>
                      </div>
                    </div>

                    {formData.productos.length > 1 && (
                      <div className="absolute -top-1 -right-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveProduct(index)}
                          style={{ height: "24px", width: "24px", padding: 0 }}
                          className="bg-white border border-gray-200 rounded-full text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Total + Botones */}
        <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-gray-100 bg-white z-10">
          {/* Total */}
          <div className="bg-gradient-to-r from-[#fff0f5] to-[#fce8f0] rounded-xl border border-[#f0d5e0]" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
              Total de la Venta
            </p>
            <span className="text-[#c47b96] font-black text-2xl">
              {formatCurrency(totalVenta)}
            </span>
          </div>
          {/* Botones */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
              style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : (
                "Confirmar Venta"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
