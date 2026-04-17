import { useState, useEffect } from "react";
import { useStore } from "../../lib/store";
import { toast } from "sonner";
import { generateSalePDF } from "../../lib/pdfGenerator";
import { saleService } from "../../services/saleService";
import { CONFIG } from "../../lib/constants";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../Pagination";

// Sub-componentes
import { VentaHeader } from "./ventas/VentaHeader";
import { VentaTable } from "./ventas/VentaTable";
import { VentaFormDialog } from "./ventas/VentaFormDialog";
import { VentaDetailDialog } from "./ventas/VentaDetailDialog";
import { VentaAnnulDialog } from "./ventas/VentaAnnulDialog";

// Utils
import { calculateSaleTotals } from "../../utils/ventaUtils";

export function VentasModule() {
  const { ventas, clientes, productos, setVentas } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnnulDialogOpen, setIsAnnulDialogOpen] = useState(false);
  const [saleToAnnul, setSaleToAnnul] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleLimitChange,
  } = usePagination({ totalItems });

  const [formData, setFormData] = useState({
    clienteId: "",
    pedidoId: "",
    metodoPago: "Efectivo",
    productos: [
      { productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 },
    ],
  });

  const refreshVentas = async () => {
    try {
      const response = await saleService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery,
      });

      const salesItems = response.items || [];
      setTotalItems(response.total || 0);

      const mapped = salesItems.map((v: any) => ({
        id: v.id_venta.toString(),
        clienteId: v.id_usuario_cliente?.toString() || "",
        clienteNombre: `${v.nombre_cliente || ""} ${v.apellido_cliente || ""}`.trim() || "Sin Nombre",
        pedidoId: v.id_pedido?.toString() || "",
        fecha: new Date(v.fecha_venta).toLocaleDateString(),
        productos: (v.productos || []).map((p: any) => ({
          productoId: p.id_producto.toString(),
          cantidad: p.cantidad,
          precioUnitario: Number(p.precio_unitario),
        })),
        subtotal: Number(v.subtotal),
        iva: Number(v.iva),
        costoEnvio: 0,
        total: Number(v.total),
        estado: v.estado ? "activo" : "anulada",
        metodoPago: v.metodo_pago || "Efectivo",
      }));

      setVentas(mapped);
    } catch (e) {
      console.error("Error fetching ventas:", e);
      toast.error("Error al cargar ventas");
    }
  };

  useEffect(() => {
    refreshVentas();
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleOpenDialog = () => {
    setFormData({
      clienteId: "",
      pedidoId: "",
      metodoPago: "Efectivo",
      productos: [{ productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 }],
    });
    setIsDialogOpen(true);
  };

  const addProductLine = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 }],
    });
  };

  const removeProductLine = (index: number) => {
    const newProductos = formData.productos.filter((_, i) => i !== index);
    setFormData({ ...formData, productos: newProductos });
  };

  const updateProductLine = (index: number, field: string, value: any, prodObj?: any) => {
    const newProductos = [...formData.productos];

    if (field === "productoId") {
      const existingIndex = newProductos.findIndex((p, i) => i !== index && p.productoId === value);
      if (existingIndex !== -1 && value) {
        const ms = newProductos[existingIndex].maxStock || prodObj?.stock || 0;
        const nuevaCantidad = newProductos[existingIndex].cantidad + (newProductos[index].cantidad || 1);
        const cantidadFinal = ms > 0 ? Math.min(nuevaCantidad, ms) : nuevaCantidad;
        
        if (ms > 0 && nuevaCantidad > ms) {
          toast.warning(`Stock limitado. Máximo disponible: ${ms}`);
        } else {
          toast.info("Producto ya agregado. Cantidad actualizada.");
        }
        
        newProductos[existingIndex] = { ...newProductos[existingIndex], cantidad: cantidadFinal };
        const filtered = newProductos.filter((_, i) => i !== index);
        setFormData({ ...formData, productos: filtered });
        return;
      }

      newProductos[index] = {
        ...newProductos[index],
        productoId: value,
        precioUnitario: prodObj?.precioVenta || 0,
        maxStock: prodObj?.stock || 0,
        cantidad: Math.min(newProductos[index].cantidad || 1, prodObj?.stock || 999) || 1,
      };
    } else if (field === "cantidad") {
      const ms = newProductos[index].maxStock || 0;
      const parsed = parseInt(value) || 1;
      if (parsed <= 0) {
        toast.warning("La cantidad debe ser mayor a 0");
        newProductos[index] = { ...newProductos[index], cantidad: 1 };
      } else if (ms > 0 && parsed > ms) {
        toast.warning(`Stock insuficiente. Máximo disponible: ${ms}`);
        newProductos[index] = { ...newProductos[index], cantidad: ms };
      } else {
        newProductos[index] = { ...newProductos[index], cantidad: parsed };
      }
    } else {
      newProductos[index] = { ...newProductos[index], [field]: value };
    }

    setFormData({ ...formData, productos: newProductos });
  };

  const handleSave = async () => {
    if (!formData.clienteId) { toast.error("Seleccione un cliente"); return; }
    if (formData.productos.some(p => !p.productoId)) { toast.error("Productos inválidos"); return; }
    if (formData.productos.some(p => p.cantidad <= 0)) { toast.error("Cantidades inválidas"); return; }

    setIsSaving(true);
    try {
      const { subtotal, iva, total } = calculateSaleTotals(formData.productos, CONFIG.IVA);
      const payload = {
        id_usuario_cliente: Number(formData.clienteId),
        id_pedido: formData.pedidoId ? Number(formData.pedidoId) : null,
        metodo_pago: formData.metodoPago,
        productos: formData.productos,
        subtotal, iva, total,
      };

      await saleService.create(payload);
      toast.success("Venta registrada con éxito");
      await refreshVentas();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar la venta");
    } finally {
      setIsSaving(true); setIsSaving(false);
    }
  };

  const handleAnularVenta = async () => {
    if (!saleToAnnul) return;
    setIsSaving(true);
    try {
      await saleService.annul(Number(saleToAnnul));
      toast.success("Venta anulada");
      await refreshVentas();
      setIsAnnulDialogOpen(false);
      setSaleToAnnul(null);
    } catch (error: any) {
      toast.error("Error al anular");
    } finally {
       setIsSaving(false);
    }
  };

  const handleDownloadPDF = (venta: any) => {
    const cliente = clientes.find((c) => c.id === venta.clienteId);
    generateSalePDF(venta, cliente, productos);
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <VentaHeader onOpenDialog={handleOpenDialog} />

      <div className="px-8 pb-8">
        <VentaTable
          ventas={ventas}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); handlePageChange(1); }}
          onDownloadPDF={handleDownloadPDF}
          onViewDetail={(v) => { setSelectedVenta(v); setDetailDialogOpen(true); }}
          onAnnulClick={(id) => { setSaleToAnnul(id); setIsAnnulDialogOpen(true); }}
        />

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        )}
      </div>

      <VentaFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        onSave={handleSave}
        onAddProduct={addProductLine}
        onRemoveProduct={removeProductLine}
        onUpdateProduct={updateProductLine}
      />

      <VentaDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        selectedVenta={selectedVenta}
        clientes={clientes}
        productos={productos}
      />

      <VentaAnnulDialog
        open={isAnnulDialogOpen}
        onOpenChange={setIsAnnulDialogOpen}
        isSaving={isSaving}
        onConfirm={handleAnularVenta}
      />
    </div>
  );
}
