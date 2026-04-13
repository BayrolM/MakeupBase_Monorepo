import jsPDF from "jspdf";
import { toast } from "sonner";
import { formatCurrency } from "./utils";
import { Cliente, Producto } from "./store";

interface VentaData {
  id: string;
  fecha: string;
  metodoPago: string;
  clienteId: string;
  subtotal: number;
  iva: number;
  total: number;
  productos: {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
  }[];
}

export const generateSalePDF = async (
  venta: VentaData,
  cliente: Cliente | undefined,
  productosDestino: Producto[],
) => {
  try {
    const doc = new jsPDF() as any;

    // COLORES (mismos que pedidos)
    const cPrimary = [46, 16, 32];      // #2e1020
    const cSecondary = [224, 146, 178]; // #e092b2
    const cBorder = [220, 220, 220];
    const cText = [40, 40, 40];
    const cLightGray = [248, 248, 248];

    const formatP = (v: number) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(isNaN(v) ? 0 : v);

    // 1. BARRA SUPERIOR
    doc.setFillColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.rect(0, 0, 210, 4, "F");

    // Logo
    try {
      const img = new Image();
      img.src = "/logo.png";
      await new Promise((resolve) => {
        img.onload = () => { doc.addImage(img, "PNG", 20, 12, 18, 18); resolve(true); };
        img.onerror = () => resolve(false);
      });
    } catch (e) {}

    // Nombre empresa
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.text("GLAMOUR ML", 45, 20);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text("TIENDA DE BELLEZA & CUIDADO PERSONAL", 45, 25);

    // Número de factura (derecha)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.text("FACTURA DE VENTA", 190, 20, { align: "right" });
    doc.setFontSize(10);
    doc.setTextColor(cSecondary[0], cSecondary[1], cSecondary[2]);
    doc.text(`#${venta.id.slice(0, 8).toUpperCase()}`, 190, 26, { align: "right" });

    // 2. LÍNEA DIVISORA + INFO CLIENTE
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.line(20, 40, 190, 40);

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("CLIENTE:", 20, 50);
    doc.text("INFORMACIÓN DE CONTACTO:", 110, 50);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(cText[0], cText[1], cText[2]);
    doc.text(cliente?.nombre || "Consumidor Final", 20, 56);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Doc: ${cliente?.documento || cliente?.numeroDocumento || "N/A"}`, 20, 62);

    doc.setFont("helvetica", "bold");
    doc.text(cliente?.email || "N/A", 110, 56);
    doc.setFont("helvetica", "normal");
    doc.text(`Tel: ${cliente?.telefono || "N/A"}`, 110, 62);
    doc.text(`Fecha: ${venta.fecha}`, 110, 68);
    doc.text(`Método de pago: ${venta.metodoPago || "N/A"}`, 110, 74);

    // 3. TABLA DE PRODUCTOS
    let tableY = 86;

    // Header tabla
    doc.setFillColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.rect(20, tableY, 170, 10, "F");
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PRODUCTO / DESCRIPCIÓN", 25, tableY + 6.5);
    doc.text("CANT", 115, tableY + 6.5, { align: "center" });
    doc.text("PRECIO UNIT.", 148, tableY + 6.5, { align: "center" });
    doc.text("TOTAL", 185, tableY + 6.5, { align: "right" });

    tableY += 10;
    doc.setTextColor(cText[0], cText[1], cText[2]);
    doc.setFont("helvetica", "normal");

    (venta.productos || []).forEach((p: any, i: number) => {
      const prod = productosDestino.find((pr: Producto) => pr.id === p.productoId);
      const nameLines = doc.splitTextToSize(prod?.nombre || "Producto", 80);
      const rowHeight = nameLines.length * 5 + 6;

      // Fondo alternado
      if (i % 2 !== 0) {
        doc.setFillColor(cLightGray[0], cLightGray[1], cLightGray[2]);
        doc.rect(20, tableY, 170, rowHeight, "F");
      }

      // Bordes
      doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
      doc.setLineWidth(0.1);
      doc.line(20, tableY + rowHeight, 190, tableY + rowHeight);
      doc.line(20, tableY, 20, tableY + rowHeight);
      doc.line(190, tableY, 190, tableY + rowHeight);

      doc.text(nameLines, 25, tableY + 6);
      doc.text(String(p.cantidad || 0), 115, tableY + 6, { align: "center" });
      doc.text(formatP(p.precioUnitario || 0), 148, tableY + 6, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.text(formatP((p.cantidad || 0) * (p.precioUnitario || 0)), 185, tableY + 6, { align: "right" });
      doc.setFont("helvetica", "normal");

      tableY += rowHeight;
    });

    // 4. TOTALES
    const footerY = Math.max(tableY + 15, 185);

    doc.setDrawColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.setLineWidth(0.5);
    doc.line(120, footerY, 190, footerY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text("Subtotal:", 125, footerY + 10);
    doc.text(`IVA (${Math.round((venta.iva / (venta.subtotal || 1)) * 100)}%):`, 125, footerY + 16);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.text("TOTAL:", 125, footerY + 26);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(cText[0], cText[1], cText[2]);
    doc.text(formatP(venta.subtotal), 185, footerY + 10, { align: "right" });
    doc.text(formatP(venta.iva), 185, footerY + 16, { align: "right" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.text(formatP(venta.total), 185, footerY + 26, { align: "right" });

    // 5. FOOTER
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150);
    doc.text("Gracias por su compra. Este comprobante no representa una factura fiscal legal.", 20, 275);
    doc.text("GLAMOUR ML - Medellín, Colombia", 20, 280);

    doc.save(`GlamourML_Factura_${venta.id.slice(0, 8)}.pdf`);
    toast.success("Factura generada correctamente");
  } catch (error) {
    console.error("Error generando PDF:", error);
    toast.error("Ocurrió un error al intentar generar el PDF");
  }
};

export const generateOrderPDF = async (
  orderData: any,
  cliente: Cliente | undefined,
  productosDestino: Producto[],
  CONFIG: any,
) => {
  try {
    const doc = new jsPDF() as any;

    // COLORES PROFESIONALES
    const cPrimary = [46, 16, 32]; // #2e1020
    const cSecondary = [224, 146, 178]; // #e092b2
    const cBorder = [220, 220, 220];
    const cText = [40, 40, 40];
    const cLightGray = [248, 248, 248];

    // Formateo de fecha Day Month
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const d = new Date(orderData.fecha);
    const fechaTxt = isNaN(d.getDate())
      ? orderData.fecha
      : `${d.getDate()} ${months[d.getMonth()]}`;

    // 1. CABECERA LIMPIA
    // Linea de adorno superior
    doc.setFillColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.rect(0, 0, 210, 4, "F");

    // Logo centrado a la izquierda
    try {
      const logoUrl = "/logo.png";
      const img = new Image();
      img.src = logoUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          doc.addImage(img, "PNG", 20, 12, 18, 18);
          resolve(true);
        };
        img.onerror = () => resolve(false);
      });
    } catch (e) {}

    // Titulo y Metadata a la derecha
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.text("GLAMOUR ML", 45, 20);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.setFont("helvetica", "normal");
    doc.text("TIENDA DE BELLEZA & CUIDADO PERSONAL", 45, 25);

    doc.setFontSize(14);
    doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.setFont("helvetica", "bold");
    doc.text("COMPROBANTE", 190, 20, { align: "right" });
    doc.setFontSize(10);
    doc.setTextColor(cSecondary[0], cSecondary[1], cSecondary[2]);
    doc.text(`#${orderData.id.slice(0, 8).toUpperCase()}`, 190, 26, {
      align: "right",
    });

    // 2. INFORMACIÓN DE CONTACTO (BILL TO / SHIP TO)
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.line(20, 40, 190, 40);

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("CLIENTE:", 20, 50);
    doc.text("METODOS DE CONTACTO:", 110, 50);

    doc.setFontSize(11);
    doc.setTextColor(cText[0], cText[1], cText[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`${orderData.clienteNombre || cliente?.nombre || "N/A"}`, 20, 56);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${orderData.direccionEnvio}`, 20, 62);

    doc.setFont("helvetica", "bold");
    doc.text(`${cliente?.email || "N/A"}`, 110, 56);
    doc.setFont("helvetica", "normal");
    doc.text(`${cliente?.telefono || "N/A"}`, 110, 62);
    doc.text(`Fecha: ${fechaTxt}`, 110, 68);

    // 3. TABLA DE PRODUCTOS (GRID ESTRUCTURADO)
    let tableY = 80;

    // Header Table
    doc.setFillColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.rect(20, tableY, 170, 10, "F");
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PRODUCTO / DESCRIPCIÓN", 25, tableY + 6.5);
    doc.text("CANT", 115, tableY + 6.5, { align: "center" });
    doc.text("PRECIO", 145, tableY + 6.5, { align: "center" });
    doc.text("TOTAL", 185, tableY + 6.5, { align: "right" });

    tableY += 10;
    doc.setTextColor(cText[0], cText[1], cText[2]);
    doc.setFont("helvetica", "normal");

    const formatP = (v: number) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(v);

    (orderData.productos || []).forEach((p: any, i: number) => {
      const prod = productosDestino.find((pr) => pr.id === p.productoId);
      const nameLines = doc.splitTextToSize(prod?.nombre || "Producto", 80);
      const rowHeight = nameLines.length * 5 + 6;

      // Fila Fondo
      if (i % 2 !== 0) {
        doc.setFillColor(cLightGray[0], cLightGray[1], cLightGray[2]);
        doc.rect(20, tableY, 170, rowHeight, "F");
      }

      // Bordes
      doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
      doc.setLineWidth(0.1);
      doc.line(20, tableY + rowHeight, 190, tableY + rowHeight);
      doc.line(20, tableY, 20, tableY + rowHeight);
      doc.line(190, tableY, 190, tableY + rowHeight);

      doc.text(nameLines, 25, tableY + 6);
      doc.text(String(p.cantidad), 115, tableY + 6, { align: "center" });
      doc.text(
        formatP(p.precio_unit_ov || p.precio_unitario || p.precioUnitario),
        145,
        tableY + 6,
        { align: "center" },
      );
      doc.setFont("helvetica", "bold");
      doc.text(
        formatP(
          p.cantidad *
            (p.precio_unit_ov || p.precio_unitario || p.precioUnitario),
        ),
        185,
        tableY + 6,
        { align: "right" },
      );
      doc.setFont("helvetica", "normal");

      tableY += rowHeight;
    });

    // 4. TOTALES
    let footerY = Math.max(tableY + 15, 180);

    doc.setDrawColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.setLineWidth(0.5);
    doc.line(120, footerY, 190, footerY);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Subtotal:", 125, footerY + 10);
    doc.text("Envío:", 125, footerY + 16);

    doc.setFontSize(12);
    doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", 125, footerY + 26);

    // Valores
    doc.setFontSize(10);
    doc.setTextColor(cText[0], cText[1], cText[2]);
    doc.setFont("helvetica", "normal");
    doc.text(
      formatP(orderData.total - (CONFIG.COSTO_ENVIO || 0)),
      185,
      footerY + 10,
      { align: "right" },
    );
    doc.text(formatP(CONFIG.COSTO_ENVIO || 0), 185, footerY + 16, {
      align: "right",
    });

    doc.setFontSize(16);
    doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.setFont("helvetica", "bold");
    doc.text(formatP(orderData.total), 185, footerY + 26, { align: "right" });

    // Notas finales
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Gracias por su compra. Este comprobante no representa una factura fiscal legal.",
      20,
      275,
    );
    doc.text("GLAMOUR ML - Medellín, Colombia", 20, 280);

    doc.save(`GlamourML_Pedido_${orderData.id.slice(0, 5)}.pdf`);
    toast.success("Comprobante generado correctamente");
  } catch (error: any) {
    console.error(error);
    toast.error("Error al generar el documento PDF");
  }
};
