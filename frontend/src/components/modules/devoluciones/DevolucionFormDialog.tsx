import { useState } from "react";
import { X, Plus, Search, Calendar, Package, Check, Loader2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { formatCurrency } from "../../../utils/devolucionUtils";

interface DevolucionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  ventaData: any;
  productosDevolver: any[];
  clientes: any[];
  productos: any[];
  successMessage: string;
  errorMessage: string;
  isSaving: boolean;
  onVentaIdChange: (id: string) => void;
  onFieldChange: (name: string, value: any) => void;
  onToggleProducto: (index: number) => void;
  onCantidadChange: (index: number, cantidad: number) => void;
  onSave: () => void;
  totalDevolucion: number;
}

export function DevolucionFormDialog({
  open,
  onOpenChange,
  formData,
  ventaData,
  productosDevolver,
  clientes,
  productos,
  successMessage,
  errorMessage,
  isSaving,
  onVentaIdChange,
  onFieldChange,
  onToggleProducto,
  onCantidadChange,
  onSave,
  totalDevolucion,
}: DevolucionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[900px] rounded-2xl shadow-2xl p-0 overflow-hidden">
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
              <Package className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Registrar Devolución
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Gestiona las devoluciones asociadas a ventas realizadas
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

        {/* Body */}
        <div 
          className="no-scrollbar overflow-y-auto"
          style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh" }}
        >
          
          {/* Mensajes */}
          {successMessage && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm font-bold text-green-700">{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
              <X className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-red-700">{errorMessage}</span>
            </div>
          )}

          {/* Fila superior: ID Venta + Fecha */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Search className="w-3.5 h-3.5" /> ID de Venta <span style={{ color: "#f87171" }}>*</span>
              </p>
              <div style={{ position: "relative" }}>
                <Input
                  value={formData.ventaId}
                  onChange={(e) => onVentaIdChange(e.target.value)}
                  className="h-10 rounded-lg pr-10 border-gray-200"
                  placeholder="Ej: 6..."
                  disabled={isSaving}
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar className="w-3.5 h-3.5" /> Fecha Devolución <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                type="date"
                value={formData.fechaDevolucion}
                onChange={(e) => onFieldChange("fechaDevolucion", e.target.value)}
                className="h-10 rounded-lg border-gray-200 bg-white"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Motivo y Estado */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "16px" }}>
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                Motivo de Devolución <span style={{ color: "#f87171" }}>*</span>
              </p>
              <textarea
                value={formData.motivo}
                onChange={(e) => {
                  if (e.target.value.length <= 100) onFieldChange("motivo", e.target.value);
                }}
                disabled={isSaving}
                placeholder="Describa el motivo..."
                className="w-100 min-h-[40px] bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none transition-all"
                style={{ width: "100%", resize: "none" }}
              />
              <div className="flex justify-end mt-1">
                <span style={{ fontSize: "10px", fontWeight: 700, color: formData.motivo.length > 90 ? "#ef4444" : "#aaa" }}>
                  {formData.motivo.length}/100
                </span>
              </div>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
                Estado Inicial
              </p>
              <Select value={formData.estado} onValueChange={(v) => onFieldChange("estado", v)}>
                <SelectTrigger className="h-10 rounded-lg bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100">
                  <SelectItem value="aprobada">Aprobada (Suma Stock)</SelectItem>
                  <SelectItem value="pendiente">Pendiente de Revisión</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resumen de Venta */}
          {ventaData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#fff0f5", border: "1px solid #fce8f0", borderRadius: "12px", padding: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Info className="w-3.5 h-3.5" /> Información de la Venta #{ventaData.id}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fecha Venta</span>
                    <span className="text-sm font-bold text-gray-800">{ventaData.fecha}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cliente</span>
                    <span className="text-sm font-bold text-gray-800">{ventaData.clienteNombre || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monto Venta</span>
                    <span className="text-sm font-black text-[#c47b96]">{formatCurrency(ventaData.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Lista de productos para devolver */}
              <div style={{ background: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px", overflow: "hidden" }}>
                <div className="flex items-center justify-between" style={{ background: "#f9fafb", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                    <Package className="w-3.5 h-3.5" /> Productos de la Venta
                  </p>
                  <span className="text-[10px] font-black text-[#c47b96] bg-[#fff0f5] px-2 py-0.5 rounded-full">
                    {productosDevolver.filter(p => p.selected).length} SELECCIONADOS
                  </span>
                </div>
                
                <div style={{ padding: "0 16px", maxHeight: "250px", overflowY: "auto" }}>
                  {(ventaData.productos || []).map((item: any, index: number) => {
                    const producto = productos.find((p) => p.id === item.productoId);
                    const isSelected = productosDevolver[index]?.selected || false;

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-4 py-4 border-b border-gray-50 last:border-0 transition-colors ${isSelected ? "bg-pink-50/20" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleProducto(index)}
                          disabled={isSaving}
                          className="w-5 h-5 rounded border-gray-300 text-[#c47b96] focus:ring-[#c47b96] cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-sm text-gray-800">{producto?.nombre || "N/A"}</p>
                          <p className="text-[10px] text-gray-400 font-medium">Precio Unit: {formatCurrency(item.precioUnitario)}</p>
                        </div>
                        <div className="text-center w-20">
                          <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Original</p>
                          <span className="text-sm font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                            {item.cantidad}
                          </span>
                        </div>
                        <div className="text-center w-24">
                          <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">A Devolver</p>
                          <Input
                            type="number"
                            value={productosDevolver[index]?.cantidadADevolver || 0}
                            onChange={(e) => onCantidadChange(index, parseInt(e.target.value) || 0)}
                            disabled={!isSelected || isSaving}
                            min={0}
                            max={item.cantidad}
                            className="h-8 text-center font-black border-gray-200 rounded-lg text-sm bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-3">
                <Search className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium italic">Ingresa un ID de Venta válido para cargar los productos</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-gray-100 bg-white z-10">
          <div className="bg-gradient-to-r from-[#fff0f5] to-[#fce8f0] rounded-xl border border-[#f0d5e0]" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
              Monto a Reembolsar
            </p>
            <span className="text-[#c47b96] font-black text-2xl">
              {formatCurrency(totalDevolucion)}
            </span>
          </div>

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
              disabled={isSaving || !ventaData || totalDevolucion === 0}
              className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
              style={{ backgroundColor: (isSaving || !ventaData || totalDevolucion === 0) ? "#d1d5db" : "#c47b96", color: "white" }}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </div>
              ) : (
                "Confirmar Devolución"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
