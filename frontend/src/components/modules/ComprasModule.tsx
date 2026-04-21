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
      cantidad: number;
      precioUnitario: number;
    }[],
  });

  const [selectedProductId, setSelectedProductId] = useState("");

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
    setFormData({
      proveedorId: proveedores[0]?.id || "",
      observaciones: "",
      detalles: [],
    });
    setIsDialogOpen(true);
  };


  const removeProductFromDetalles = (index: number) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (!formData.proveedorId || formData.detalles.length === 0) {
      toast.error("Seleccione un proveedor y al menos un producto");
      return;
    }

    setIsSaving(true);
    try {
      await purchaseService.create({
        id_proveedor: Number(formData.proveedorId),
        observaciones: formData.observaciones,
        detalles: formData.detalles.map((d) => ({
          id_producto: Number(d.productoId),
          cantidad: d.cantidad,
          precio_unitario: d.precioUnitario,
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
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        removeProductFromDetalles={removeProductFromDetalles}
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
