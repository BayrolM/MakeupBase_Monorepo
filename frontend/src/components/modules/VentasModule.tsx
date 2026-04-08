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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Plus,
  Eye,
  Trash2,
  FileText,
  Search,
  X,
  ShoppingBag,
  DollarSign,
  Calendar,
  User,
  Hash,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Package,
  ClipboardList,
  CheckCheck,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { generateSalePDF } from "../../lib/pdfGenerator";
import { saleService } from "../../services/saleService";
import { Cliente } from "../../lib/store";
import { CONFIG } from "../../lib/constants";

export function VentasModule() {
  const { ventas, clientes, productos, setVentas } =
    useStore();
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
    productos: [{ productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 }],
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
      newProductos[index] = {
        ...newProductos[index],
        productoId: value,
        precioUnitario: prodObj?.precioVenta || 0,
        maxStock: prodObj?.stock || 0,
        cantidad: Math.min(newProductos[index].cantidad, prodObj?.stock || 0) || 1,
      };
    } else if (field === "cantidad") {
      const ms = newProductos[index].maxStock || 0;
      const cantidadValida = ms > 0 ? Math.max(1, Math.min(value, ms)) : Math.max(1, value);
      if (ms > 0 && value > ms) {
        toast.warning(
          `Stock limitado. Máximo disponible: ${ms}`,
        );
      }
      newProductos[index] = {
        ...newProductos[index],
        cantidad: cantidadValida,
      };
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

    try {
      await saleService.annul(Number(saleToAnnul));
      toast.success("Venta anulada correctamente");
      await refreshVentas();
      setIsAnnulDialogOpen(false);
      setSaleToAnnul(null);
    } catch (error: any) {
      toast.error("Error al anular la venta");
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
    setSearchQuery(query);
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
                  placeholder="Buscar ventas por ID, cliente o estado..."
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
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3">
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
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c47b96] to-[#e092b2] flex items-center justify-center text-white text-xs font-bold">
                            {(venta as any).clienteNombre?.charAt(0) || "?"}
                          </div>
                          <span className="text-gray-800 font-medium text-sm">
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
                      <TableCell className="py-2.5">
                        <div className="flex items-center justify-end gap-1">
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
        <DialogContent className="bg-white border border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] rounded-xl">
                <ShoppingBag className="w-5 h-5 text-[#c47b96]" />
              </div>
              <DialogTitle className="text-[#2e1020] text-xl font-bold">
                Nueva Venta
              </DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Formulario para crear una nueva venta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#c47b96]" />
                  Cliente
                </Label>
                <AsyncClientSelect
                  value={formData.clienteId}
                  onChange={(val) => setFormData({ ...formData, clienteId: val })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-[#c47b96]" />
                  Método de Pago
                </Label>
                <Select
                  value={formData.metodoPago}
                  onValueChange={(value: "Efectivo" | "Transferencia") =>
                    setFormData({ ...formData, metodoPago: value })
                  }
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 rounded-xl">
                    <SelectItem value="Efectivo" className="text-gray-800">
                      Efectivo
                    </SelectItem>
                    <SelectItem value="Transferencia" className="text-gray-800">
                      Transferencia
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-[#c47b96]" />
                  Productos
                </Label>
                <Button
                  size="sm"
                  onClick={addProductLine}
                  className="bg-gradient-to-r from-[#c47b96] to-[#e092b2] hover:shadow-lg transition-all rounded-xl text-white"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Agregar producto
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {formData.productos.map((prod, index) => (
                  <div
                    key={index}
                    className="relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 transition-all hover:shadow-md"
                  >
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5 space-y-1.5">
                        <Label className="text-gray-600 text-xs font-medium">
                          Producto
                        </Label>
                        <AsyncProductSelect
                          value={prod.productoId}
                          onChange={(val, prodObj) =>
                            updateProductLine(index, "productoId", val, prodObj)
                          }
                        />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-gray-600 text-xs font-medium">
                          Cantidad
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={prod.cantidad}
                          onChange={(e) =>
                            updateProductLine(
                              index,
                              "cantidad",
                              parseInt(e.target.value),
                            )
                          }
                          className="bg-white border-gray-200 text-gray-800 h-10 rounded-lg"
                        />
                      </div>
                      <div className="col-span-3 space-y-1.5">
                        <Label className="text-gray-600 text-xs font-medium">
                          Precio
                        </Label>
                        <Input
                          type="number"
                          value={prod.precioUnitario}
                          onChange={(e) =>
                            updateProductLine(
                              index,
                              "precioUnitario",
                              parseFloat(e.target.value),
                            )
                          }
                          className="bg-white border-gray-200 text-gray-800 h-10 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-gray-600 text-xs font-medium">
                          Total
                        </Label>
                        <div className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                          <span className="text-[#c47b96] text-sm font-bold">
                            {formatCurrency(
                              prod.cantidad * prod.precioUnitario,
                            )}
                          </span>
                        </div>
                      </div>
                      {formData.productos.length > 1 && (
                        <div className="absolute -top-2 -right-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeProductLine(index)}
                            className="h-7 w-7 p-0 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-[#fff0f5] to-[#fce8f0] p-4 rounded-xl border border-[#f0d5e0]">
                <div className="flex items-center justify-between">
                  <span className="text-[#2e1020] font-semibold text-base">
                    Total de la Venta
                  </span>
                  <span className="text-[#c47b96] font-black text-2xl">
                    {formatCurrency(
                      formData.productos.reduce(
                        (sum, p) => sum + p.cantidad * p.precioUnitario,
                        0,
                      ),
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 pt-4 gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-[#c47b96] to-[#e092b2] hover:shadow-lg transition-all rounded-xl text-white font-semibold"
              disabled={isSaving}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog - Premium */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent
          className="text-white border border-white/10 w-[95vw] sm:max-w-[700px] !max-w-[700px] p-0 overflow-hidden rounded-[2rem] shadow-2xl"
          style={{
            background:
              "linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)",
            backgroundColor: "#2e1020",
          }}
        >
          {/* Header Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#b06080] via-[#e0a0be] to-[#b06080]" />

          {selectedVenta && (
            <div className="flex flex-col h-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#e092b2]/10 rounded-xl border border-[#e092b2]/20">
                    <ShoppingBag className="w-6 h-6 text-[#e092b2]" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white leading-tight">
                      Detalle de Venta{" "}
                      <span className="text-[#e092b2]">
                        #{selectedVenta.id.slice(0, 8).toUpperCase()}
                      </span>
                    </DialogTitle>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">
                      Información de Transacción
                    </p>
                  </div>
                </div>
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(selectedVenta.estado).text} bg-white/5 border border-current/20`}
                >
                  {getStatusColor(selectedVenta.estado).label}
                </div>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Info */}
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest">
                      Cliente
                    </Label>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-white font-bold text-base">
                        {clientes.find((c) => c.id === selectedVenta.clienteId)
                          ?.nombre || "Consumidor Final"}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-white/40 text-[10px]">
                        <User className="w-3.5 h-3.5" /> ID Cliente:{" "}
                        {selectedVenta.clienteId}
                      </div>
                    </div>
                  </div>

                  {/* Sale Meta */}
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest">
                      Datos de Venta
                    </Label>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <Calendar className="w-3.5 h-3.5 text-[#e092b2]" />
                        <span>Fecha: {selectedVenta.fecha}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-xs text-white/80">
                        <CreditCard className="w-3.5 h-3.5 text-[#e092b2]" />
                        <span>Método: {selectedVenta.metodoPago}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest flex items-center justify-between">
                    <span>Artículos Facturados</span>
                    <span className="text-[#e092b2]">
                      {selectedVenta.productos.length} ítems
                    </span>
                  </Label>
                  <div className="space-y-3">
                    {selectedVenta.productos.map((p: any, i: number) => {
                      const producto = productos.find(
                        (prod) => prod.id === p.productoId,
                      );
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center p-2">
                              {producto?.imagenUrl ? (
                                <img
                                  src={producto.imagenUrl}
                                  alt={producto.nombre}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-white/10" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm leading-tight">
                                {producto?.nombre || "Producto"}
                              </p>
                              <p className="text-white/40 text-[10px] mt-1 font-mono">
                                {p.cantidad} unid. x{" "}
                                {formatCurrency(p.precioUnitario)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-black text-sm">
                              {formatCurrency(p.cantidad * p.precioUnitario)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary Totals */}
                <div className="pt-6 border-t border-white/10">
                  <div className="ml-auto w-full max-w-[300px] space-y-4">
                    <div className="space-y-2 text-xs font-medium">
                      <div className="flex justify-between text-white/40">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatCurrency(selectedVenta.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-white/40">
                        <span>IVA ({CONFIG.IVA * 100}%)</span>
                        <span className="font-mono">{formatCurrency(selectedVenta.iva)}</span>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-[#e092b2]/10 border border-[#e092b2]/20 shadow-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e092b2]/60">Total Venta</span>
                        <CheckCheck className="w-4 h-4 text-[#e092b2]" />
                      </div>
                      <span className="text-3xl font-black text-white block tracking-tighter">
                        {formatCurrency(selectedVenta.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedVenta.estado === "anulada" && (
                   <div className="p-6 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center gap-4">
                     <AlertCircle className="w-8 h-8 text-rose-500/60" />
                     <div>
                       <h4 className="text-rose-400 font-bold text-sm uppercase tracking-wider">Venta Anulada</h4>
                       <p className="text-rose-100/40 text-xs italic">Esta transacción no tiene validez contable por anulación</p>
                     </div>
                   </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-white/10 bg-black/10 flex justify-end">
                <Button
                  onClick={() => setDetailDialogOpen(false)}
                  variant="ghost"
                  className="px-8 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all font-bold uppercase text-[10px] tracking-widest"
                >
                  Regresar al Listado
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Annul Confirmation Dialog */}
      <Dialog open={isAnnulDialogOpen} onOpenChange={setIsAnnulDialogOpen}>
        <DialogContent
          className="text-white border border-white/10 w-[90%] max-w-[400px] rounded-2xl p-0 overflow-hidden"
          style={{
            background:
              "linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-[#b06080] via-[#e0a0be] to-[#b06080]" />

          <div className="p-8">
            <DialogHeader className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>
                <DialogTitle className="text-center text-xl font-bold text-white">
                  Anular Venta
                </DialogTitle>
              </div>
              <DialogDescription className="text-white/60 text-center text-sm">
                ¿Estás seguro que deseas anular esta venta? Esta acción
                devolverá el stock a los productos y marcará la venta como
                anulada permanentemente.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={handleAnularVenta}
                className="w-full h-11 bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-lg transition-all rounded-xl text-white font-bold"
              >
                Confirmar Anulación
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsAnnulDialogOpen(false)}
                className="w-full h-11 border border-white/20 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-xl"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
