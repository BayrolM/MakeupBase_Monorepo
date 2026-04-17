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

export function ComprasModule() {
  const { compras, proveedores, productos, setCompras, setProductos } =
    useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
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
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempPrice, setTempPrice] = useState(0);

  const refreshData = async () => {
    try {
      const purchasesResp = await purchaseService.getAll();
      const mappedPurchases = (purchasesResp.data || []).map((purch: any) => ({
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

  const addProductToDetalles = () => {
    if (!selectedProductId) {
      toast.warning("Selecciona un producto");
      return;
    }
    const prod = productos.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (tempQuantity <= 0) {
      toast.warning("La cantidad debe ser mayor a 0");
      return;
    }

    setFormData({
      ...formData,
      detalles: [
        ...formData.detalles,
        {
          productoId: selectedProductId,
          cantidad: tempQuantity,
          precioUnitario: tempPrice || prod.precioCompra,
        },
      ],
    });
    setSelectedProductId("");
    setTempQuantity(1);
    setTempPrice(0);
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
          precio_compra: d.precioUnitario,
        })),
      });
      toast.success("Compra registrada con éxito");
      await refreshData();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error al registrar la compra");
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
          onViewDetail={(c) => {
            setSelectedCompra(c);
            setIsDetailDialogOpen(true);
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
        tempQuantity={tempQuantity}
        setTempQuantity={setTempQuantity}
        tempPrice={tempPrice}
        setTempPrice={setTempPrice}
        addProductToDetalles={addProductToDetalles}
        removeProductFromDetalles={removeProductFromDetalles}
      />

      <CompraDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        selectedCompra={selectedCompra}
        proveedores={proveedores}
        productos={productos}
      />
    </div>
  );
}
