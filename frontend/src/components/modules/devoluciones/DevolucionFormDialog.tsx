import { useState } from "react";
import { X, Plus, Search, Calendar, Package, Check, Loader2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Label } from "../../ui/label";
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
      <DialogContent
        className="border-0 rounded-2xl shadow-2xl p-0 flex flex-col"
        style={{
          backgroundColor: "#ffffff",
          width: "95vw",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* ── Header con gradiente ── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ background: "linear-gradient(135deg, #7b2d45 0%, #c47b96 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Package style={{ width: 18, height: 18, color: "white" }} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white leading-tight">
                Registrar Devolución
              </DialogTitle>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                Gestiona las devoluciones asociadas a ventas
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full transition-colors"
            style={{ padding: 6, color: "rgba(255,255,255,0.6)", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.15)")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* ── Body ── */}
        <div
          className="flex-1 flex flex-col gap-5 p-6"
          style={{ overflowY: "auto", backgroundColor: "#f9f9fb" }}
        >
          {/* Mensajes */}
          {successMessage && (
            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Check style={{ width: 16, height: 16, color: "#22c55e" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <X style={{ width: 16, height: 16, color: "#ef4444" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>{errorMessage}</span>
            </div>
          )}

          {/* Datos Generales */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: "#1a1a2e" }}>
              Datos de la Devolución
            </p>
            <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="space-y-1">
                <Label style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>
                  ID de Venta <span style={{ color: "#ef4444" }}>*</span>
                </Label>
                <div style={{ position: "relative" }}>
                  <Input
                    value={formData.ventaId}
                    onChange={(e) => onVentaIdChange(e.target.value)}
                    className="h-11 rounded-xl pr-10"
                    style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
                    placeholder="Ej: 6"
                    disabled={isSaving}
                  />
                  <Search
                    style={{
                      width: 16, height: 16, color: "#aaa",
                      position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>
                  Fecha Devolución <span style={{ color: "#ef4444" }}>*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.fechaDevolucion}
                  onChange={(e) => onFieldChange("fechaDevolucion", e.target.value)}
                  className="h-11 rounded-xl"
                  style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Motivo */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>
                Motivo <span style={{ color: "#ef4444" }}>*</span>
              </Label>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: formData.motivo.length > 90 ? "#ef4444" : "#aaa",
                }}
              >
                {formData.motivo.length}/100
              </span>
            </div>
            <textarea
              value={formData.motivo}
              onChange={(e) => {
                if (e.target.value.length <= 100) onFieldChange("motivo", e.target.value);
              }}
              disabled={isSaving}
              placeholder="Describa el motivo de la devolución (mínimo 5 caracteres)..."
              style={{
                width: "100%",
                minHeight: 80,
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 13,
                color: "#1a1a2e",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Estado */}
          <div className="space-y-1">
            <Label style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>
              Estado de la Devolución
            </Label>
            <Select value={formData.estado} onValueChange={(v) => onFieldChange("estado", v)}>
              <SelectTrigger
                className="h-11 rounded-xl"
                style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "white", zIndex: 9999, borderColor: "#e5e7eb" }}>
                <SelectItem value="aprobada">Aprobada (Directo — Suma Stock)</SelectItem>
                <SelectItem value="pendiente">Pendiente de Revisión</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Resumen de Venta ── */}
          {ventaData ? (
            <>
              <div
                style={{
                  backgroundColor: "#fdf2f6",
                  borderRadius: 12,
                  padding: "14px 16px",
                  border: "1px solid #fad6e3",
                }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                  <Info style={{ width: 14, height: 14, color: "#c47b96" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Resumen de la Venta #{ventaData.id}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>Fecha</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{ventaData.fecha}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>Cliente</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>
                      {ventaData.clienteNombre || clientes.find((c) => c.id === ventaData.clienteId)?.nombre || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>Total Venta</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#c47b96" }}>{formatCurrency(ventaData.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* ── Productos a devolver ── */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-2">
                    <Package style={{ width: 15, height: 15, color: "#c47b96" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>Productos a Devolver</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#c47b96", backgroundColor: "#fdf2f6", padding: "4px 10px", borderRadius: 8 }}>
                    {productosDevolver.filter((p) => p.selected).length} seleccionados
                  </span>
                </div>

                <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", backgroundColor: "white" }}>
                  {/* Header */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "28px 2fr 80px 90px",
                      gap: 0,
                      padding: "10px 16px",
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <span />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>Producto</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "center" }}>Comprado</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "center" }}>A Devolver</span>
                  </div>

                  {/* Body */}
                  {(ventaData.productos || []).map((item: any, index: number) => {
                    const producto = productos.find((p) => p.id === item.productoId);
                    const isSelected = productosDevolver[index]?.selected || false;

                    return (
                      <div
                        key={index}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "28px 2fr 80px 90px",
                          gap: 0,
                          padding: "12px 16px",
                          borderBottom: index < (ventaData.productos || []).length - 1 ? "1px solid #f3f4f6" : "none",
                          alignItems: "center",
                          backgroundColor: isSelected ? "#fdf2f6" : "white",
                          transition: "background 0.15s",
                        }}
                      >
                        {/* Checkbox */}
                        <div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleProducto(index)}
                            disabled={isSaving}
                            style={{ width: 16, height: 16, accentColor: "#c47b96", cursor: "pointer" }}
                          />
                        </div>
                        {/* Nombre */}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>
                            {producto?.nombre || "Producto desconocido"}
                          </div>
                          <div style={{ fontSize: 10, color: "#aaa" }}>
                            {formatCurrency(item.precioUnitario)} / unidad
                          </div>
                        </div>
                        {/* Cantidad original */}
                        <div style={{ textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              backgroundColor: "#f3f4f6",
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#374151",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {item.cantidad}
                          </span>
                        </div>
                        {/* Cantidad a devolver */}
                        <div style={{ textAlign: "center" }}>
                          <Input
                            type="number"
                            value={productosDevolver[index]?.cantidadADevolver || 0}
                            onChange={(e) => onCantidadChange(index, parseInt(e.target.value) || 0)}
                            disabled={!isSelected || isSaving}
                            min={0}
                            max={item.cantidad}
                            style={{
                              height: 36,
                              width: 70,
                              textAlign: "center",
                              fontWeight: 700,
                              backgroundColor: isSelected ? "#fff" : "#f9fafb",
                              borderColor: "#e5e7eb",
                              margin: "0 auto",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                backgroundColor: "white",
                borderRadius: 12,
                border: "1px dashed #d1d5db",
              }}
            >
              <Search style={{ width: 32, height: 32, color: "#d1d5db", margin: "0 auto 12px auto" }} />
              <p style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic" }}>
                Ingresa el ID de una venta para cargar los productos.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="shrink-0"
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* Total */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Reembolso
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#c47b96" }}>
              {formatCurrency(totalDevolucion)}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              style={{
                height: 42, padding: "0 20px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                border: "1px solid #e5e7eb", backgroundColor: "white", color: "#374151",
                cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.5 : 1,
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => { if (!isSaving) (e.currentTarget as HTMLElement).style.backgroundColor = "#f3f4f6"; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "white"; }}
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={isSaving || !ventaData}
              style={{
                height: 42, padding: "0 24px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                border: "none",
                backgroundColor: isSaving || !ventaData ? "#d1d5db" : "#c47b96",
                color: "white",
                cursor: isSaving || !ventaData ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                minWidth: 180, transition: "background 0.2s",
              }}
              onMouseOver={(e) => { if (!isSaving && ventaData) (e.currentTarget as HTMLElement).style.backgroundColor = "#b06a84"; }}
              onMouseOut={(e) => { if (!isSaving && ventaData) (e.currentTarget as HTMLElement).style.backgroundColor = "#c47b96"; }}
            >
              {isSaving ? (
                <>
                  <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.8">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                    </path>
                  </svg>
                  Procesando...
                </>
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
