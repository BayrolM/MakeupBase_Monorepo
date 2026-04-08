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

export const generateSalePDF = (
  venta: VentaData,
  cliente: Cliente | undefined,
  productosDestino: Producto[],
) => {
  try {
    const doc = new jsPDF() as any;

    // Header principal
    doc.setFontSize(22);
    doc.setTextColor(255, 105, 180);
    doc.text("GLAMOUR ML", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("NIT: 900.XXX.XXX-X | Medellín, Colombia", 105, 28, {
      align: "center",
    });

    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);

    // Detalles Venta
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("FACTURA DE VENTA", 20, 45);
    doc.setFontSize(10);
    doc.text(`No. FACTURA: ${venta.id}`, 20, 52);
    doc.text(`FECHA: ${venta.fecha}`, 20, 57);
    doc.text(`MÉTODO DE PAGO: ${venta.metodoPago || "N/A"}`, 20, 62);

    // Datos Cliente
    doc.setFontSize(12);
    doc.text("DATOS DEL CLIENTE", 120, 45);
    doc.setFontSize(10);
    doc.text(`NOMBRE: ${cliente?.nombre || "N/A"}`, 120, 52);
    doc.text(
      `DOC: ${cliente?.documento || cliente?.numeroDocumento || "N/A"}`,
      120,
      57,
    );
    doc.text(`TEL: ${cliente?.telefono || "N/A"}`, 120, 62);

    // Tabla Header
    doc.setFillColor(255, 105, 180);
    doc.rect(20, 70, 170, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("PRODUCTO", 22, 75.5);
    doc.text("CANT.", 100, 75.5);
    doc.text("PRECIO", 130, 75.5);
    doc.text("SUBTOTAL", 160, 75.5);

    // Tabla Body
    doc.setTextColor(0);
    let listY = 85;

    const safeCurrency = (val: any) => {
      if (typeof val !== "number" || isNaN(val)) return formatCurrency(0);
      return formatCurrency(val);
    };

    (venta.productos || []).forEach((p: any) => {
      const prod = productosDestino.find(
        (pr: Producto) => pr.id === p.productoId,
      );
      const prodName = doc.splitTextToSize(
        prod?.nombre || "Producto Desconocido",
        70,
      );

      doc.text(prodName, 22, listY);
      doc.text(String(p.cantidad || 0), 100, listY);
      doc.text(safeCurrency(p.precioUnitario), 130, listY);
      doc.text(
        safeCurrency((p.cantidad || 0) * (p.precioUnitario || 0)),
        160,
        listY,
      );

      listY += prodName.length * 5 + 3;
    });

    // Totales
    const finalY = listY + 10;
    doc.text(`SUBTOTAL: ${safeCurrency(venta.subtotal)}`, 140, finalY);
    doc.text(`IVA (19%): ${safeCurrency(venta.iva)}`, 140, finalY + 7);
    doc.setFontSize(14);
    doc.setTextColor(255, 105, 180);
    doc.text(`TOTAL: ${safeCurrency(venta.total)}`, 140, finalY + 15);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("¡Gracias por su compra!", 105, 280, { align: "center" });

    doc.save(`factura_${venta.id}.pdf`);
    toast.success("El PDF ha sido generado y la descarga ha iniciado");
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
