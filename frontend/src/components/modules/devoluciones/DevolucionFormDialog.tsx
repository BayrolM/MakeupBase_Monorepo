import { X, Search, Calendar, Package, Check, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Input } from "../../ui/input";
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
  fieldErrors?: Record<string, string>;
  setFieldErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function DevolucionFormDialog({
  open,
  onOpenChange,
  formData,
  ventaData,
  productosDevolver,
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
  fieldErrors,
  setFieldErrors,
}: DevolucionFormDialogProps) {
  // Estilo de etiqueta de campo
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 7,
    display: "flex",
    alignItems: "center",
    gap: 5,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[900px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg,#c47b96,#e092b2)",
                boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle style={{ fontSize: 15, fontWeight: 800, color: "#111827", lineHeight: 1.3 }}>
                Registrar Devolución
              </DialogTitle>
              <DialogDescription style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                Gestiona las devoluciones asociadas a ventas realizadas
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            style={{ padding: 6, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
            <div>
              <p style={{ ...labelStyle, color: fieldErrors?.ventaId ? "#ef4444" : labelStyle.color }}>
                <Search className="w-3.5 h-3.5" /> ID de Venta <span style={{ color: "#f87171" }}>*</span>
              </p>
              <div style={{ position: "relative" }}>
                <Input
                  value={formData.ventaId}
                  onChange={(e) => onVentaIdChange(e.target.value)}
                  className={`h-10 rounded-lg pr-10 border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 text-sm ${fieldErrors?.ventaId ? "border-red-500 bg-red-50 focus:border-red-500" : "bg-white"}`}
                  placeholder="Ej: 6..."
                  disabled={isSaving}
                  style={{ fontSize: 13, color: "#374151" }}
                  onFocus={() => { if (fieldErrors?.ventaId && setFieldErrors) setFieldErrors(prev => ({ ...prev, ventaId: "" })); }}
                />
                <Search className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors?.ventaId ? "text-red-400" : "text-gray-400"}`} />
              </div>
              {fieldErrors?.ventaId && <p style={{ fontSize: 10, color: "#ef4444", margin: "4px 0 0", fontWeight: 600 }}>{fieldErrors.ventaId}</p>}
            </div>

            <div>
              <p style={labelStyle}>
                <Calendar className="w-3.5 h-3.5" /> Fecha Devolución <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Input
                type="date"
                value={formData.fechaDevolucion}
                onChange={(e) => onFieldChange("fechaDevolucion", e.target.value)}
                className="h-10 rounded-lg border-gray-200 text-sm"
                disabled={true}
                readOnly={true}
                style={{ fontSize: 13, color: "#9ca3af", background: "#f9fafb", cursor: "not-allowed", pointerEvents: "none" }}
              />
            </div>
          </div>

          {/* Motivo y Estado */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "16px" }}>
            <div>
              <p style={{ ...labelStyle, color: fieldErrors?.motivo ? "#ef4444" : labelStyle.color }}>
                Motivo de Devolución <span style={{ color: "#f87171" }}>*</span>
              </p>
              <textarea
                value={formData.motivo}
                onChange={(e) => {
                  if (e.target.value.length <= 100) onFieldChange("motivo", e.target.value);
                }}
                disabled={isSaving}
                placeholder="Describa el motivo..."
                className="w-100 min-h-[40px] border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#c47b96] focus:ring-1 focus:ring-[#c47b96]/10 transition-all text-sm"
                style={{
                  width: "100%",
                  resize: "none",
                  fontSize: 13,
                  color: "#374151",
                  background: fieldErrors?.motivo ? "#fef2f2" : "#fff",
                  borderColor: fieldErrors?.motivo ? "#ef4444" : undefined,
                }}
                onFocus={() => { if (fieldErrors?.motivo && setFieldErrors) setFieldErrors(prev => ({ ...prev, motivo: "" })); }}
              />
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#ef4444" }}>{fieldErrors?.motivo || ""}</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: formData.motivo.length > 90 ? "#ef4444" : "#9ca3af" }}>
                  {formData.motivo.length}/100
                </span>
              </div>
            </div>

            <div>
              <p style={labelStyle}>
                Estado Inicial
              </p>
              <Select value={formData.estado} onValueChange={(v) => onFieldChange("estado", v)}>
                <SelectTrigger className="h-10 rounded-lg bg-white border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 text-sm" style={{ fontSize: 13, color: "#374151" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className="bg-white border-gray-100 shadow-xl rounded-xl" style={{ zIndex: 99999 }}>
                  <SelectItem value="aprobada" className="text-sm" style={{ fontSize: 13 }}>Aprobada (Suma Stock)</SelectItem>
                  <SelectItem value="pendiente" className="text-sm" style={{ fontSize: 13 }}>Pendiente de Revisión</SelectItem>
                  <SelectItem value="rechazada" className="text-sm" style={{ fontSize: 13 }}>Rechazada</SelectItem>
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
                    <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em" }}>Fecha Venta</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{ventaData.fecha}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em" }}>Cliente</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{ventaData.clienteNombre || "N/A"}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em" }}>Monto Venta</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#c47b96" }}>{formatCurrency(ventaData.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Lista de productos para devolver */}
              <div style={{ background: "#ffffff", border: fieldErrors?.productos ? "1px solid #ef4444" : "1px solid #f3f4f6", borderRadius: "12px", overflow: "hidden" }}>
                <div className="flex items-center justify-between" style={{ background: fieldErrors?.productos ? "#fef2f2" : "#f9fafb", padding: "10px 16px", borderBottom: fieldErrors?.productos ? "1px solid #fee2e2" : "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ ...labelStyle, margin: 0, color: fieldErrors?.productos ? "#ef4444" : labelStyle.color }}>
                      <Package className="w-3.5 h-3.5" /> Productos de la Venta
                    </p>
                    {fieldErrors?.productos && <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>({fieldErrors.productos})</span>}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#c47b96", background: "#fff0f5", padding: "2px 8px", borderRadius: 12 }}>
                    {productosDevolver.filter(p => p.selected).length} SELECCIONADOS
                  </span>
                </div>
                
                <div style={{ padding: "0", maxHeight: "280px", overflowY: "auto" }}>
                  {(ventaData.productos || []).map((item: any, index: number) => {
                    const producto = productos.find((p) => p.id === item.productoId);
                    const isSelected = productosDevolver[index]?.selected || false;
                    const cantidadDev = productosDevolver[index]?.cantidadADevolver || 0;
                    const subtotal = isSelected ? (cantidadDev * item.precioUnitario) : 0;

                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 14,
                          padding: "16px",
                          borderBottom: index < ventaData.productos.length - 1 ? "1px solid #f9fafb" : "none",
                          background: isSelected ? "#fffafb" : "#fff",
                          transition: "background 0.2s"
                        }}
                      >
                        {/* Header: Checkbox + Nombre Producto + Precio unitario */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleProducto(index)}
                            disabled={isSaving}
                            style={{
                              width: 18, height: 18, cursor: "pointer",
                              accentColor: "#c47b96"
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 800, color: "#111827", margin: 0 }}>{producto?.nombre || "Producto Desconocido"}</p>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", margin: "2px 0 0 0" }}>Precio Unitario: {formatCurrency(item.precioUnitario)}</p>
                          </div>
                        </div>

                        {/* Fila 2: Original | A Devolver | Subtotal */}
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, paddingLeft: 30 }}>
                          {/* Cantidad Original */}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Cant. Original</p>
                            <div style={{ height: 38, borderRadius: 8, background: "#f9fafb", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", padding: "0 10px" }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7280" }}>{item.cantidad}</span>
                            </div>
                          </div>
                          
                          {/* Cantidad a devolver */}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: fieldErrors?.[`cantidad_${index}`] ? "#ef4444" : (isSelected ? "#9ca3af" : "#d1d5db"), textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>A Devolver</p>
                            <input
                              type="number"
                              value={cantidadDev === 0 && !isSelected ? "" : cantidadDev}
                              onChange={(e) => onCantidadChange(index, parseInt(e.target.value) || 0)}
                              disabled={!isSelected || isSaving}
                              min={0}
                              max={item.cantidad}
                              placeholder="0"
                              style={{
                                width: "100%", height: 38, padding: "0 10px",
                                border: fieldErrors?.[`cantidad_${index}`] ? "1px solid #ef4444" : "1px solid #e5e7eb", borderRadius: 8,
                                fontSize: 13, fontWeight: 600, textAlign: "center",
                                color: "#374151", background: fieldErrors?.[`cantidad_${index}`] ? "#fef2f2" : (!isSelected ? "#f9fafb" : "#fff"),
                                outline: "none", boxSizing: "border-box", transition: "border-color 0.15s"
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = fieldErrors?.[`cantidad_${index}`] ? "#ef4444" : "#c47b96";
                                if (fieldErrors?.[`cantidad_${index}`] && setFieldErrors) setFieldErrors(prev => { const n = {...prev}; delete n[`cantidad_${index}`]; return n; });
                              }}
                              onBlur={(e) => (e.target.style.borderColor = fieldErrors?.[`cantidad_${index}`] ? "#ef4444" : "#e5e7eb")}
                            />
                            {fieldErrors?.[`cantidad_${index}`] && <p style={{ fontSize: 10, color: "#ef4444", margin: "4px 0 0", fontWeight: 600 }}>{fieldErrors[`cantidad_${index}`]}</p>}
                          </div>

                          {/* Subtotal Devolución */}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: isSelected ? "#9ca3af" : "#d1d5db", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Subtotal</p>
                            <div
                              style={{
                                height: 38, borderRadius: 8,
                                background: subtotal > 0 ? "#fff0f5" : "#f9fafb",
                                border: `1px solid ${subtotal > 0 ? "#f0d5e0" : "#f3f4f6"}`,
                                display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 10px"
                              }}
                            >
                              <span style={{ fontSize: 13, fontWeight: 800, color: subtotal > 0 ? "#c47b96" : "#9ca3af", whiteSpace: "nowrap" }}>
                                {subtotal > 0 ? formatCurrency(subtotal) : "—"}
                              </span>
                            </div>
                          </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#9ca3af" }}>Reembolso:</span>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#c47b96", letterSpacing: "-0.5px" }}>
              {formatCurrency(totalDevolucion)}
            </span>
          </div>

          <div className="flex gap-3">
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
              disabled={isSaving || !ventaData || totalDevolucion === 0}
              style={{
                padding: "10px 28px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: (isSaving || !ventaData || totalDevolucion === 0) ? "not-allowed" : "pointer",
                border: "none",
                background: "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(196,123,150,0.3)",
                transition: "all 0.2s",
                opacity: (isSaving || !ventaData || totalDevolucion === 0) ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(196,123,150,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(196,123,150,0.3)"; }}
            >
              {isSaving ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
                  Procesando...
                </span>
              ) : (
                "Confirmar Devolución"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
