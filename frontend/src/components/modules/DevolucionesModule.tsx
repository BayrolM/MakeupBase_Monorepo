import { useState, useEffect, useMemo } from "react";
import { useStore } from "../../lib/store";
import { Pagination } from "../Pagination";
import { toast } from "sonner";
import { usePagination } from "../../hooks/usePagination";
import { devolucionService } from "../../services/devolucionService";
import { generateDevolucionPDF } from "../../lib/pdfGenerator";


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
    setDevoluciones,
  } = useStore();

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [anularDialogOpen, setAnularDialogOpen] = useState(false);

  // Data & Selection States
  const [selectedDevolucion, setSelectedDevolucion] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [motivoDecision, setMotivoDecision] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("en_revision");
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [ventaData, setVentaData] = useState<any>(null);
  const [productosDevolver, setProductosDevolver] = useState<any[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    ventaId: "",
    fechaDevolucion: new Date().toISOString().split("T")[0],
    motivo: "",
    estado: "aprobada" as "aprobada" | "pendiente" | "rechazada",
  });

  // Pagination
  const filteredDevoluciones = useMemo(() => {
    let result = devoluciones;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(dev => {
        const cliente = clientes.find(c => c.id === dev.clienteId);
        return (
          dev.id.toLowerCase().includes(q) ||
          (dev as any).ventaId?.toString().includes(q) ||
          (cliente?.nombre || "").toLowerCase().includes(q) ||
          dev.estado.toLowerCase().includes(q) ||
          dev.motivo?.toLowerCase().includes(q) ||
          dev.fecha.includes(q)
        );
      });
    }
    return result;
  }, [devoluciones, searchQuery, clientes]);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleLimitChange,
  } = usePagination({ totalItems: filteredDevoluciones.length });

  const paginatedDevoluciones = useMemo(() => {
    return filteredDevoluciones.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredDevoluciones, currentPage, itemsPerPage]);

  // ── Load data from backend ──
  const refreshData = async () => {
    try {
      const data = await devolucionService.getAll();
      const devolucionesArray = Array.isArray(data) ? data : data.data || [];

      const mapped = devolucionesArray.map((dev: any) => ({
        id: dev.id_devolucion.toString(),
        ventaId: dev.id_venta?.toString() || "",
        clienteId: dev.id_usuario_cliente?.toString() || "",
        clienteNombre: `${dev.nombre_cliente || ""} ${dev.apellido_cliente || ""}`.trim(),
        empleadoNombre: `${dev.nombre_empleado || ""} ${dev.apellido_empleado || ""}`.trim(),
        fecha: new Date(dev.fecha_devolucion).toLocaleDateString(),
        motivo: dev.motivo,
        estado: dev.estado,
        totalDevuelto: Number(dev.total_devuelto),
        motivoDecision: dev.motivo_decision || "",
        motivoAnulacion: dev.motivo_anulacion || "",
        fechaAnulacion: dev.fecha_anulacion ? new Date(dev.fecha_anulacion).toLocaleDateString() : "",
        evidencias: [],
        productos: (dev.detalles || []).map((det: any) => ({
          productoId: det.id_producto?.toString() || "",
          productoNombre: det.nombre_producto || "",
          cantidad: det.cantidad,
          precioUnitario: Number(det.precio_unitario || 0),
          subtotal: Number(det.subtotal || 0),
        })),
      }));

      setDevoluciones(mapped);
    } catch (error) {
      console.error("Error al cargar devoluciones:", error);
      toast.error("Error al cargar devoluciones");
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // ── Handlers ──
  const handleOpenCreateDialog = () => {
    setFormData({
      ventaId: "",
      fechaDevolucion: new Date().toISOString().split("T")[0],
      motivo: "",
      estado: "aprobada",
    });
    setSuccessMessage("");
    setErrorMessage("");
    setVentaData(null);
    setProductosDevolver([]);
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const handleVentaIdChange = async (id: string) => {
    setFormData(prev => ({ ...prev, ventaId: id }));
    setErrorMessage("");
    setProductosDevolver([]);

    if (id.trim() === "") {
      setVentaData(null);
      return;
    }

    // Search in loaded ventas first
    const venta = ventas?.find(
      (v: any) => v.id === id || v.id === id.trim(),
    );

    if (venta) {
      setVentaData(venta);
      setErrorMessage("");
      const productosDisponibles = (venta.productos || []).map((p: any) => ({
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
      if (id.length >= 1) setErrorMessage("La venta no existe, verifica el ID ingresado");
    }
  };

  const handleToggleProducto = (index: number) => {
    const newProductos = [...productosDevolver];
    newProductos[index].selected = !newProductos[index].selected;
    if (!newProductos[index].selected) {
      newProductos[index].cantidadADevolver = 0;
    }
    setProductosDevolver(newProductos);
    setErrorMessage("");
    setFieldErrors(prev => ({ ...prev, productos: "" }));
  };

  const handleCantidadChange = (index: number, cantidad: number) => {
    const newProductos = [...productosDevolver];
    if (cantidad >= 0 && cantidad <= newProductos[index].cantidadComprada) {
      newProductos[index].cantidadADevolver = cantidad;
      setProductosDevolver(newProductos);
      setErrorMessage("");
      setFieldErrors(prev => {
        const nf = { ...prev, productos: "" };
        delete nf[`cantidad_${index}`];
        return nf;
      });
    }
  };

  const totalDevolucionEstimado = useMemo(() => {
    return productosDevolver
      .filter((p) => p.selected && p.cantidadADevolver > 0)
      .reduce((sum, p) => sum + p.precioUnitario * p.cantidadADevolver, 0);
  }, [productosDevolver]);

  const handleSaveDevolucion = async () => {
    const errors: Record<string, string> = {};

    if (!formData.ventaId.trim()) errors.ventaId = "El ID de la venta es obligatorio.";
    else if (!ventaData) errors.ventaId = "Debes cargar una venta válida.";

    if (!formData.motivo.trim()) errors.motivo = "El motivo de la devolución es obligatorio.";
    else if (formData.motivo.trim().length < 5) errors.motivo = "Mínimo 5 caracteres.";
    else if (formData.motivo.trim().length > 100) errors.motivo = "Máximo 100 caracteres.";

    const productosSeleccionados = productosDevolver.filter(p => p.selected);
    if (productosSeleccionados.length === 0) {
      errors.productos = "Selecciona al menos un producto.";
    } else {
      let tieneCantidadValida = false;
      productosDevolver.forEach((p, index) => {
        if (p.selected) {
          if (!p.cantidadADevolver || p.cantidadADevolver <= 0) {
            errors[`cantidad_${index}`] = "Cantidad inválida.";
          } else {
            tieneCantidadValida = true;
          }
        }
      });
      if (!tieneCantidadValida && !Object.keys(errors).some(k => k.startsWith('cantidad_'))) {
        errors.productos = "Ingresa una cantidad válida.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Hay campos incompletos o inválidos marcados en rojo.");
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    setErrorMessage("");
    try {
      await devolucionService.create({
        id_venta: Number(formData.ventaId),
        id_usuario_cliente: Number(ventaData.clienteId),
        motivo: formData.motivo.trim(),
        estado: formData.estado,
        fecha_devolucion: formData.fechaDevolucion,
        productos: productosSeleccionados.map((p) => ({
          id_producto: Number(p.productoId),
          cantidad: p.cantidadADevolver,
          precio_unitario: p.precioUnitario,
        })),
      });

      setSuccessMessage("Devolución registrada correctamente");
      toast.success("Devolución registrada con éxito");
      await refreshData();
      setTimeout(() => {
        setIsDialogOpen(false);
        setSuccessMessage("");
      }, 1200);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Error al registrar la devolución";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeStatus = async (newEstado: string) => {
    if (!selectedDevolucion) return;
    if (!motivoDecision.trim() || motivoDecision.trim().length < 3) {
      toast.error("Debe ingresar un motivo para el cambio de estado (mínimo 3 caracteres)");
      return;
    }

    setIsSaving(true);
    try {
      await devolucionService.cambiarEstado(
        Number(selectedDevolucion.id),
        newEstado,
        motivoDecision.trim(),
      );
      toast.success("Estado actualizado correctamente");
      await refreshData();
      setStatusDialogOpen(false);
      setMotivoDecision("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cambiar estado");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmAnulacion = async () => {
    if (!selectedDevolucion || motivoAnulacion.trim().length < 5) {
      toast.error("Ingrese un motivo de anulación válido (mínimo 5 caracteres)");
      return;
    }

    setIsSaving(true);
    try {
      await devolucionService.anular(
        Number(selectedDevolucion.id),
        motivoAnulacion.trim(),
      );
      toast.success("Devolución anulada correctamente");
      await refreshData();
      setAnularDialogOpen(false);
      setMotivoAnulacion("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al anular la devolución");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewPdf = (dev: any) => {
    const cliente = clientes.find(c => c.id === dev.clienteId);
    generateDevolucionPDF(dev, cliente, productos);
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <DevolucionHeader onOpenDialog={handleOpenCreateDialog} />

      <div className="px-8 pb-8">
        <DevolucionTable
          devoluciones={paginatedDevoluciones}
          clientes={clientes}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); handlePageChange(1); }}
          onViewDetail={async (dev) => {
            try {
              const fullData = await devolucionService.getById(Number(dev.id));
              setSelectedDevolucion({
                ...dev,
                productos: (fullData.detalles || []).map((det: any) => ({
                  productoId: det.id_producto?.toString() || "",
                  productoNombre: det.nombre_producto || "",
                  cantidad: det.cantidad,
                  precioUnitario: Number(det.precio_unitario || 0),
                  subtotal: Number(det.subtotal || 0),
                })),
                emailCliente: fullData.email_cliente || "",
                telefonoCliente: fullData.telefono_cliente || "",
              });
              setDetailDialogOpen(true);
            } catch {
              setSelectedDevolucion(dev);
              setDetailDialogOpen(true);
            }
          }}
          onViewPdf={handleViewPdf}
          onAnular={(dev) => { setSelectedDevolucion(dev); setMotivoAnulacion(""); setAnularDialogOpen(true); }}
          onChangeEstado={(dev) => { setSelectedDevolucion(dev); setMotivoDecision(""); setNuevoEstado("en_revision"); setStatusDialogOpen(true); }}
          filteredCount={filteredDevoluciones.length}
        />

        {filteredDevoluciones.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredDevoluciones.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
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
        productos={productos}
        successMessage={successMessage}
        errorMessage={errorMessage}
        isSaving={isSaving}
        onVentaIdChange={handleVentaIdChange}
        onFieldChange={(name, val) => {
          setFormData(p => ({ ...p, [name]: val }));
          setErrorMessage("");
        }}
        onToggleProducto={handleToggleProducto}
        onCantidadChange={handleCantidadChange}
        onSave={handleSaveDevolucion}
        totalDevolucion={totalDevolucionEstimado}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
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
        nuevoEstado={nuevoEstado}
        isSaving={isSaving}
        onMotivoChange={setMotivoDecision}
        onEstadoChange={setNuevoEstado}
        onConfirm={handleChangeStatus}
      />

      <DevolucionAnularDialog
        open={anularDialogOpen}
        onOpenChange={setAnularDialogOpen}
        devolucion={selectedDevolucion}
        motivoAnulacion={motivoAnulacion}
        isSaving={isSaving}
        onMotivoChange={setMotivoAnulacion}
        onConfirm={handleConfirmAnulacion}
      />
    </div>
  );
}
