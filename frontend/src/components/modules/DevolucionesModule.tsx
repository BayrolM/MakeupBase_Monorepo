import { useState, useMemo } from "react";
import { useStore } from "../../lib/store";
import { Pagination } from "../Pagination";
import { toast } from "sonner";

// Utilities
import { canChangeEstado } from "../../../src/utils/devolucionUtils";

// Sub-componentes
import { DevolucionHeader } from "./devoluciones/DevolucionHeader";
import { DevolucionTable } from "./devoluciones/DevolucionTable";
import { DevolucionFormDialog } from "./devoluciones/DevolucionFormDialog";
import { DevolucionDetailDialog } from "./devoluciones/DevolucionDetailDialog";
import { DevolucionStatusDialog } from "./devoluciones/DevolucionStatusDialog";
import { DevolucionAnularDialog } from "./devoluciones/DevolucionAnularDialog";

export function DevolucionesModule() {
  const {
    devoluciones,
    ventas,
    clientes,
    productos,
    addDevolucion,
    updateDevolucion,
    updateStock,
  } = useStore();

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [anularDialogOpen, setAnularDialogOpen] = useState(false);

  // Data & Selection States
  const [selectedDevolucion, setSelectedDevolucion] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [motivoDecision, setMotivoDecision] = useState("");
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [ventaData, setVentaData] = useState<any>(null);
  const [productosDevolver, setProductosDevolver] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ventaId: "",
    fechaDevolucion: new Date().toISOString().split("T")[0],
    motivo: "",
    estado: "Procesada" as "Procesada" | "Pendiente" | "Rechazada",
  });

  // Handlers
  const handleOpenCreateDialog = () => {
    setFormData({
      ventaId: "",
      fechaDevolucion: new Date().toISOString().split("T")[0],
      motivo: "",
      estado: "Procesada",
    });
    setSuccessMessage("");
    setErrorMessage("");
    setVentaData(null);
    setProductosDevolver([]);
    setIsDialogOpen(true);
  };

  const handleVentaIdChange = (id: string) => {
    setFormData(prev => ({ ...prev, ventaId: id }));
    setErrorMessage("");
    setProductosDevolver([]);

    if (id.trim() === "") {
      setVentaData(null);
      return;
    }

    const venta = ventas?.find(
      (v: any) => v.id === id || v.id.toLowerCase().includes(id.toLowerCase()),
    );

    if (venta) {
      setVentaData(venta);
      setErrorMessage("");
      const productosDisponibles = venta.productos.map((p: any) => ({
        productoId: p.productoId,
        cantidadComprada: p.cantidad,
        cantidadADevolver: 0,
        precioUnitario: p.precioUnitario,
        selected: false,
      }));
      setProductosDevolver(productosDisponibles);
    } else {
      setVentaData(null);
      setProductosDevolver([]);
      if (id.length >= 4) setErrorMessage("La compra no existe, verifica el ID ingresado");
    }
  };

  const handleToggleProducto = (index: number) => {
    const newProductos = [...productosDevolver];
    newProductos[index].selected = !newProductos[index].selected;
    if (!newProductos[index].selected) {
      newProductos[index].cantidadADevolver = 0;
    }
    setProductosDevolver(newProductos);
  };

  const handleCantidadChange = (index: number, cantidad: number) => {
    const newProductos = [...productosDevolver];
    if (cantidad >= 0 && cantidad <= newProductos[index].cantidadComprada) {
      newProductos[index].cantidadADevolver = cantidad;
      setProductosDevolver(newProductos);
    }
  };

  const totalDevolucionEstimado = useMemo(() => {
    return productosDevolver
      .filter((p) => p.selected && p.cantidadADevolver > 0)
      .reduce((sum, p) => sum + p.precioUnitario * p.cantidadADevolver, 0);
  }, [productosDevolver]);

  const handleSaveDevolucion = () => {
    if (!formData.ventaId.trim()) return setErrorMessage("Debe ingresar el ID de la compra");
    if (!ventaData) return setErrorMessage("La compra no existe");
    
    const productosSeleccionados = productosDevolver.filter(p => p.selected && p.cantidadADevolver > 0);
    if (productosSeleccionados.length === 0) return setErrorMessage("Seleccione al menos un producto");
    if (formData.motivo.trim().length < 5) return setErrorMessage("Ingrese un motivo válido (mínimo 5 caracteres)");

    // Evitar duplicados
    const yaRegistrada = devoluciones.some(d => 
      d.ventaId === formData.ventaId && 
      d.productos.some((dp: any) => productosSeleccionados.some(ps => ps.productoId === dp.productoId))
    );
    if (yaRegistrada) return setErrorMessage("Alguno de estos productos ya tiene una devolución registrada");

    addDevolucion({
      ventaId: formData.ventaId,
      clienteId: ventaData.clienteId || "",
      fecha: formData.fechaDevolucion,
      motivo: formData.motivo,
      productos: productosSeleccionados.map((p) => ({
        productoId: p.productoId,
        cantidad: p.cantidadADevolver,
      })),
      estado: formData.estado === "Procesada" ? "aprobada" : formData.estado === "Rechazada" ? "rechazada" : "pendiente",
      evidencias: [],
      totalDevuelto: totalDevolucionEstimado,
    });

    if (formData.estado === "Procesada") {
      productosSeleccionados.forEach(p => updateStock(p.productoId, p.cantidadADevolver));
    }

    setSuccessMessage("Devolución registrada correctamente");
    setTimeout(() => {
      setIsDialogOpen(false);
      setSuccessMessage("");
    }, 1500);
  };

  const handleChangeStatus = (newEstado: string) => {
    if (!selectedDevolucion || !motivoDecision.trim()) {
      toast.error("Debe ingresar un motivo para el cambio de estado");
      return;
    }

    if (newEstado === "aprobada") {
      selectedDevolucion.productos.forEach((p: any) => updateStock(p.productoId, p.cantidad));
    }

    updateDevolucion(selectedDevolucion.id, {
      estado: newEstado as any,
      motivoDecision: motivoDecision,
    });
    setStatusDialogOpen(false);
    setMotivoDecision("");
    toast.success("Estado actualizado correctamente");
  };

  const handleConfirmAnulacion = () => {
    if (!selectedDevolucion || motivoAnulacion.trim().length < 5) {
      toast.error("Ingrese un motivo de anulación válido");
      return;
    }

    updateDevolucion(selectedDevolucion.id, {
      estado: "anulada",
      motivoAnulacion: motivoAnulacion,
      fechaAnulacion: new Date().toISOString().split("T")[0],
    });

    setAnularDialogOpen(false);
    setMotivoAnulacion("");
    toast.success("Devolución anulada");
  };

  // Filter & Pagination
  const filteredDevoluciones = useMemo(() => {
    if (!searchQuery) return devoluciones;
    const q = searchQuery.toLowerCase();
    return devoluciones.filter(dev => {
      const cliente = clientes.find(c => c.id === dev.clienteId);
      return (
        dev.id.toLowerCase().includes(q) ||
        (cliente?.nombre || "").toLowerCase().includes(q) ||
        dev.estado.toLowerCase().includes(q) ||
        dev.fecha.includes(q)
      );
    });
  }, [devoluciones, searchQuery, clientes]);

  const totalPages = Math.ceil(filteredDevoluciones.length / itemsPerPage);
  const paginatedDevoluciones = filteredDevoluciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <DevolucionHeader onOpenDialog={handleOpenCreateDialog} />

      <div className="p-8">
        <DevolucionTable
          devoluciones={paginatedDevoluciones}
          clientes={clientes}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          onViewDetail={(dev) => { setSelectedDevolucion(dev); setDetailDialogOpen(true); }}
          onViewPdf={(dev) => { toast.info("Generando comprobante...", { description: `PDF para ${dev.id.slice(0,8)}` }); }}
          onAnular={(dev) => { setSelectedDevolucion(dev); setMotivoAnulacion(""); setAnularDialogOpen(true); }}
          onChangeEstado={(dev) => { setSelectedDevolucion(dev); setMotivoDecision(""); setStatusDialogOpen(true); }}
          filteredCount={filteredDevoluciones.length}
        />

        {filteredDevoluciones.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredDevoluciones.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          </div>
        )}
      </div>

      <DevolucionFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        ventaData={ventaData}
        productosDevolver={productosDevolver}
        clientes={clientes}
        productos={productos}
        successMessage={successMessage}
        errorMessage={errorMessage}
        isSaving={false}
        onVentaIdChange={handleVentaIdChange}
        onFieldChange={(name, val) => setFormData(p => ({ ...p, [name]: val }))}
        onToggleProducto={handleToggleProducto}
        onCantidadChange={handleCantidadChange}
        onSave={handleSaveDevolucion}
        totalDevolucion={totalDevolucionEstimado}
      />

      <DevolucionDetailDialog 
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        devolucion={selectedDevolucion}
        clientes={clientes}
        productos={productos}
      />

      <DevolucionStatusDialog 
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        devolucion={selectedDevolucion}
        motivoDecision={motivoDecision}
        onMotivoChange={setMotivoDecision}
        onConfirm={handleChangeStatus}
      />

      <DevolucionAnularDialog 
        open={anularDialogOpen}
        onOpenChange={setAnularDialogOpen}
        devolucion={selectedDevolucion}
        motivoAnulacion={motivoAnulacion}
        onMotivoChange={setMotivoAnulacion}
        onConfirm={handleConfirmAnulacion}
      />
    </div>
  );
}
