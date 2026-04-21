import { useState } from "react";
import { X, Plus, Trash2, Search, Package } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Button } from "../../ui/button";
import { formatCurrency } from "../../../utils/compraUtils";

interface CompraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    proveedorId: string;
    observaciones: string;
    detalles: {
      productoId: string;
      cantidad: number;
      precioUnitario: number;
    }[];
  };
  setFormData: (data: any) => void;
  proveedores: any[];
  productos: any[];
  isSaving: boolean;
  onSave: () => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  removeProductFromDetalles: (index: number) => void;
}

export function CompraFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  proveedores,
  productos,
  isSaving,
  onSave,
  selectedProductId,
  setSelectedProductId,
  removeProductFromDetalles,
}: CompraFormDialogProps) {
  const [productSearch, setProductSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const totalPurchase = formData.detalles.reduce(
    (acc, curr) => acc + curr.cantidad * curr.precioUnitario,
    0,
  );

  const filteredProducts = productos.filter((p) =>
    p.nombre.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const existingIndex = formData.detalles.findIndex(
      (d: any) => d.productoId === selectedProductId,
    );
    if (existingIndex >= 0) {
      const newDetalles = [...formData.detalles];
      newDetalles[existingIndex].cantidad += 1;
      setFormData({ ...formData, detalles: newDetalles });
    } else {
      setFormData({
        ...formData,
        detalles: [
          ...formData.detalles,
          { productoId: selectedProductId, cantidad: 1, precioUnitario: 0 },
        ],
      });
    }
    setSelectedProductId("");
    setProductSearch("");
    setShowDropdown(false);
  };

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
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Nueva Compra
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Formulario para registrar una nueva adquisición de productos
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
          {/* Fila superior: Proveedor + Observaciones */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "16px" }}>
            {/* Proveedor */}
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Search className="w-3.5 h-3.5" /> Proveedor <span style={{ color: "#f87171" }}>*</span>
              </p>
              <div style={{ background: "#ffffff", borderRadius: "8px" }}>
                <Select
                  value={formData.proveedorId}
                  onValueChange={(v) => setFormData({ ...formData, proveedorId: v })}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-white border-gray-200">
                    <SelectValue placeholder="Seleccionar proveedor..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-100">
                    {proveedores.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observaciones */}
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                Observaciones
              </p>
              <Input
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="h-10 rounded-lg border-gray-200 bg-white"
                placeholder="Ej: Factura #12345..."
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
                onClick={() => {
                  const newDetalle = {
                    productoId: "",
                    cantidad: 1,
                    precioUnitario: 0
                  };
                  setFormData({
                    ...formData,
                    detalles: [...formData.detalles, newDetalle]
                  });
                }}
                className="hover:opacity-90 rounded-lg font-bold text-xs h-7 px-3 border-0 flex items-center"
                style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
              </Button>
            </div>

            {/* Lista de productos */}
            <div style={{ padding: "0 16px", maxHeight: "300px", overflowY: "auto" }}>
              {formData.detalles.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm italic">
                  No hay productos agregados. Haz clic en "Añadir" para comenzar.
                </div>
              ) : (
                formData.detalles.map((d: any, index: number) => {
                  const prod = productos.find((p) => p.id === d.productoId);
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "16px 0",
                        borderBottom: index < formData.detalles.length - 1 ? "1px solid #f3f4f6" : "none",
                        position: "relative",
                        zIndex: 100 - index,
                      }}
                    >
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-6">
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                            Producto
                          </p>
                          <Select
                            value={d.productoId}
                            onValueChange={(val) => {
                              const nd = [...formData.detalles];
                              nd[index].productoId = val;
                              const p = productos.find(x => x.id === val);
                              if (p) nd[index].precioUnitario = p.precioCosto || 0;
                              setFormData({ ...formData, detalles: nd });
                            }}
                          >
                            <SelectTrigger className="h-9 rounded-lg bg-white border-gray-200">
                              <SelectValue placeholder="Seleccionar producto..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-100 max-h-[200px]">
                              {productos.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                            Cant.
                          </p>
                          <Input
                            type="number"
                            min="1"
                            value={d.cantidad}
                            onChange={(e) => {
                              const nd = [...formData.detalles];
                              nd[index].cantidad = parseInt(e.target.value) || 0;
                              setFormData({ ...formData, detalles: nd });
                            }}
                            className="border-gray-200 text-gray-800 h-9 rounded-lg"
                          />
                        </div>
                        <div className="col-span-2">
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                            Costo Unit.
                          </p>
                          <Input
                            type="number"
                            value={d.precioUnitario}
                            onChange={(e) => {
                              const nd = [...formData.detalles];
                              nd[index].precioUnitario = parseFloat(e.target.value) || 0;
                              setFormData({ ...formData, detalles: nd });
                            }}
                            className="border-gray-200 text-gray-800 h-9 rounded-lg"
                          />
                        </div>
                        <div className="col-span-2">
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                            Total
                          </p>
                          <div style={{ height: "36px", padding: "0 12px", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center" }}>
                            <span style={{ fontSize: "13px", fontWeight: 800, color: "#1f2937" }}>
                              {formatCurrency(d.cantidad * d.precioUnitario)}
                            </span>
                          </div>
                        </div>

                        <div className="absolute -top-1 -right-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const nd = [...formData.detalles];
                              nd.splice(index, 1);
                              setFormData({ ...formData, detalles: nd });
                            }}
                            style={{ height: "24px", width: "24px", padding: 0 }}
                            className="bg-white border border-gray-200 rounded-full text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer: Total + Botones */}
        <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-gray-100 bg-white z-10">
          {/* Total */}
          <div className="bg-gradient-to-r from-[#fff0f5] to-[#fce8f0] rounded-xl border border-[#f0d5e0]" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
              Inversión Total
            </p>
            <span className="text-[#c47b96] font-black text-2xl">
              {formatCurrency(totalPurchase)}
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
              disabled={isSaving || formData.detalles.length === 0}
              className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
              style={{ backgroundColor: formData.detalles.length === 0 ? "#d1d5db" : "#c47b96", color: "#ffffff" }}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : (
                "Guardar Compra"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
