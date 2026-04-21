import { useState } from "react";
import { X, Plus, Trash2, Search } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
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
        {/* Header */}
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
              <Plus style={{ width: 18, height: 18, color: "white" }} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white leading-tight">
                Registrar Nueva Compra
              </DialogTitle>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                Incrementa el stock con nuevas adquisiciones
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full transition-colors"
            style={{
              padding: "6px",
              color: "rgba(255,255,255,0.6)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.15)")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
            }
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 flex flex-col gap-6 p-6"
          style={{ overflowY: "auto", backgroundColor: "#f9f9fb" }}
        >
          {/* Datos Generales */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: "#1a1a2e" }}>
              Datos de la Compra
            </p>
            <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="space-y-1">
                <Label style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>
                  Proveedor
                </Label>
                <Select
                  value={formData.proveedorId}
                  onValueChange={(v) => setFormData({ ...formData, proveedorId: v })}
                >
                  <SelectTrigger
                    className="h-11 rounded-xl"
                    style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
                  >
                    <SelectValue placeholder="Seleccionar proveedor..." />
                  </SelectTrigger>
                  <SelectContent
                    style={{ backgroundColor: "white", zIndex: 9999, borderColor: "#e5e7eb" }}
                  >
                    {proveedores.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>
                  Observaciones
                </Label>
                <Input
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  className="h-11 rounded-xl"
                  style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
                  placeholder="Ej: Factura #12345..."
                />
              </div>
            </div>
          </div>

          {/* Buscador de Productos */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: "#1a1a2e" }}>
              Agregar Productos
            </p>
            <div className="flex items-center gap-3">
              {/* Search input with dropdown */}
              <div style={{ position: "relative", flex: 1 }}>
                <Input
                  className="h-11 rounded-xl pr-10"
                  style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
                  placeholder="Buscar por nombre..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowDropdown(true);
                    setSelectedProductId("");
                  }}
                  onFocus={() => setShowDropdown(true)}
                  autoComplete="off"
                />
                <Search
                  style={{
                    width: 16,
                    height: 16,
                    color: "#aaa",
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />

                {showDropdown && productSearch.length > 0 && (
                  <>
                    {/* backdrop */}
                    <div
                      style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 8999,
                      }}
                      onClick={() => setShowDropdown(false)}
                    />
                    {/* dropdown */}
                    <ul
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "100%",
                        zIndex: 9000,
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        maxHeight: 200,
                        overflowY: "auto",
                        listStyle: "none",
                        margin: 0,
                        marginTop: 6,
                        padding: 0,
                      }}
                    >
                      {filteredProducts.length === 0 ? (
                        <li
                          style={{
                            padding: "12px 16px",
                            color: "#aaa",
                            fontSize: 13,
                            textAlign: "center",
                          }}
                        >
                          No se encontraron productos
                        </li>
                      ) : (
                        filteredProducts.map((p) => (
                          <li
                            key={p.id}
                            style={{
                              padding: "10px 16px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f3f4f6",
                              transition: "background 0.15s",
                            }}
                            onMouseOver={(e) =>
                              ((e.currentTarget as HTMLElement).style.backgroundColor = "#fdf2f6")
                            }
                            onMouseOut={(e) =>
                              ((e.currentTarget as HTMLElement).style.backgroundColor = "white")
                            }
                            onClick={() => {
                              setProductSearch(p.nombre);
                              setSelectedProductId(p.id);
                              setShowDropdown(false);
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>
                              {p.nombre}
                            </div>
                            <div style={{ fontSize: 10, color: "#aaa" }}>
                              Stock: {p.stock ?? "—"}
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </>
                )}
              </div>

              {/* Agregar button */}
              <button
                onClick={handleAddProduct}
                disabled={!selectedProductId}
                style={{
                  height: 44,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "none",
                  cursor: selectedProductId ? "pointer" : "not-allowed",
                  backgroundColor: selectedProductId ? "#c47b96" : "#d1d5db",
                  color: "white",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
                onMouseOver={(e) => {
                  if (selectedProductId)
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#b06a84";
                }}
                onMouseOut={(e) => {
                  if (selectedProductId)
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#c47b96";
                }}
              >
                <Plus style={{ width: 16, height: 16 }} />
                Agregar
              </button>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: "#f9fafb" }}>
                    <TableHead style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>
                      Producto
                    </TableHead>
                    <TableHead
                      style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", width: 110, textAlign: "center" }}
                    >
                      Cantidad
                    </TableHead>
                    <TableHead
                      style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", width: 128, textAlign: "center" }}
                    >
                      Precio Unit.
                    </TableHead>
                    <TableHead
                      style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "right" }}
                    >
                      Subtotal
                    </TableHead>
                    <TableHead
                      style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", width: 56, textAlign: "center" }}
                    >
                      Acción
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.detalles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        style={{ height: 120, textAlign: "center", color: "#aaa", fontSize: 13 }}
                      >
                        No hay productos agregados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.detalles.map((d: any, i: number) => {
                      const prod = productos.find((p) => p.id === d.productoId);
                      return (
                        <TableRow key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <TableCell style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>
                              {prod?.nombre}
                            </div>
                          </TableCell>
                          <TableCell style={{ padding: "10px 12px", textAlign: "center" }}>
                            <Input
                              type="number"
                              min="1"
                              value={d.cantidad || ""}
                              onChange={(e) => {
                                const nd = [...formData.detalles];
                                nd[i].cantidad = Number(e.target.value) || 0;
                                setFormData({ ...formData, detalles: nd });
                              }}
                              style={{
                                height: 38,
                                textAlign: "center",
                                fontWeight: 700,
                                backgroundColor: "#f9fafb",
                                borderColor: "#e5e7eb",
                              }}
                            />
                          </TableCell>
                          <TableCell style={{ padding: "10px 12px", textAlign: "center" }}>
                            <Input
                              type="number"
                              min="0"
                              value={d.precioUnitario === 0 ? "" : d.precioUnitario}
                              onChange={(e) => {
                                const nd = [...formData.detalles];
                                nd[i].precioUnitario = Number(e.target.value) || 0;
                                setFormData({ ...formData, detalles: nd });
                              }}
                              style={{
                                height: 38,
                                textAlign: "center",
                                fontWeight: 700,
                                backgroundColor: "#f9fafb",
                                borderColor: "#e5e7eb",
                              }}
                              placeholder="$ 0"
                            />
                          </TableCell>
                          <TableCell
                            style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, color: "#c47b96" }}
                          >
                            {formatCurrency(d.cantidad * d.precioUnitario)}
                          </TableCell>
                          <TableCell style={{ padding: "10px 12px", textAlign: "center" }}>
                            <button
                              onClick={() => removeProductFromDetalles(i)}
                              style={{
                                padding: 7,
                                borderRadius: 8,
                                border: "none",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                color: "#aaa",
                                transition: "background 0.15s",
                              }}
                              onMouseOver={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "#fef2f2";
                                (e.currentTarget as HTMLElement).style.color = "#ef4444";
                              }}
                              onMouseOut={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                                (e.currentTarget as HTMLElement).style.color = "#aaa";
                              }}
                            >
                              <Trash2 style={{ width: 15, height: 15 }} />
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer con totales y botones */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totalPurchase)}</span>
                </div>
                <div style={{ display: "flex", gap: 20, fontSize: 18, color: "#c47b96", fontWeight: 900 }}>
                  <span>Total:</span>
                  <span>{formatCurrency(totalPurchase)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => onOpenChange(false)}
                  style={{
                    height: 42,
                    padding: "0 20px",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "white",
                    color: "#374151",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor = "#f3f4f6")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor = "white")
                  }
                >
                  Cancelar
                </button>
                <button
                  onClick={onSave}
                  disabled={isSaving || formData.detalles.length === 0}
                  style={{
                    height: 42,
                    padding: "0 24px",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    border: "none",
                    backgroundColor:
                      isSaving || formData.detalles.length === 0 ? "#d1d5db" : "#c47b96",
                    color: "white",
                    cursor:
                      isSaving || formData.detalles.length === 0 ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (!isSaving && formData.detalles.length > 0)
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#b06a84";
                  }}
                  onMouseOut={(e) => {
                    if (!isSaving && formData.detalles.length > 0)
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#c47b96";
                  }}
                >
                  {isSaving ? "Guardando..." : "Guardar Compra"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
