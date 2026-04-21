import {
  X,
  Building2,
  Calendar,
  FileText,
  Download,
  Package,
  Hash,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { formatCurrency } from "../../../utils/compraUtils";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface CompraDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCompra: any;
  proveedores: any[];
  productos: any[];
}

export function CompraDetailDialog({
  open,
  onOpenChange,
  selectedCompra,
  proveedores,
  productos,
}: CompraDetailDialogProps) {
  if (!selectedCompra) return null;

  const proveedor = proveedores.find((p) => p.id === selectedCompra.proveedorId);
  const isConfirmada = selectedCompra.confirmada ?? selectedCompra.estado;

  const detalles = selectedCompra.detalles || [];
  const itemCount = detalles.length;

  const handlePrint = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setTextColor(196, 123, 150);
      doc.text("MAKEUPBASE CORP", 14, 22);

      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(`Comprobante de Compra #${selectedCompra.id}`, 14, 32);

      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`Proveedor: ${proveedor?.nombre || "N/A"}`, 14, 45);
      doc.text(`Fecha: ${new Date(selectedCompra.fecha).toLocaleDateString()}`, 14, 52);
      doc.text(
        `Estado: ${isConfirmada ? "Confirmada" : "Anulada"}`,
        14,
        59,
      );

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 66, 196, 66);

      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text("Detalle de Productos", 14, 76);

      let y = 86;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("Cant", 14, y);
      doc.text("Producto", 30, y);
      doc.text("P. Unit", 140, y);
      doc.text("Subtotal", 170, y);

      y += 6;
      doc.line(14, y, 196, y);
      y += 6;

      detalles.forEach((d: any) => {
        const pName =
          d.nombre_producto ||
          productos.find((p) => p.id === d.id_producto?.toString())?.nombre ||
          `Item #${d.id_producto}`;
        doc.text(`${d.cantidad}`, 14, y);
        doc.text(`${pName}`.substring(0, 40), 30, y);
        doc.text(`${formatCurrency(Number(d.precio_unitario))}`, 140, y);
        doc.text(
          `${formatCurrency(Number(d.cantidad) * Number(d.precio_unitario))}`,
          170,
          y,
        );
        y += 8;
      });

      doc.line(14, y + 2, 196, y + 2);
      doc.setFontSize(14);
      doc.setTextColor(196, 123, 150);
      doc.text(`Total: ${formatCurrency(selectedCompra.total)}`, 130, y + 15);

      doc.save(`compra_${selectedCompra.id}.pdf`);
      toast.success("PDF generado correctamente");
    } catch (e) {
      console.error(e);
      toast.error("Error al generar PDF");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-0 rounded-2xl shadow-2xl p-0 flex flex-col"
        style={{
          backgroundColor: "#fff",
          width: "95vw",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="shrink-0 px-6 py-5"
          style={{
            background: "linear-gradient(135deg, #2e1020 0%, #4a2035 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <FileText style={{ width: 18, height: 18, color: "white" }} />
              </div>
              <div>
                <DialogTitle
                  className="text-base font-bold text-white"
                  style={{ lineHeight: 1.3 }}
                >
                  Detalle de Compra
                </DialogTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <Hash
                    style={{ width: 12, height: 12, color: "rgba(255,255,255,0.5)" }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedCompra.id}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Status badge */}
              <span
                className="flex items-center gap-1.5 rounded-full"
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "5px 12px",
                  backgroundColor: isConfirmada
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(239,68,68,0.15)",
                  color: isConfirmada ? "#16a34a" : "#dc2626",
                }}
              >
                {isConfirmada ? (
                  <CheckCircle2 style={{ width: 13, height: 13 }} />
                ) : (
                  <XCircle style={{ width: 13, height: 13 }} />
                )}
                {isConfirmada ? "Confirmada" : "Anulada"}
              </span>
              <button
                onClick={() => onOpenChange(false)}
                style={{
                  padding: 6,
                  borderRadius: "50%",
                  color: "rgba(255,255,255,0.5)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1" style={{ overflowY: "auto", padding: "24px" }}>
          {/* Info Cards Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {/* Proveedor */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                padding: "14px 16px",
                border: "1px solid #f0f0f0",
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{ marginBottom: 6 }}
              >
                <Building2
                  style={{ width: 14, height: 14, color: "#c47b96" }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Proveedor
                </span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  margin: 0,
                }}
              >
                {proveedor?.nombre || "N/A"}
              </p>
            </div>

            {/* Fecha */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                padding: "14px 16px",
                border: "1px solid #f0f0f0",
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{ marginBottom: 6 }}
              >
                <Calendar
                  style={{ width: 14, height: 14, color: "#c47b96" }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Fecha
                </span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  margin: 0,
                }}
              >
                {new Date(selectedCompra.fecha).toLocaleDateString()}
              </p>
            </div>

            {/* Total */}
            <div
              style={{
                backgroundColor: "#fdf2f6",
                borderRadius: 12,
                padding: "14px 16px",
                border: "1px solid #fad6e3",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#c47b96",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Total
              </span>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#c47b96",
                  margin: 0,
                }}
              >
                {formatCurrency(selectedCompra.total)}
              </p>
            </div>
          </div>

          {/* Observaciones */}
          {selectedCompra.observaciones && (
            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                padding: "12px 16px",
                border: "1px solid #f0f0f0",
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Observaciones
              </span>
              <p
                style={{
                  fontSize: 13,
                  color: "#374151",
                  margin: "6px 0 0 0",
                }}
              >
                {selectedCompra.observaciones}
              </p>
            </div>
          )}

          {/* Products Table */}
          <div>
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 12 }}
            >
              <div className="flex items-center gap-2">
                <Package style={{ width: 15, height: 15, color: "#c47b96" }} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1a1a2e",
                  }}
                >
                  Productos
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#c47b96",
                  backgroundColor: "#fdf2f6",
                  padding: "4px 10px",
                  borderRadius: 8,
                }}
              >
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  gap: 0,
                  padding: "10px 16px",
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>
                  Producto
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  Cant.
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    textAlign: "right",
                  }}
                >
                  P. Unit.
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    textAlign: "right",
                  }}
                >
                  Subtotal
                </span>
              </div>

              {/* Table Body */}
              {detalles.length === 0 ? (
                <div
                  style={{
                    padding: "32px 16px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: 13,
                  }}
                >
                  No hay productos cargados en detalle.
                </div>
              ) : (
                detalles.map((d: any, i: number) => {
                  const pName =
                    d.nombre_producto ||
                    productos.find(
                      (p) => p.id === d.id_producto?.toString(),
                    )?.nombre ||
                    `Item #${d.id_producto}`;
                  const sub =
                    Number(d.cantidad) * Number(d.precio_unitario);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        gap: 0,
                        padding: "12px 16px",
                        borderBottom:
                          i < detalles.length - 1
                            ? "1px solid #f3f4f6"
                            : "none",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1a1a2e",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pName}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#374151",
                          textAlign: "center",
                        }}
                      >
                        {d.cantidad}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#6b7280",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(Number(d.precio_unitario))}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#c47b96",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(sub)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="shrink-0 flex items-center justify-between"
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#fafafa",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              height: 42,
              padding: "0 18px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              border: "1px solid #e5e7eb",
              backgroundColor: "white",
              color: "#374151",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background 0.15s",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor =
                "#f3f4f6")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor =
                "white")
            }
          >
            <Download style={{ width: 15, height: 15, color: "#6b7280" }} />
            Exportar PDF
          </button>
          <button
            onClick={() => onOpenChange(false)}
            style={{
              height: 42,
              padding: "0 28px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              backgroundColor: "#c47b96",
              color: "white",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor =
                "#b06a84")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor =
                "#c47b96")
            }
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
