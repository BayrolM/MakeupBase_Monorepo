import { useState, useEffect, useMemo } from "react";
import { useStore, Compra } from "../../lib/store";
import { toast } from "sonner";
import { purchaseService } from "../../services/purchaseService";
import { productService } from "../../services/productService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../Pagination";

// Sub-componentes
import { CompraHeader } from "./compras/CompraHeader";
import { CompraTable } from "./compras/CompraTable";
import { CompraFormDialog } from "./compras/CompraFormDialog";
import { CompraDetailDialog } from "./compras/CompraDetailDialog";
import { CompraAnularDialog } from "./compras/CompraAnularDialog";
import { generateCompraPDF } from "../../lib/pdfGenerator";

export function ComprasModule() {
  const { compras, proveedores, productos, setCompras, setProductos, currentUser, userType } = useStore();
  const isAdmin = currentUser?.rol === "admin" || userType === "admin";
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAnularDialogOpen, setIsAnularDialogOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [compraToAnular, setCompraToAnular] = useState<Compra | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredCompras = useMemo(() => {
    return compras.filter((c) => {
      const provee = proveedores.find((p) => p.id === c.proveedorId);
      return (
        c.id.includes(searchQuery) ||
        provee?.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [compras, searchQuery, proveedores]);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleLimitChange,
  } = usePagination({ totalItems: filteredCompras.length });

  const paginatedCompras = useMemo(() => {
    return filteredCompras.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredCompras, currentPage, itemsPerPage]);

  const [formData, setFormData] = useState({
    proveedorId: "",
    observaciones: "",
    detalles: [] as {
      productoId: string;
      cantidad: number | "";
      precioUnitario: number | "";
    }[],
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});



  const refreshData = async () => {
    try {
      const purchasesResp = await purchaseService.getAll();
      const purchasesArray = Array.isArray(purchasesResp) ? purchasesResp : purchasesResp.data || [];
      const mappedPurchases = purchasesArray.map((purch: any) => ({
        id: purch.id_compra.toString(),
        proveedorId: purch.id_proveedor.toString(),
        fecha: purch.fecha_compra,
        total: Number(purch.total),
        estado: (purch.estado ? "confirmada" : "anulada") as
          | "confirmada"
          | "anulada",
        confirmada: purch.estado,
        observaciones: purch.observaciones || "",
        productos: [],
      }));
      setCompras(mappedPurchases);

      const productsResp = await productService.getAll({ limit: 100 });
      const mappedProducts = (productsResp.data || []).map((prod: any) => ({
        id: prod.id_producto.toString(),
        nombre: prod.nombre,
        descripcion: prod.descripcion || "",
        categoriaId: prod.id_categoria.toString(),
        marca: (prod as any).nombre_marca || "Genérica",
        precioCompra: Number(prod.costo_promedio) || 0,
        precioVenta: Number(prod.precio_venta) || 0,
        stock: prod.stock_actual || 0,
        stockMinimo: prod.stock_min || 0,
        stockMaximo: prod.stock_max || 100,
        imagenUrl: prod.imagen_url || "",
        estado: prod.estado ? ("activo" as const) : ("inactivo" as const),
        fechaCreacion: new Date().toISOString(),
      }));
      setProductos(mappedProducts);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar datos");
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenDialog = () => {
    setFieldErrors({});
    setFormData({
      proveedorId: proveedores[0]?.id || "",
      observaciones: "",
      detalles: [],
    });
    setIsDialogOpen(true);
  };




  const handleSave = async () => {
    const errors: Record<string, string> = {};

    if (!formData.proveedorId) errors.proveedorId = "Debe seleccionar un proveedor.";
    if (formData.detalles.length === 0) errors.detalles = "Debe agregar al menos un producto.";

    formData.detalles.forEach((d, i) => {
      if (!d.productoId) errors[`producto_${i}`] = "Seleccione un producto.";
      if (!d.cantidad || Number(d.cantidad) <= 0) errors[`cantidad_${i}`] = "Dato inválido.";
      if (d.precioUnitario === "" || Number(d.precioUnitario) < 0) errors[`precio_${i}`] = "Precio inválido.";
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Hay campos incompletos o inválidos.");
      return;
    }

    setFieldErrors({});

    setIsSaving(true);
    try {
      await purchaseService.create({
        id_proveedor: Number(formData.proveedorId),
        observaciones: formData.observaciones,
        detalles: formData.detalles.map((d) => ({
          id_producto: Number(d.productoId),
          cantidad: Number(d.cantidad) || 0,
          precio_unitario: Number(d.precioUnitario) || 0,
        })),
      });
      toast.success("Compra registrada con éxito");
      await refreshData();
      setIsDialogOpen(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Error al registrar la compra";
      console.error("Error guardando compra:", error.response?.data || error);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmAnular = async () => {
    if (!compraToAnular) return;
    setIsSaving(true);
    try {
      await purchaseService.anular(Number(compraToAnular.id));
      toast.success("La compra ha sido anulada");
      await refreshData();
      setIsAnularDialogOpen(false);
      setCompraToAnular(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || "Error al anular compra");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewPdf = async (c: Compra) => {
    try {
      const fullPurchase = await purchaseService.getById(Number(c.id));
      const proveedor = proveedores.find(p => p.id === c.proveedorId);
      generateCompraPDF({ ...c, detalles: fullPurchase.detalles || [] }, proveedor, productos);
    } catch (error) {
      toast.error("Error al generar PDF de la compra");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <CompraHeader onOpenDialog={handleOpenDialog} />

      <div className="px-8 pb-8">
        <CompraTable
          compras={paginatedCompras}
          proveedores={proveedores}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isAdmin={isAdmin}
          onViewPdf={handleViewPdf}
          onViewDetail={async (c) => {
            try {
              const fullPurchase = await purchaseService.getById(Number(c.id));
              setSelectedCompra({ ...c, detalles: fullPurchase.detalles || [] });
              setIsDetailDialogOpen(true);
            } catch (error) {
              toast.error("Error al cargar detalles de la compra");
            }
          }}
          onAnular={(c) => {
            setCompraToAnular(c);
            setIsAnularDialogOpen(true);
          }}
        />

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCompras.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        )}
      </div>

      <CompraFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        setFormData={setFormData}
        proveedores={proveedores}
        productos={productos}
        isSaving={isSaving}
        onSave={handleSave}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
      />

      <CompraDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        selectedCompra={selectedCompra}
        proveedores={proveedores}
        productos={productos}
      />

      <CompraAnularDialog
        open={isAnularDialogOpen}
        onOpenChange={setIsAnularDialogOpen}
        compra={compraToAnular}
        isSaving={isSaving}
        onConfirm={handleConfirmAnular}
      />
    </div>
  );
}
