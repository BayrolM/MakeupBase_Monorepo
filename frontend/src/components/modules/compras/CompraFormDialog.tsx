import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Search, Package, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { formatCurrency } from "../../../utils/compraUtils";

interface CompraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    proveedorId: string;
    observaciones: string;
    detalles: {
      productoId: string;
      cantidad: number | "";
      precioUnitario: number | "";
    }[];
  };
  setFormData: (data: any) => void;
  proveedores: any[];
  productos: any[];
  isSaving: boolean;
  onSave: () => void;
  fieldErrors?: Record<string, string>;
  setFieldErrors?: (errors: Record<string, string>) => void;
}

// ── Buscador de producto ──────────────────────────────────────
function ProductSearchDropdown({
  value,
  onChange,
  productos,
  hasError,
  errorMessage,
  onClearError,
}: {
  value: string;
  onChange: (id: string, cost: number) => void;
  productos: any[];
  hasError?: boolean;
  errorMessage?: string;
  onClearError?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = productos.find((p) => p.id === value);
  const displayValue = isOpen ? search : (selected?.nombre ?? "");
  const filtered = productos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && containerRef.current) {
      setRect(containerRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => setIsOpen(false);
    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <div style={{ position: "relative" }}>
        <input
          value={displayValue}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => { setSearch(""); setIsOpen(true); if(onClearError) onClearError(); }}
          onBlur={() => setTimeout(() => setIsOpen(false), 180)}
          placeholder="Buscar y seleccionar producto..."
          style={{
            width: "100%",
            height: 38,
            padding: "0 32px 0 10px",
            border: hasError ? "1px solid #ef4444" : "1px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 13,
            color: "#374151",
            background: hasError ? "#fef2f2" : "#fff",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => { (e.target as HTMLInputElement).style.borderColor = hasError ? "#ef4444" : "#c47b96"; }}
          onMouseLeave={(e) => { if (document.activeElement !== e.target) (e.target as HTMLInputElement).style.borderColor = hasError ? "#ef4444" : "#e5e7eb"; }}
        />
        <Search
          className={`w-3.5 h-3.5 ${hasError ? "text-red-400" : "text-gray-400"}`}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        />
      </div>
      
      {hasError && errorMessage && (
        <p style={{ fontSize: 10, color: "#ef4444", margin: "4px 0 0", fontWeight: 600 }}>{errorMessage}</p>
      )}

      {isOpen && rect && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed",
            zIndex: 999999,
            background: "#fff",
            border: "1px solid #f3f4f6",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            maxHeight: 220,
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: "14px 16px", fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
              Sin resultados
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(p.id, p.precioCompra || p.precioCosto || 0);
                  setIsOpen(false);
                }}
                style={{ padding: "9px 14px", fontSize: 13, cursor: "pointer", borderBottom: "1px solid #f9fafb", color: "#374151", transition: "background 0.1s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff0f5"; (e.currentTarget as HTMLElement).style.color = "#c47b96"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#374151"; }}
              >
                {p.nombre}
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export function CompraFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  proveedores,
  productos,
  isSaving,
  onSave,
  fieldErrors,
  setFieldErrors,
}: CompraFormDialogProps) {
  const totalPurchase = formData.detalles.reduce(
    (acc, d) => acc + (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0),
    0
  );

  const addRow = () => {
    setFormData({
      ...formData,
      detalles: [...formData.detalles, { productoId: "", cantidad: "", precioUnitario: "" }],
    });
    if (fieldErrors?.detalles && setFieldErrors) {
      setFieldErrors({ ...fieldErrors, detalles: "" });
    }
  };

  const removeRow = (i: number) => {
    const nd = [...formData.detalles];
    nd.splice(i, 1);
    setFormData({ ...formData, detalles: nd });
  };

  const updateRow = (i: number, field: string, val: any) => {
    const nd = [...formData.detalles] as any[];
    nd[i][field] = val;
    setFormData({ ...formData, detalles: nd });
  };

  // Estilo de etiqueta de campo
  const label: React.CSSProperties = {
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
      <DialogContent
        className="bg-white border border-gray-100 !w-[95vw] !max-w-[900px] rounded-2xl shadow-2xl p-0"
        style={{ overflow: "visible" }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 2px 8px rgba(196,123,150,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle style={{ fontSize: 15, fontWeight: 800, color: "#111827", lineHeight: 1.3 }}>
                Nueva Compra
              </DialogTitle>
              <DialogDescription style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                Completa los datos para registrar la adquisición
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

        {/* ── Body ── */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, maxHeight: "72vh", overflowY: "auto" }}>

          {/* Fila superior: Proveedor + Observaciones */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ ...label, color: fieldErrors?.proveedorId ? "#ef4444" : label.color }}>
                <Search className="w-3.5 h-3.5" /> Proveedor <span style={{ color: "#f87171" }}>*</span>
              </p>
              <Select value={formData.proveedorId} onValueChange={(v) => {
                setFormData({ ...formData, proveedorId: v });
                if (fieldErrors?.proveedorId && setFieldErrors) setFieldErrors({ ...fieldErrors, proveedorId: "" });
              }}>
                <SelectTrigger className={`h-10 rounded-lg bg-white text-sm focus:ring-[#c47b96]/10 ${fieldErrors?.proveedorId ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-200 focus:border-[#c47b96]"}`}>
                  <SelectValue placeholder="Seleccionar proveedor..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100 shadow-xl rounded-xl z-[9999]">
                  {proveedores.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-sm">{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors?.proveedorId && <p style={{ fontSize: 10, color: "#ef4444", margin: "4px 0 0", fontWeight: 600 }}>{fieldErrors.proveedorId}</p>}
            </div>

            <div>
              <p style={label}>Observaciones</p>
              <Input
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="h-10 rounded-lg border-gray-200 focus:border-[#c47b96] focus:ring-[#c47b96]/10 bg-white text-sm"
                placeholder="Ej: Factura #12345..."
              />
            </div>
          </div>

          {/* ── Sección de productos ── */}
          <div style={{ border: fieldErrors?.detalles ? "1px solid #ef4444" : "1px solid #f3f4f6", borderRadius: 12 }}>

            {/* Header sección */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: fieldErrors?.detalles ? "#fef2f2" : "#f9fafb", padding: "10px 16px", borderBottom: fieldErrors?.detalles ? "1px solid #fee2e2" : "1px solid #f3f4f6", borderRadius: "12px 12px 0 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ ...label, margin: 0, color: fieldErrors?.detalles ? "#ef4444" : label.color }}>
                  <Package className="w-3.5 h-3.5" /> Productos <span style={{ color: "#f87171" }}>*</span>
                </p>
                {fieldErrors?.detalles && <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>({fieldErrors.detalles})</span>}
              </div>
              <button
                type="button"
                onClick={addRow}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  background: "linear-gradient(135deg, #c47b96, #a85d77)",
                  color: "#fff", border: "none", cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(196,123,150,0.3)", transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Plus className="w-3.5 h-3.5" /> Añadir producto
              </button>
            </div>

            {/* Cabecera eliminada porque usamos etiquetas por campo */}

            {/* Filas de detalle */}
            {formData.detalles.length === 0 ? (
              <div style={{ padding: "36px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>
                No hay productos añadidos. Haz clic en «Añadir producto» para comenzar.
              </div>
            ) : (
              formData.detalles.map((d: any, i: number) => {
                const subtotal = (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      padding: "16px",
                      borderBottom: i < formData.detalles.length - 1 ? "1px solid #f9fafb" : "none",
                    }}
                  >
                    {/* Fila 1: Producto + Cantidad */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                      {/* Producto */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: fieldErrors?.[`producto_${i}`] ? "#ef4444" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Producto</p>
                        <ProductSearchDropdown
                          value={d.productoId}
                          productos={productos}
                          hasError={!!fieldErrors?.[`producto_${i}`]}
                          errorMessage={fieldErrors?.[`producto_${i}`]}
                          onClearError={() => {
                            if (fieldErrors?.[`producto_${i}`] && setFieldErrors) {
                              setFieldErrors({ ...fieldErrors, [`producto_${i}`]: "" });
                            }
                          }}
                          onChange={(id, cost) => {
                            const nd = [...formData.detalles] as any[];
                            nd[i].productoId = id;
                            nd[i].precioUnitario = cost || "";
                            setFormData({ ...formData, detalles: nd });
                            if (fieldErrors && setFieldErrors) {
                              const newErrors = { ...fieldErrors };
                              delete newErrors[`producto_${i}`];
                              delete newErrors[`precio_${i}`];
                              setFieldErrors(newErrors);
                            }
                          }}
                        />
                      </div>

                      {/* Cantidad */}
                      <div style={{ width: 120, flexShrink: 0 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: fieldErrors?.[`cantidad_${i}`] ? "#ef4444" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Cantidad</p>
                        <input
                          type="number"
                          min="1"
                          value={d.cantidad === "" ? "" : d.cantidad}
                          onChange={(e) => updateRow(i, "cantidad", e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                          placeholder="Cant."
                          style={{
                            width: "100%",
                            height: 38,
                            padding: "0 10px",
                            border: fieldErrors?.[`cantidad_${i}`] ? "1px solid #ef4444" : "1px solid #e5e7eb",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            textAlign: "center",
                            color: "#374151",
                            background: fieldErrors?.[`cantidad_${i}`] ? "#fef2f2" : "#fff",
                            outline: "none",
                            boxSizing: "border-box",
                            transition: "border-color 0.15s",
                          }}
                          onFocus={(e) => { 
                            e.target.style.borderColor = fieldErrors?.[`cantidad_${i}`] ? "#ef4444" : "#c47b96";
                            if (fieldErrors?.[`cantidad_${i}`] && setFieldErrors) setFieldErrors({ ...fieldErrors, [`cantidad_${i}`]: "" });
                          }}
                          onBlur={(e) => (e.target.style.borderColor = fieldErrors?.[`cantidad_${i}`] ? "#ef4444" : "#e5e7eb")}
                        />
                        {fieldErrors?.[`cantidad_${i}`] && <p style={{ fontSize: 10, color: "#ef4444", margin: "4px 0 0", fontWeight: 600 }}>{fieldErrors[`cantidad_${i}`]}</p>}
                      </div>
                    </div>

                    {/* Fila 2: Precio + Subtotal + Eliminar */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                      {/* Precio */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: fieldErrors?.[`precio_${i}`] ? "#ef4444" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Precio Unitario</p>
                        <input
                          type="number"
                          min="0"
                          value={d.precioUnitario === "" ? "" : d.precioUnitario}
                          onChange={(e) => updateRow(i, "precioUnitario", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                          placeholder="$ Precio unitario"
                          style={{
                            width: "100%",
                            height: 38,
                            padding: "0 10px",
                            border: fieldErrors?.[`precio_${i}`] ? "1px solid #ef4444" : "1px solid #e5e7eb",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#374151",
                            background: fieldErrors?.[`precio_${i}`] ? "#fef2f2" : "#fff",
                            outline: "none",
                            boxSizing: "border-box",
                            transition: "border-color 0.15s",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = fieldErrors?.[`precio_${i}`] ? "#ef4444" : "#c47b96";
                            if (fieldErrors?.[`precio_${i}`] && setFieldErrors) setFieldErrors({ ...fieldErrors, [`precio_${i}`]: "" });
                          }}
                          onBlur={(e) => (e.target.style.borderColor = fieldErrors?.[`precio_${i}`] ? "#ef4444" : "#e5e7eb")}
                        />
                        {fieldErrors?.[`precio_${i}`] && <p style={{ fontSize: 10, color: "#ef4444", margin: "4px 0 0", fontWeight: 600 }}>{fieldErrors[`precio_${i}`]}</p>}
                      </div>

                      {/* Subtotal */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Subtotal</p>
                        <div
                          style={{
                            height: 38,
                            borderRadius: 8,
                            background: subtotal > 0 ? "#fff0f5" : "#f9fafb",
                            border: `1px solid ${subtotal > 0 ? "#f0d5e0" : "#f3f4f6"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            padding: "0 10px",
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 800, color: subtotal > 0 ? "#c47b96" : "#9ca3af", whiteSpace: "nowrap" }}>
                            {subtotal > 0 ? formatCurrency(subtotal) : "—"}
                          </span>
                        </div>
                      </div>

                      {/* Eliminar */}
                      <div style={{ width: 38, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
                        <button
                          onClick={() => removeRow(i)}
                          style={{
                            width: 32, height: 32, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid #f3f4f6", background: "#fff",
                            color: "#9ca3af", cursor: "pointer", transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fecaca"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#fff5f5"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f3f4f6"; e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "#fff"; }}
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 22px", borderTop: "1px solid #f3f4f6", background: "#fff" }}>
          {/* Total */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af" }}>Inversión Total:</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#c47b96", letterSpacing: "-0.5px" }}>
              {formatCurrency(totalPurchase)}
            </span>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              style={{
                padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                border: "1.5px solid #f0d5e0", background: "#fff8fb", color: "#c47b96",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fdf2f6"; e.currentTarget.style.borderColor = "#c47b96"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff8fb"; e.currentTarget.style.borderColor = "#f0d5e0"; }}
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={isSaving || formData.detalles.length === 0}
              style={{
                padding: "10px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: (isSaving || formData.detalles.length === 0) ? "not-allowed" : "pointer",
                border: "none",
                background: "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(196,123,150,0.3)",
                opacity: (isSaving || formData.detalles.length === 0) ? 0.65 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isSaving && formData.detalles.length > 0) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(196,123,150,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(196,123,150,0.3)";
              }}
            >
              {isSaving ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
                  Guardando...
                </span>
              ) : "Guardar Compra"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}