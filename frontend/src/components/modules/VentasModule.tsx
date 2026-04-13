import { useState, useEffect } from "react";
import { useStore } from "../../lib/store";
import { AsyncClientSelect } from "../AsyncClientSelect";
import { AsyncProductSelect } from "../AsyncProductSelect";

import { Pagination } from "../Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Plus,
  Search,
  Trash2,
  X,
  User,
  CreditCard,
  Package,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  ShoppingBag,
  Eye,
  Hash,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { GenericCombobox } from "../GenericCombobox";
import { toast } from "sonner";
import { generateSalePDF } from "../../lib/pdfGenerator";
import { saleService } from "../../services/saleService";
import { Cliente } from "../../lib/store";
import { CONFIG } from "../../lib/constants";

export function VentasModule() {
  const { ventas, clientes, productos, setVentas } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAnnulDialogOpen, setIsAnnulDialogOpen] = useState(false);
  const [saleToAnnul, setSaleToAnnul] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Debounce logic for live search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    refreshVentas();
  }, []);

  const refreshVentas = async () => {
    try {
      const response = await saleService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: debouncedSearchQuery,
      });

      const salesItems = response.items || [];
      setTotalItems(response.total || 0);

      const mapped = salesItems.map((v: any) => ({
        id: v.id_venta.toString(),
        clienteId: v.id_usuario_cliente?.toString() || "",
        clienteNombre:
          `${v.nombre_cliente || ""} ${v.apellido_cliente || ""}`.trim() ||
          "Sin Nombre",
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
        estado: v.estado ? ("activo" as const) : ("anulada" as const),
        metodoPago: (v.metodo_pago as any) || "Efectivo",
      }));

      setVentas(mapped);
    } catch (e) {
      console.error("Error fetching ventas:", e);
      toast.error("Error al cargar ventas");
    }
  };

  useEffect(() => {
    refreshVentas();
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  const [formData, setFormData] = useState({
    clienteId: "",
    pedidoId: "",
    metodoPago: "Efectivo" as "Efectivo" | "Transferencia",
    productos: [
      { productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 },
    ],
  });

  const handleOpenDialog = () => {
    setFormData({
      clienteId: "",
      pedidoId: "",
      metodoPago: "Efectivo",
      productos: [
        {
          productoId: "",
          cantidad: 1,
          precioUnitario: 0,
          maxStock: 0,
        },
      ],
    });
    setIsDialogOpen(true);
  };

  const addProductLine = () => {
    setFormData({
      ...formData,
      productos: [
        ...formData.productos,
        {
          productoId: "",
          cantidad: 1,
          precioUnitario: 0,
          maxStock: 0,
        },
      ],
    });
  };

  const removeProductLine = (index: number) => {
    const newProductos = formData.productos.filter((_, i) => i !== index);
    setFormData({ ...formData, productos: newProductos });
  };

  const updateProductLine = (
    index: number,
    field: string,
    value: any,
    prodObj?: any,
  ) => {
    const newProductos = [...formData.productos];

    if (field === "productoId") {
      // Validar duplicados: si el producto ya existe en otra línea, fusionar
      const existingIndex = newProductos.findIndex(
        (p, i) => i !== index && p.productoId === value
      );

      if (existingIndex !== -1 && value) {
        // Sumar cantidad a la línea existente
        const ms = newProductos[existingIndex].maxStock || prodObj?.stock || 0;
        const nuevaCantidad = newProductos[existingIndex].cantidad + (newProductos[index].cantidad || 1);
        const cantidadFinal = ms > 0 ? Math.min(nuevaCantidad, ms) : nuevaCantidad;

        if (ms > 0 && nuevaCantidad > ms) {
          toast.warning(`Stock limitado. Se ajustó al máximo disponible: ${ms}`);
        } else {
          toast.info(`Producto ya agregado. Se actualizó la cantidad.`);
        }

        newProductos[existingIndex] = {
          ...newProductos[existingIndex],
          cantidad: cantidadFinal,
        };
        // Eliminar la línea duplicada
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

      // Cantidad debe ser > 0
      if (parsed <= 0) {
        toast.warning("La cantidad debe ser mayor a 0");
        newProductos[index] = { ...newProductos[index], cantidad: 1 };
        setFormData({ ...formData, productos: newProductos });
        return;
      }

      // Cantidad ≤ stock disponible
      if (ms > 0 && parsed > ms) {
        toast.warning(`Stock insuficiente. Máximo disponible: ${ms}`);
        newProductos[index] = { ...newProductos[index], cantidad: ms };
        setFormData({ ...formData, productos: newProductos });
        return;
      }

      newProductos[index] = { ...newProductos[index], cantidad: parsed };

    } else {
      newProductos[index] = { ...newProductos[index], [field]: value };
    }

    setFormData({ ...formData, productos: newProductos });
  };

  const handleSave = async () => {
    const clienteIdNum = Number(formData.clienteId);
    if (!formData.clienteId || isNaN(clienteIdNum)) {
      toast.error("Debe seleccionar un cliente válido");
      return;
    }

    const productosValidos = formData.productos.every(
      (p) => p.productoId && !isNaN(Number(p.productoId)),
    );
    if (!productosValidos) {
      toast.error(
        "Asegúrese de que todos los productos seleccionados sean válidos",
      );
      return;
    }

    // Validar cantidad > 0 en cada línea
    const cantidadesValidas = formData.productos.every((p) => p.cantidad > 0);
    if (!cantidadesValidas) {
      toast.error("La cantidad de cada producto debe ser mayor a 0");
      return;
    }

    // Validar cantidad ≤ stock disponible
    const stockValido = formData.productos.every(
      (p) => p.maxStock === 0 || p.cantidad <= p.maxStock
    );
    if (!stockValido) {
      toast.error("Uno o más productos superan el stock disponible");
      return;
    }

    setIsSaving(true);
    try {
      const subtotal = formData.productos.reduce(
        (sum, p) => sum + p.cantidad * p.precioUnitario,
        0,
      );
      const iva = Math.round(subtotal * CONFIG.IVA);
      const total = subtotal + iva;

      const payload = {
        id_usuario_cliente: clienteIdNum,
        id_pedido: formData.pedidoId ? Number(formData.pedidoId) : null,
        metodo_pago: formData.metodoPago,
        productos: formData.productos,
        subtotal,
        iva,
        total,
      };

      await saleService.create(payload);
      toast.success("Venta registrada con éxito");
      await refreshVentas();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar la venta");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDetail = (venta: any) => {
    setSelectedVenta(venta);
    setDetailDialogOpen(true);
  };

  const handleAnularVenta = async () => {
    if (!saleToAnnul) return;

    setIsSaving(true);
    try {
      await saleService.annul(Number(saleToAnnul));
      toast.success("Venta anulada correctamente");
      await refreshVentas();
      setIsAnnulDialogOpen(false);
      setSaleToAnnul(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al anular la venta");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = (venta: any) => {
    const cliente = clientes.find((c: Cliente) => c.id === venta.clienteId);
    generateSalePDF(venta, cliente, productos);
  };

  const getStatusColor = (estado: string) => {
    if (estado === "activo") {
      return {
        bg: "bg-emerald-50/50",
        text: "text-emerald-700",
        label: "Activa",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      };
    }
    return {
      bg: "bg-[#fff0f5]",
      text: "text-[#c47b96]",
      label: "Anulada",
      icon: <X className="w-3.5 h-3.5" />,
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSearchChange = (query: string) => {
    // Eliminar caracteres especiales no permitidos, solo letras, números, espacios y guiones
    const sanitized = query.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]/g, "");
    setSearchQuery(sanitized);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      {/* HEADER */}
      <div className="px-8 pt-8 pb-5">
        <div className="relative overflow-hidden rounded-2xl shadow-xl">
          <div
            className="relative px-6 py-8"
            style={{
              background: `
                radial-gradient(ellipse at 80% 8%, rgba(140,70,90,0.6) 0%, transparent 50%),
                radial-gradient(ellipse at 12% 65%, rgba(80,25,40,0.55) 0%, transparent 50%),
                radial-gradient(ellipse at 55% 92%, rgba(110,45,65,0.45) 0%, transparent 45%),
                linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)
              `,
            }}
          >
            <div className="relative flex flex-wrap gap-6 justify-between items-center z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-bold tracking-tight"
                      style={{
                        color: "#fffff2",
                      }}
                    >
                      Ventas
                    </h1>
                    <p
                      className="text-sm mt-0.5"
                      style={{
                        color: "#fffff2",
                      }}
                    >
                      Gestión de ventas y facturación
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleOpenDialog}
                style={{ backgroundColor: "#7b1347ff", color: "#ffffff" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity duration-150 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-100 bg-white space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
                  placeholder="Buscar por ID de venta, nombre de cliente o estado (activo/anulada)..."
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5" />
                    ID Pedido
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Cliente
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Fecha
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Total
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Método Pago
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Estado
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3 pr-4">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {ventas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-[#c47b96]" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-lg">
                          {searchQuery
                            ? `No se encontraron resultados para "${searchQuery}"`
                            : "No hay ventas registradas"}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchQuery
                            ? "Intenta con otros términos de búsqueda"
                            : "Las ventas aparecerán aquí"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                ventas.map((venta) => {
                  const isAnulada = venta.estado === "anulada";
                  const statusColor = getStatusColor(venta.estado);
                  return (
                    <TableRow
                      key={venta.id}
                      className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                    >
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#c47b96] transition-colors"></div>
                          <span className="font-mono text-[11px] font-semibold text-gray-500">
                            {venta.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-500 text-sm font-mono">
                          {venta.pedidoId ? (
                            `#${venta.pedidoId}`
                          ) : (
                            <span className="text-gray-400 italic">
                              Venta Directa
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800 font-semibold text-sm">
                            {(venta as any).clienteNombre || "Sin Nombre"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-500 text-sm font-mono">
                          {venta.fecha}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-900 font-bold text-base bg-gradient-to-r from-[#2e1020] to-[#4a2035] bg-clip-text text-transparent">
                          {formatCurrency(venta.total)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
                          <CreditCard className="w-3 h-3" />
                          {venta.metodoPago}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${statusColor.bg} ${statusColor.text}`}
                        >
                          {statusColor.icon}
                          {statusColor.label}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadPDF(venta)}
                            title="Descargar PDF"
                            className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewDetail(venta)}
                            title="Ver detalle"
                            className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isAnulada && (
                            <button
                              onClick={() => {
                                setSaleToAnnul(venta.id);
                                setIsAnnulDialogOpen(true);
                              }}
                              title="Anular venta"
                              className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Create Dialog - Premium */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[95vw] rounded-2xl shadow-2xl p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white z-10">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#c47b96,#e092b2)",
                  boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
                }}
              >
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Nueva Venta
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-0.5">
                  Formulario para crear una nueva venta
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Fila superior: Cliente + Método de Pago */}
            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "16px" }}>
              
              {/* Cliente */}
              <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <User className="w-3.5 h-3.5" /> Cliente <span style={{ color: "#f87171" }}>*</span>
                </p>
                <div style={{ background: "#ffffff", borderRadius: "8px" }}>
                  <AsyncClientSelect
                    value={formData.clienteId}
                    onChange={(val) => setFormData({ ...formData, clienteId: val })}
                  />
                </div>
              </div>

              {/* Método de Pago */}
              <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CreditCard className="w-3.5 h-3.5" /> Método de Pago <span style={{ color: "#f87171" }}>*</span>
                </p>
                <GenericCombobox
                  options={[
                    { value: "Efectivo", label: "Efectivo" },
                    { value: "Transferencia", label: "Transferencia" },
                  ]}
                  value={formData.metodoPago}
                  onChange={(v) => setFormData({ ...formData, metodoPago: v as any })}
                  placeholder="Seleccionar método"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Sección de Productos */}
            <div style={{ background: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px" }}>
              
              {/* Header productos */}
              <div className="flex items-center justify-between" style={{ background: "#f9fafb", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <Package className="w-3.5 h-3.5" /> Productos <span style={{ color: "#f87171" }}>*</span>
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={addProductLine}
                  className="hover:opacity-90 rounded-lg font-bold text-xs h-7 px-3 border-0 flex items-center"
                  style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
                </Button>
              </div>

              {/* Lista de productos */}
              <div style={{ padding: "0 16px", maxHeight: "300px", overflowY: "auto" }}>
                {formData.productos.map((prod, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "16px 0",
                      borderBottom: index < formData.productos.length - 1 ? "1px solid #f3f4f6" : "none",
                      position: "relative",
                      zIndex: 100 - index,
                    }}
                  >
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-6">
                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                          Producto
                        </p>
                        <div style={{ background: "#ffffff", borderRadius: "8px" }}>
                          <AsyncProductSelect
                            value={prod.productoId}
                            onChange={(val, prodObj) => updateProductLine(index, "productoId", val, prodObj)}
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                          Cant.
                        </p>
                        <Input
                          type="number"
                          min="1"
                          value={prod.cantidad}
                          onChange={(e) => updateProductLine(index, "cantidad", parseInt(e.target.value))}
                          className="border-gray-200 text-gray-800 h-9 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                          Precio
                        </p>
                        <Input
                          type="number"
                          value={prod.precioUnitario}
                          onChange={(e) => updateProductLine(index, "precioUnitario", parseFloat(e.target.value))}
                          className="border-gray-200 text-gray-800 h-9 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
                          Total
                        </p>
                        <div style={{ height: "36px", padding: "0 12px", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", fontWeight: 800, color: "#1f2937" }}>
                            {formatCurrency(prod.cantidad * prod.precioUnitario)}
                          </span>
                        </div>
                      </div>

                      {formData.productos.length > 1 && (
                        <div className="absolute -top-1 -right-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeProductLine(index)}
                            style={{ height: "24px", width: "24px", padding: 0 }}
                            className="bg-white border border-gray-200 rounded-full text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer: Total + Botones */}
          <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-gray-100 bg-white z-10">
            {/* Total */}
            <div className="bg-gradient-to-r from-[#fff0f5] to-[#fce8f0] rounded-xl border border-[#f0d5e0]" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                Total de la Venta
              </p>
              <span className="text-[#c47b96] font-black text-2xl">
                {formatCurrency(formData.productos.reduce((sum, p) => sum + p.cantidad * p.precioUnitario, 0))}
              </span>
            </div>
            {/* Botones */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
                style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </div>
                ) : (
                  "Confirmar Venta"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog - Premium */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 !w-[92vw] !max-w-[680px] rounded-2xl shadow-2xl p-0 overflow-hidden">
          {selectedVenta && (
            <>
              {/* Header con gradiente */}
              <div
                className="relative px-8 py-6"
                style={{
                  backgroundColor: "#c47b96"
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/15 rounded-xl border border-white/20">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-white leading-tight">
                        Detalle de Venta
                      </DialogTitle>
                      <p className="text-white font-bold mt-0.5 font-mono tracking-wider">
                        DETALLE #{selectedVenta.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                      style={{
                        background: selectedVenta.estado === "activo" ? "rgba(209,250,229,0.9)" : "rgba(254,226,226,0.9)",
                        color: selectedVenta.estado === "activo" ? "#065f46" : "#991b1b",
                      }}
                    >
                      {getStatusColor(selectedVenta.estado).label}
                    </span>
                    <button
                      onClick={() => setDetailDialogOpen(false)}
                      className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info rápida en el header */}
                <div className="flex items-center gap-6 mt-5">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-sm font-semibold">
                      {clientes.find((c) => c.id === selectedVenta.clienteId)?.nombre || "Consumidor Final"}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-sm font-semibold">{selectedVenta.fecha}</span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-sm font-semibold">{selectedVenta.metodoPago}</span>
                  </div>
                </div>
              </div>

              {/* Artículos */}
              <div className="px-8 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Artículos</p>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-[#c47b96] bg-[#fff1f2]">
                    {selectedVenta.productos.length} {selectedVenta.productos.length === 1 ? "ítem" : "ítems"}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  {/* Cabecera */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <div className="col-span-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Producto</div>
                    <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Cant.</div>
                    <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Precio</div>
                    <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Total</div>
                  </div>

                  {/* Filas */}
                  <div className="max-h-[240px] overflow-y-auto">
                    {selectedVenta.productos.map((p: any, i: number) => {
                      const producto = productos.find((prod) => prod.id === p.productoId);
                      return (
                        <div
                          key={i}
                          className={`grid grid-cols-12 gap-4 px-4 py-3.5 items-center ${i < selectedVenta.productos.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50/60 transition-colors`}
                        >
                          <div className="col-span-6 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {producto?.imagenUrl
                                ? <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-contain" />
                                : <Package className="w-4 h-4 text-gray-300" />
                              }
                            </div>
                            <span className="text-sm font-semibold text-gray-800 truncate">{producto?.nombre || "Producto"}</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-sm text-gray-600 font-medium">{p.cantidad}</span>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="text-sm text-gray-600">{formatCurrency(p.precioUnitario)}</span>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="text-sm font-bold text-gray-800">{formatCurrency(p.cantidad * p.precioUnitario)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Totales */}
              <div className="px-8 py-5">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold text-gray-700">{formatCurrency(selectedVenta.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm pb-3 border-b border-gray-100">
                      <span className="text-gray-500">IVA ({CONFIG.IVA * 100}%)</span>
                      <span className="font-semibold text-gray-700">{formatCurrency(selectedVenta.iva)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm font-bold text-gray-800">Total</span>
                      <span className="text-xl font-black text-[#c47b96]">{formatCurrency(selectedVenta.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner anulada */}
              {selectedVenta.estado === "anulada" && (
                <div className="mx-8 mb-4 bg-red-50 rounded-xl px-4 py-3 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">Esta transacción ha sido anulada y no tiene validez contable.</p>
                </div>
              )}

              {/* Footer */}
              <div className="px-8 pb-6 pt-2">
                <Button
                  onClick={() => setDetailDialogOpen(false)}
                  className="w-full rounded-xl text-white font-semibold h-11 text-sm border-0"
                  style={{ backgroundColor: "#c47b96" }}
                >
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Annul Confirmation Dialog */}
      <Dialog open={isAnnulDialogOpen} onOpenChange={setIsAnnulDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          {/* Encabezado */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#fff1f2",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.12)",
                }}
              >
                <AlertCircle className="w-5 h-5" style={{ color: "#ef4444" }} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Anular Venta
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAnnulDialogOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo */}
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Tarjeta de advertencia */}
            <div
              style={{
                background: "#fef2f2",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <AlertCircle
                style={{
                  color: "#ef4444",
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    lineHeight: 1.5,
                  }}
                >
                  ¿Estás seguro que deseas anular esta venta?
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  Esta acción devolverá el stock a los productos y marcará la
                  venta como anulada permanentemente en los registros.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsAnnulDialogOpen(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAnularVenta}
              disabled={isSaving}
              className="rounded-lg text-white font-semibold px-6 h-10 text-sm"
              style={{ background: "#ef4444" }}
            >
              {isSaving ? "Procesando..." : "Confirmar Anulación"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
