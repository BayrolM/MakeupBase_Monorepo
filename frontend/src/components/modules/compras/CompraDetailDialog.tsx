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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
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
        className="bg-white border border-gray-100 !w-[95vw] !max-w-[700px] rounded-2xl shadow-2xl p-0 overflow-hidden"
      >
        {/* Header con gradiente */}
        <div
          className="relative px-8 py-6"
          style={{ backgroundColor: "#c47b96" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/15 rounded-xl border border-white/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white leading-tight">
                  Detalle de Compra
                </DialogTitle>
                <DialogDescription className="text-white font-bold mt-0.5 font-mono tracking-wider">
                  ORDEN #{selectedCompra.id.slice(0, 8).toUpperCase()}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{
                  background: isConfirmada ? "rgba(209,250,229,0.9)" : "rgba(254,226,226,0.9)",
                  color: isConfirmada ? "#065f46" : "#991b1b",
                }}
              >
                {isConfirmada ? "Confirmada" : "Anulada"}
              </span>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/15 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info rápida en el header */}
          <div className="flex items-center gap-6 mt-5">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-sm font-semibold">{proveedor?.nombre || "N/A"}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-sm font-semibold">{new Date(selectedCompra.fecha).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pt-6 pb-4 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Observaciones (si existen) */}
          {selectedCompra.observaciones && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Observaciones
              </p>
              <p className="text-sm text-gray-600 italic">"{selectedCompra.observaciones}"</p>
            </div>
          )}

          {/* Tabla de productos */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-[#c47b96]" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resumen de Productos</p>
            </div>
            
            <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                    <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-wider py-3 px-4">Producto</TableHead>
                    <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-wider py-3 px-4 text-center">Cant.</TableHead>
                    <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-wider py-3 px-4 text-center">Costo Unit.</TableHead>
                    <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-wider py-3 px-4 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalles.map((d: any, i: number) => {
                    const pName = d.nombre_producto || productos.find(p => p.id === d.id_producto?.toString())?.nombre || `Item #${d.id_producto}`;
                    return (
                      <TableRow key={i} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                        <TableCell className="py-3 px-4">
                          <span className="font-bold text-gray-800 text-sm">{pName}</span>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-bold border border-gray-200">
                            {d.cantidad}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <span className="text-gray-500 text-xs font-medium">
                            {formatCurrency(Number(d.precio_unitario))}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          <span className="font-black text-gray-800 text-sm">
                            {formatCurrency(Number(d.cantidad) * Number(d.precio_unitario))}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 pb-6 pt-4 border-t border-gray-100 bg-white">
          <div className="bg-gradient-to-r from-[#fff0f5] to-[#fce8f0] rounded-xl border border-[#f0d5e0]" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
              Monto de Inversión
            </p>
            <span className="text-[#c47b96] font-black text-2xl">
              {formatCurrency(selectedCompra.total)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="h-10 px-4 rounded-lg font-bold text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Exportar PDF
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="h-10 px-6 rounded-lg font-bold text-xs text-white transition-all"
              style={{ backgroundColor: "#c47b96" }}
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
