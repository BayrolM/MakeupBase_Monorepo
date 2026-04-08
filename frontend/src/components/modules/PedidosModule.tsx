import { useState, useEffect } from "react";
import { generateOrderPDF } from "../../lib/pdfGenerator";
import {
  useStore,
  OrderStatus,
  Cliente,
  Producto,
  Status,
} from "../../lib/store";
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
  Edit,
  Eye,
  Search,
  FileText,
  Trash2,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Hash,
  User,
  Calendar,
  DollarSign,
  MapPin,
  CreditCard,
  ShoppingBag,
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCheck,
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { orderService } from "../../services/orderService";
import { userService } from "../../services/userService";
import { productService } from "../../services/productService";
import { CONFIG } from "../../lib/constants";

export function PedidosModule() {
  const {
    pedidos,
    clientes,
    productos,
    setPedidos,
    setClientes,
    setProductos,
  } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pendiente");
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [pedidoToConfirm, setPedidoToConfirm] = useState<any>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Debounce logic for live search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [shippingFormData, setShippingFormData] = useState({
    transportadora: "Servientrega",
    numero_guia: "",
    fecha_envio: new Date().toISOString().split("T")[0],
    fecha_estimada: "",
  });
  const [hoveredCarrier, setHoveredCarrier] = useState<string | null>(null);

  useEffect(() => {
    refreshPedidos();
    refreshDependencies();
  }, []);

  const refreshDependencies = async () => {
    try {
      const uRes = await userService.getAll({ id_rol: 2, limit: 100 });
      const mappedClientes: Cliente[] = uRes.data.map((u: any) => ({
        id: u.id_usuario.toString(),
        nombre:
          `${u.nombres || u.nombre || ""} ${u.apellidos || u.apellido || ""}`.trim() ||
          "Sin Nombre",
        nombres: u.nombres || u.nombre || "",
        apellidos: u.apellidos || u.apellido || "",
        email: u.email,
        telefono: u.telefono || "",
        documento: u.documento || "",
        numeroDocumento: u.documento || "",
        estado: (u.estado ? "activo" : "inactivo") as Status,
        totalCompras: Number(u.total_ventas) || 0,
        fechaRegistro: u.fecha_registro || new Date().toISOString(),
      }));
      setClientes(mappedClientes);

      const pRes = await productService.getAll({ limit: 100 });
      const mappedProductos: Producto[] = pRes.data.map((p: any) => ({
        id: p.id_producto.toString(),
        nombre: p.nombre,
        descripcion: p.descripcion || "",
        categoriaId: p.id_categoria?.toString() || "1",
        marca: p.marca || "",
        precioCompra: Number(p.precio_compra) || 0,
        precioVenta: Number(p.precio_venta) || 0,
        stock: Number(p.stock_actual) || 0,
        stockMinimo: Number(p.stock_min) || 0,
        stockMaximo: Number(p.stock_max) || 100,
        imagenUrl: p.imagen_url || "",
        estado: (p.estado ? "activo" : "inactivo") as Status,
        fechaCreacion: p.fecha_creacion || new Date().toISOString(),
      }));
      setProductos(mappedProductos);
    } catch (error) {
      console.error("Error loading dependencies", error);
      toast.error("Error al cargar dependencias");
    }
  };

  const refreshPedidos = async () => {
    try {
      const response = await orderService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery,
      });

      setTotalItems(response.total || 0);
      const dbOrders = response.data || [];

      const mappedOrders = dbOrders.map((o: any) => ({
        id: o.id_pedido.toString(),
        clienteId: o.id_usuario_cliente
          ? o.id_usuario_cliente.toString()
          : "N/A",
        clienteNombre: o.nombre_usuario || "Sin Nombre",
        fecha:
          o.fecha_pedido && typeof o.fecha_pedido === "string"
            ? o.fecha_pedido.split("T")[0]
            : "N/A",
        productos: [],
        subtotal: o.total ? Math.round(Number(o.total) / (1 + CONFIG.IVA)) : 0,
        iva: o.total
          ? Math.round(
              Number(o.total) - Math.round(Number(o.total) / (1 + CONFIG.IVA)),
            )
          : 0,
        costoEnvio: CONFIG.COSTO_ENVIO,
        total: Number(o.total),
        estado: o.estado as OrderStatus,
        direccionEnvio: o.direccion || "N/A",
        pago_confirmado: !!o.pago_confirmado,
        comprobante_url: o.comprobante_url || "",
      }));
      setPedidos(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders", error);
      toast.error("Ocurrió un error cargando los pedidos desde la DB");
    }
  };

  useEffect(() => {
    refreshPedidos();
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  const [formData, setFormData] = useState({
    clienteId: "",
    direccionEnvio: "",
    productos: [{ productoId: "", cantidad: 1, precioUnitario: 0 }],
  });

  const handleOpenDialog = () => {
    setFormData({
      clienteId: clientes[0]?.id || "",
      direccionEnvio: "",
      productos: [
        {
          productoId: productos[0]?.id || "",
          cantidad: 1,
          precioUnitario: productos[0]?.precioVenta || 0,
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
          productoId: productos[0]?.id || "",
          cantidad: 1,
          precioUnitario: productos[0]?.precioVenta || 0,
        },
      ],
    });
  };

  const removeProductLine = (index: number) => {
    if (formData.productos.length > 1) {
      const newProductos = formData.productos.filter((_, i) => i !== index);
      setFormData({ ...formData, productos: newProductos });
    }
  };

  const updateProductLine = (index: number, field: string, value: any) => {
    const newProductos = [...formData.productos];
    if (field === "productoId") {
      const producto = productos.find((p) => p.id === value);
      newProductos[index] = {
        ...newProductos[index],
        productoId: value,
        precioUnitario: producto?.precioVenta || 0,
      };
    } else {
      newProductos[index] = { ...newProductos[index], [field]: value };
    }
    setFormData({ ...formData, productos: newProductos });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!formData.clienteId) {
        toast.error("Debe seleccionar un cliente.");
        setIsSaving(false);
        return;
      }
      if (
        formData.productos.length === 0 ||
        !formData.productos[0].productoId
      ) {
        toast.error("Debes agregar al menos un producto válido.");
        setIsSaving(false);
        return;
      }

      // Format payload for endpoint
      const payload = {
        id_cliente: Number(formData.clienteId),
        direccion: formData.direccionEnvio || "N/A",
        ciudad: "Bello", // default city just in case
        metodo_pago: "efectivo",
        items: formData.productos.map((p) => ({
          id_producto: Number(p.productoId),
          cantidad: p.cantidad,
        })),
      };

      await orderService.createDirect(payload);
      toast.success("Pedido creado en la Base de Datos exitosamente.");
      await refreshPedidos();
      await refreshDependencies(); // Para refrescar los stocks
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating order", error);
      toast.error(error.message || "Ocurrió un error al crear el pedido.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenStatusDialog = (pedido: any) => {
    setSelectedPedido(pedido);
    setNewStatus(pedido.estado);
    setMotivoAnulacion("");
    setIsStatusDialogOpen(true);
  };

  const handleViewDetail = async (pedido: any) => {
    try {
      // Necesitamos cargar los items profundamente mediante la api
      const fullOrder = await orderService.getById(Number(pedido.id));
      setSelectedPedido({
        ...pedido,
        productos: (fullOrder.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(),
          cantidad: i.cantidad,
          precioUnitario: i.precio_unitario || 0,
        })),
      });
      setDetailDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Error obteniendo el detalle completo del pedido");
    }
  };

  const handleViewPDF = async (pedido: any) => {
    try {
      const fullOrder = await orderService.getById(Number(pedido.id));
      const orderData = {
        ...pedido,
        productos: (fullOrder.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(),
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario || 0,
        })),
      };

      const cliente = clientes.find(
        (c: Cliente) => c.id === orderData.clienteId,
      );

      await generateOrderPDF(orderData, cliente, productos, CONFIG);
    } catch (error: any) {
      console.error(error);
      toast.error("Error al generar el documento PDF");
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === "cancelado" && !motivoAnulacion) {
      toast.error("Debe especificar un motivo de cancelación");
      return;
    }

    if (newStatus === "enviado") {
      setIsStatusDialogOpen(false);
      // Initialize shipping form with today's date
      setShippingFormData({
        ...shippingFormData,
        fecha_envio: new Date().toISOString().split("T")[0],
        fecha_estimada: "3-5 días hábiles", // Default estimation
      });
      setIsShippingDialogOpen(true);
      return;
    }

    try {
      await orderService.updateStatus(
        Number(selectedPedido.id),
        newStatus,
        motivoAnulacion,
      );

      if (newStatus === "entregado") {
        toast.success("Pedido entregado y venta registrada automáticamente", {
          description: `Se ha generado una nueva factura para el pedido #${selectedPedido.id}`,
        });
      } else {
        toast.success(`Estado actualizado a ${newStatus} correctamente`);
      }

      await refreshPedidos();
      await refreshDependencies(); // Refresca stock y potencialmente ventas si están cargadas
      setIsStatusDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al actualizar el estado del pedido");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<
      OrderStatus,
      { bg: string; text: string; label: string; icon: React.ReactNode }
    > = {
      pendiente: {
        bg: "bg-blue-50/50",
        text: "text-blue-600",
        label: "Pendiente",
        icon: <Clock className="w-3.5 h-3.5" />,
      },
      preparado: {
        bg: "bg-amber-50/50",
        text: "text-amber-600",
        label: "Preparado",
        icon: <Package className="w-3.5 h-3.5" />,
      },
      procesando: {
        bg: "bg-indigo-50/50",
        text: "text-indigo-600",
        label: "Procesando",
        icon: <Edit className="w-3.5 h-3.5" />,
      },
      enviado: {
        bg: "bg-purple-50/50",
        text: "text-purple-600",
        label: "Enviado",
        icon: <Truck className="w-3.5 h-3.5" />,
      },
      entregado: {
        bg: "bg-emerald-50/50",
        text: "text-emerald-700",
        label: "Entregado",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      },
      cancelado: {
        bg: "bg-[#fff0f5]",
        text: "text-[#c47b96]",
        label: "Cancelado",
        icon: <XCircle className="w-3.5 h-3.5" />,
      },
      carrito: {
        bg: "bg-gray-50/50",
        text: "text-gray-600",
        label: "Carrito",
        icon: <ShoppingBag className="w-3.5 h-3.5" />,
      },
    };
    return colors[status] || colors["pendiente"];
  };

  const getTrackingUrl = (transportadora: string, guia: string) => {
    switch (transportadora) {
      case "Servientrega":
        return `https://www.servientrega.com/wps/portal/Colombia/transaccional/rastreo-envios?id=${guia}`;
      case "Envia":
        return `https://envia.co/rastreo-de-guias?guia=${guia}`;
      case "Coordinadora":
        return `https://www.coordinadora.com/rastreo/rastreo-de-guia/detalle-de-rastreo-de-guia/?guia=${guia}`;
      case "Interrapidisimo":
        return `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${guia}`;
      default:
        return "";
    }
  };

  const handleConfirmShipping = async () => {
    if (!shippingFormData.numero_guia) {
      toast.error("El número de guía es obligatorio");
      return;
    }

    setIsSaving(true);
    try {
      const tracking_link = getTrackingUrl(
        shippingFormData.transportadora,
        shippingFormData.numero_guia,
      );

      const shippingData = {
        ...shippingFormData,
        tracking_link,
      };

      await orderService.updateStatus(
        Number(selectedPedido.id),
        "enviado",
        "",
        shippingData,
      );

      toast.success("Pedido marcado como enviado correctamente");
      await refreshPedidos();
      setIsShippingDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al confirmar el envío");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePago = (pedido: any) => {
    setPedidoToConfirm(pedido);
    setIsPaymentConfirmOpen(true);
  };

  const confirmPaymentToggle = async () => {
    if (!pedidoToConfirm) return;
    setIsConfirmingPayment(true);
    try {
      const nuevoEstado = !pedidoToConfirm.pago_confirmado;
      await orderService.confirmPayment(
        Number(pedidoToConfirm.id),
        nuevoEstado,
      );
      toast.success(
        nuevoEstado
          ? "Pago confirmado con éxito"
          : "Confirmación de pago removida",
      );
      await refreshPedidos();
      setIsPaymentConfirmOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el pago");
    } finally {
      setIsConfirmingPayment(false);
      setPedidoToConfirm(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Pagination logic
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const getAllStatuses = (): OrderStatus[] => {
    return ["pendiente", "preparado", "enviado", "entregado", "cancelado"];
  };

  const handleOpenComprobante = (url: string) => {
    if (!url) {
      toast.error("Este pedido no tiene comprobante adjunto.");
      return;
    }
    // IMPORTANTE: Asegúrate de que la URL apunte a tu servidor backend
    const fullUrl = `http://localhost:3000${url}`;
    setPreviewImageUrl(fullUrl);
    setIsPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      {/* HEADER */}
      <div className="px-8 pt-8 pb-5">
        <div
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-[3px] border-l-[#c47b96] flex flex-wrap gap-4 justify-between items-center"
          style={{
            background: `
            radial-gradient(ellipse at 80% 8%, rgba(140,70,90,0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 12% 65%, rgba(80,25,40,0.55) 0%, transparent 50%),
            radial-gradient(ellipse at 55% 92%, rgba(110,45,65,0.35) 0%, transparent 45%),
            linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)
          `,
          }}
        >
          <div>
            <h1
              className="text-2xl font-semibold mb-0.5"
              style={{
                color: "#fffff2",
              }}
            >
              Pedidos
            </h1>
            <p
              className=" text-sm"
              style={{
                color: "#fffff2",
              }}
            >
              Gestión de pedidos y seguimiento
            </p>
          </div>
          <button
            onClick={handleOpenDialog}
            style={{ backgroundColor: "#7b1347ff", color: "#ffffff" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Pedido
          </button>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-white space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
                  placeholder="Buscar pedidos por ID, cliente o estado..."
                />
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Cliente
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Fecha
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    Total
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    Dirección
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                    Pago
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    Estado
                  </div>
                </TableHead>
                <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider text-right py-3">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pedidos.length === 0 ? (
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
                            : "No hay pedidos registrados"}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchQuery
                            ? "Intenta con otros términos de búsqueda"
                            : "Los pedidos aparecerán aquí"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pedidos.map((pedido) => (
                  <TableRow
                    key={pedido.id}
                    className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                  >
                    {/* ID con comprobante */}
                    <TableCell className="py-2.5">
                      <button
                        onClick={() =>
                          handleOpenComprobante(pedido.comprobante_url || "")
                        }
                        className="font-mono text-[11px] font-semibold text-gray-500 hover:text-[#c47b96] transition-all duration-200 flex items-center gap-2 group/btn"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/btn:bg-[#c47b96] transition-colors"></div>
                        <span className="group-hover/btn:underline">
                          {pedido.id.slice(0, 8)}
                        </span>
                      </button>
                    </TableCell>

                    {/* Cliente */}
                    <TableCell className="py-2.5">
                      <span className="text-gray-800 font-medium text-sm">
                        {(pedido as any).clienteNombre || "Sin Nombre"}
                      </span>
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="py-2.5">
                      <span className="text-gray-500 text-sm font-mono">
                        {pedido.fecha}
                      </span>
                    </TableCell>

                    {/* Total */}
                    <TableCell className="py-2.5">
                      <span className="font-bold text-base bg-gradient-to-r from-[#2e1020] to-[#4a2035] bg-clip-text text-transparent">
                        {formatCurrency(pedido.total)}
                      </span>
                    </TableCell>

                    {/* Dirección */}
                    <TableCell className="py-2.5">
                      <div
                        className="max-w-[200px] group/dir"
                        title={pedido.direccionEnvio}
                      >
                        <p className="text-gray-500 text-sm truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400 group-hover/dir:text-[#c47b96] transition-colors" />
                          {pedido.direccionEnvio}
                        </p>
                      </div>
                    </TableCell>

                    {/* Estado de Pago */}
                    <TableCell className="py-2.5">
                      <button
                        onClick={() => handleTogglePago(pedido)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          pedido.pago_confirmado
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:shadow-md"
                            : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:shadow-md"
                        }`}
                        title={
                          pedido.pago_confirmado
                            ? "Pago confirmado"
                            : "Click para confirmar pago"
                        }
                      >
                        {pedido.pago_confirmado ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span className="text-xs">
                          {pedido.pago_confirmado ? "Pagado" : "Pendiente"}
                        </span>
                      </button>
                    </TableCell>

                    {/* Estado del Pedido */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(pedido.estado).bg} ${getStatusColor(pedido.estado).text}`}
                        >
                          {getStatusColor(pedido.estado).label}
                        </span>

                        {pedido.estado !== "entregado" &&
                          pedido.estado !== "cancelado" && (
                            <button
                              onClick={() => handleOpenStatusDialog(pedido)}
                              title="Cambiar estado"
                              style={{
                                color: "#c47b96",
                                backgroundColor: "transparent",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#c47b96";
                                e.currentTarget.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color = "#c47b96";
                              }}
                              className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                      </div>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewPDF(pedido)}
                          title="Descargar PDF"
                          className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewDetail(pedido)}
                          title="Ver detalle"
                          className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
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
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nuevo Pedido</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Cliente</Label>
                <Select
                  value={formData.clienteId}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, clienteId: value })
                  }
                >
                  <SelectTrigger className="bg-input-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {clientes.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="text-foreground"
                      >
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Dirección de Envío</Label>
                <Input
                  value={formData.direccionEnvio}
                  onChange={(e) =>
                    setFormData({ ...formData, direccionEnvio: e.target.value })
                  }
                  className="bg-input-background border-border text-foreground"
                  placeholder="Calle 50 #30-20"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Productos</Label>
                <Button
                  size="sm"
                  onClick={addProductLine}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="w-4 h-4 mr-1" /> Agregar
                </Button>
              </div>

              {formData.productos.map((prod, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-end p-3 bg-surface rounded-lg"
                >
                  <div className="col-span-6 space-y-1">
                    <Label
                      className="text-foreground-secondary"
                      style={{ fontSize: "12px" }}
                    >
                      Producto
                    </Label>
                    <Select
                      value={prod.productoId}
                      onValueChange={(value: string) =>
                        updateProductLine(index, "productoId", value)
                      }
                    >
                      <SelectTrigger className="bg-input-background border-border text-foreground h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {productos
                          .filter((p) => p.estado === "activo")
                          .map((p) => (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              className="text-foreground"
                            >
                              {p.nombre} (Stock: {p.stock})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label
                      className="text-foreground-secondary"
                      style={{ fontSize: "12px" }}
                    >
                      Cantidad
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={isNaN(prod.cantidad) ? "" : prod.cantidad}
                      onChange={(e) => {
                        const val =
                          e.target.value === ""
                            ? NaN
                            : parseInt(e.target.value);
                        updateProductLine(index, "cantidad", val);
                      }}
                      className="bg-input-background border-border text-foreground h-9"
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label
                      className="text-foreground-secondary"
                      style={{ fontSize: "12px" }}
                    >
                      Precio
                    </Label>
                    <Input
                      type="number"
                      value={
                        isNaN(prod.precioUnitario) ? "" : prod.precioUnitario
                      }
                      onChange={(e) => {
                        const val =
                          e.target.value === ""
                            ? NaN
                            : parseFloat(e.target.value);
                        updateProductLine(index, "precioUnitario", val);
                      }}
                      className="bg-input-background border-border text-foreground h-9"
                    />
                  </div>
                  {formData.productos.length > 1 && (
                    <div className="col-span-12 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeProductLine(index)}
                        className="h-7 w-7 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <div className="bg-surface p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span
                    className="text-foreground"
                    style={{ fontSize: "16px", fontWeight: 600 }}
                  >
                    Total:
                  </span>
                  <span
                    className="text-primary"
                    style={{ fontSize: "20px", fontWeight: 600 }}
                  >
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-border text-foreground hover:bg-surface"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSaving ? "Creando..." : "Crear Pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog Premium & Horizontal Layout Force */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent
          className="text-white border border-white/10 w-[95vw] sm:max-w-[800px] !max-w-[800px] p-0 overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)]"
          style={{
            background:
              "linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%) !important",
            backgroundColor: "#2e1020",
            maxWidth: "800px",
            width: "95vw",
          }}
        >
          {/* Header Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#b06080] via-[#e0a0be] to-[#b06080]" />

          <div className="p-0">
            <DialogHeader className="p-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-2xl"
                  style={{
                    background: "rgba(224, 146, 178, 0.1)",
                    border: "1px solid rgba(224, 146, 178, 0.2)",
                  }}
                >
                  <ClipboardList className="w-6 h-6 text-[#e092b2]" />
                </div>
                <div>
                  <DialogTitle
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#e092b2",
                    }}
                  >
                    Gestionar Estado del Pedido
                  </DialogTitle>
                  <p className="text-white/40 text-sm mt-0.5">
                    ID Transacción:{" "}
                    <span className="text-[#e092b2] font-mono">
                      #{selectedPedido?.id?.slice(0, 8)?.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-row gap-0">
              {/* Columna Izquierda: Información Actual (45%) */}
              <div className="w-[45%] p-8 border-r border-white/5 bg-black/10">
                <div className="space-y-6">
                  <div>
                    <Label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black mb-4 block">
                      Información Actual
                    </Label>
                    {selectedPedido && (
                      <div
                        className="p-5 rounded-2xl border border-white/10"
                        style={{ background: "rgba(255, 255, 255, 0.03)" }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                            Estado
                          </p>
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${getStatusColor(selectedPedido.estado).bg.replace("bg-", "bg-").split(" ")[0]} animate-pulse`}
                            style={{ boxShadow: "0 0 12px currentColor" }}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-white/5 text-[#e092b2]">
                            {getStatusColor(selectedPedido.estado).icon}
                          </div>
                          <span className="text-white font-black text-lg tracking-tight uppercase">
                            {getStatusColor(selectedPedido.estado).label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl border border-white/5 bg-white/5 space-y-2">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      Resumen
                    </p>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Este pedido se encuentra en la etapa de{" "}
                      <span className="text-[#e092b2] font-bold">
                        {getStatusColor(selectedPedido?.estado).label}
                      </span>
                      . Selecciona la siguiente acción para continuar con el
                      flujo lógico.
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Acciones (55%) */}
              <div className="w-[55%] p-8 space-y-6 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-white/80 text-xs uppercase tracking-wider font-semibold ml-1">
                      Asignar Nuevo Estado
                    </Label>
                    <Select
                      value={newStatus}
                      onValueChange={(value: OrderStatus) =>
                        setNewStatus(value)
                      }
                    >
                      <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-[#e092b2]/20 focus:border-[#e092b2] transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className="bg-[#1a0d14] border border-white/10 text-white rounded-xl shadow-2xl overflow-hidden"
                        style={{ backgroundColor: "#1a0d14", opacity: 1 }}
                      >
                        {getAllStatuses().map((status) => {
                          const statusInfo = getStatusColor(status);
                          return (
                            <SelectItem
                              key={status}
                              value={status}
                              className="focus:bg-[#c47b96] focus:text-white cursor-pointer py-3 transition-colors border-b border-white/5 last:border-0"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-[#e092b2]">
                                  {statusInfo.icon}
                                </span>
                                <span className="text-sm font-medium">
                                  {statusInfo.label}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {newStatus === "cancelado" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="text-rose-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-2 ml-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Motivo de Anulación *
                      </Label>
                      <Textarea
                        value={motivoAnulacion}
                        onChange={(e) => setMotivoAnulacion(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-rose-500/20 focus:border-rose-400 transition-all duration-300 resize-none min-h-[120px]"
                        placeholder="Especifique con detalle por qué desea anular este pedido..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    onClick={handleUpdateStatus}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "rgba(224, 146, 178, 0.9)";
                      (e.currentTarget as HTMLElement).style.color = "#1a0d14";
                      (e.currentTarget as HTMLElement).style.transform =
                        "scale(1.02)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#e092b2";
                      (e.currentTarget as HTMLElement).style.transform =
                        "scale(1)";
                    }}
                    className="w-full h-12 border transition-all duration-300"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: "#e092b2",
                      color: "#e092b2",
                      fontWeight: 700,
                      borderRadius: "14px",
                      transform: "scale(1)",
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Guardar Cambios
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsStatusDialogOpen(false)}
                    className="text-white/40 hover:text-white hover:bg-white/5 transition-colors duration-200 text-xs"
                  >
                    Descartar y volver
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog - Original Vertical Layout with Premium Colors */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent
          className="text-white border border-white/10 w-[95vw] sm:max-w-[800px] !max-w-[800px] p-0 overflow-hidden rounded-[2rem] shadow-2xl"
          style={{
            background:
              "linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)",
            backgroundColor: "#2e1020",
            maxWidth: "800px",
            width: "95vw",
          }}
        >
          {/* Header Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#b06080] via-[#e0a0be] to-[#b06080]" />

          {selectedPedido && (
            <div className="flex flex-col h-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#e092b2]/10 rounded-xl border border-[#e092b2]/20">
                    <ShoppingBag className="w-6 h-6 text-[#e092b2]" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white leading-tight">
                      Detalle del Pedido{" "}
                      <span className="text-[#e092b2]">
                        #{selectedPedido.id.slice(0, 8).toUpperCase()}
                      </span>
                    </DialogTitle>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">
                      Información Completa de la Transacción
                    </p>
                  </div>
                </div>
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(selectedPedido.estado).text} bg-white/5 border border-current/20`}
                >
                  {getStatusColor(selectedPedido.estado).label}
                </div>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Info */}
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest">
                      Titular de la Compra
                    </Label>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-white font-bold text-base">
                        {clientes.find((c) => c.id === selectedPedido.clienteId)
                          ?.nombre || "Consumidor Final"}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-white/40 text-[10px]">
                        <User className="w-3.5 h-3.5" /> ID Cliente:{" "}
                        {selectedPedido.clienteId}
                      </div>
                    </div>
                  </div>

                  {/* Order Meta */}
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest">
                      Resumen de Envío
                    </Label>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <Calendar className="w-3.5 h-3.5 text-[#e092b2]" />
                        <span>Fecha: {selectedPedido.fecha}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-xs text-white/80">
                        <MapPin className="w-3.5 h-3.5 text-[#e092b2]" />
                        <span className="truncate">
                          {selectedPedido.direccionEnvio}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest flex items-center justify-between">
                    <span>Productos Incluidos</span>
                    <span className="text-[#e092b2]">
                      {selectedPedido.productos.length} ítems
                    </span>
                  </Label>
                  <div className="space-y-3">
                    {selectedPedido.productos.map((p: any, i: number) => {
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

                {/* Total Section */}
                <div className="p-6 rounded-2xl bg-[#e092b2]/10 border border-[#e092b2]/20 flex items-center justify-between">
                  <div>
                    <p className="text-[#e092b2]/40 text-[9px] uppercase font-black tracking-widest">
                      Monto Total Liquidado
                    </p>
                    <p className="text-3xl font-black text-white mt-1">
                      {formatCurrency(selectedPedido.total)}
                    </p>
                  </div>
                  <div className="p-4 bg-[#e092b2] rounded-2xl shadow-lg">
                    <CheckCheck className="w-6 h-6 text-[#1a0d14]" />
                  </div>
                </div>

                {/* Cancellation Info */}
                {selectedPedido.motivoAnulacion && (
                  <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                    <p className="text-rose-400 font-bold text-[9px] uppercase tracking-widest">
                      Motivo de Anulación
                    </p>
                    <p className="text-white/60 text-sm italic italic leading-relaxed">
                      "{selectedPedido.motivoAnulacion}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setDetailDialogOpen(false)}
                  className="text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs border border-white/5"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="bg-[#e092b2] hover:bg-[#c47b96] text-[#1a0d14] font-bold text-xs px-6 rounded-xl"
                >
                  Imprimir Copia
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-card border-border w-[90vw] sm:max-w-[700px] !max-w-[700px] rounded-2xl overflow-hidden p-6 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-foreground text-xl font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Verificación de Comprobante
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-center p-2 bg-surface rounded-xl overflow-hidden border border-border shadow-inner max-h-[70vh]">
            <img
              src={previewImageUrl}
              alt="Comprobante de pago"
              className="max-w-full h-auto rounded-lg shadow-sm hover:scale-[1.01] transition-transform duration-300 object-contain"
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={() => setIsPreviewOpen(false)}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8"
            >
              Cerrar Vista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog Premium & Horizontal Layout Force */}
      <Dialog
        open={isPaymentConfirmOpen}
        onOpenChange={setIsPaymentConfirmOpen}
      >
        <DialogContent
          className="text-white border border-white/10 w-[95vw] sm:max-w-[550px] !max-w-[550px] rounded-[2rem] p-0 overflow-hidden shadow-2xl"
          style={{
            background:
              "linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)",
            boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.7)",
            maxWidth: "550px",
            width: "95vw",
          }}
        >
          {/* Header Accent Barb */}
          <div className="h-2 w-full bg-gradient-to-r from-[#b06080] via-[#e0a0be] to-[#b06080]" />

          <div className="p-10 text-center">
            <DialogHeader className="mb-8">
              <DialogTitle
                className="text-center"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#e092b2",
                  letterSpacing: "-0.02em",
                }}
              >
                Confirmar Pago Manual
              </DialogTitle>
            </DialogHeader>

            <div className="text-center space-y-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-300"
                style={{
                  background: "rgba(224, 146, 178, 0.1)",
                  border: "1px solid rgba(224, 146, 178, 0.2)",
                }}
              >
                <CheckCircle2 className="w-8 h-8 text-[#e092b2]" />
              </div>

              <div className="space-y-3">
                <p className="text-white/80 text-sm leading-relaxed px-2">
                  ¿Estás seguro que revisaste bien si se pagó este pedido? Esta
                  acción es irreversible para el historial contable.
                </p>
                <div className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <span className="text-[#e092b2] font-mono text-xs">
                    ORDEN #{pedidoToConfirm?.id?.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <Button
                onClick={confirmPaymentToggle}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(224, 146, 178, 0.9)";
                  (e.currentTarget as HTMLElement).style.color = "#1a0d14";
                  (e.currentTarget as HTMLElement).style.transform =
                    "scale(1.02)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#e092b2";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }}
                className="w-full h-11 border transition-all duration-300"
                disabled={isConfirmingPayment}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#e092b2",
                  color: "#e092b2",
                  fontWeight: 600,
                  borderRadius: "12px",
                  transform: "scale(1)",
                }}
              >
                {isConfirmingPayment ? "Procesando..." : "Sí, confirmar pago"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsPaymentConfirmOpen(false)}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(255, 255, 255, 0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255, 255, 255, 0.3)";
                  (e.currentTarget as HTMLElement).style.color = "#ffffff";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255, 255, 255, 0.1)";
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255, 255, 255, 0.4)";
                }}
                className="w-full h-11 border transition-all duration-300"
                disabled={isConfirmingPayment}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.4)",
                  borderRadius: "12px",
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Shipping Info Dialog - Premium & Minimalist */}
      <Dialog
        open={isShippingDialogOpen}
        onOpenChange={setIsShippingDialogOpen}
      >
        <DialogContent
          className="text-white border border-white/10 w-[90%] max-w-[450px] rounded-2xl p-0"
          style={{
            background:
              "linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#b06080] via-[#e0a0be] to-[#b06080]" />

          <div className="p-8">
            <DialogHeader className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Truck className="w-6 h-6 text-[#e092b2]" />
                <DialogTitle
                  className="text-center"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#e092b2",
                  }}
                >
                  Información de Envío
                </DialogTitle>
              </div>
              <p className="text-white/60 text-center text-sm">
                Completa los datos para despachar la orden{" "}
                <span className="text-[#e092b2] font-mono">
                  #{selectedPedido?.id?.slice(0, 8)?.toUpperCase() || "..."}
                </span>
              </p>
            </DialogHeader>

            <div className="space-y-5">
              {/* Rediseño de Transportadora: Grilla de Tarjetas Interactivas */}
              <div className="space-y-2">
                <Label className="text-white/80 text-xs uppercase tracking-wider font-semibold">
                  Selecciona Transportadora *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Servientrega",
                    "Envia",
                    "Coordinadora",
                    "Interrapidisimo",
                  ].map((carrier) => (
                    <button
                      key={carrier}
                      type="button"
                      onMouseEnter={() => setHoveredCarrier(carrier)}
                      onMouseLeave={() => setHoveredCarrier(null)}
                      onClick={() =>
                        setShippingFormData((prev) => ({
                          ...prev,
                          transportadora: carrier,
                        }))
                      }
                      className="relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300"
                      style={{
                        backgroundColor:
                          shippingFormData.transportadora === carrier ||
                          hoveredCarrier === carrier
                            ? "rgba(224, 146, 178, 0.2)"
                            : "rgba(255, 255, 255, 0.05)",
                        borderColor:
                          shippingFormData.transportadora === carrier ||
                          hoveredCarrier === carrier
                            ? "#e092b2"
                            : "rgba(255, 255, 255, 0.1)",
                        transform:
                          hoveredCarrier === carrier
                            ? "scale(1.05)"
                            : "scale(1)",
                        boxShadow:
                          shippingFormData.transportadora === carrier ||
                          hoveredCarrier === carrier
                            ? "0 0 20px rgba(224, 146, 178, 0.2)"
                            : "none",
                      }}
                    >
                      <Truck
                        className="w-6 h-6 mb-2 transition-colors duration-300"
                        style={{
                          color:
                            shippingFormData.transportadora === carrier ||
                            hoveredCarrier === carrier
                              ? "#e092b2"
                              : "rgba(255, 255, 255, 0.4)",
                        }}
                      />
                      <span
                        className="text-[12px] font-bold tracking-tight transition-colors duration-300"
                        style={{
                          color:
                            shippingFormData.transportadora === carrier ||
                            hoveredCarrier === carrier
                              ? "#ffffff"
                              : "rgba(255, 255, 255, 0.6)",
                        }}
                      >
                        {carrier}
                      </span>

                      {/* Subrayado elegante si está seleccionado */}
                      {shippingFormData.transportadora === carrier && (
                        <div className="absolute bottom-2 w-8 h-1 bg-[#e092b2] rounded-full animate-in slide-in-from-bottom-1 duration-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Número de Guía */}
              <div className="space-y-2">
                <Label className="text-white/80 text-xs uppercase tracking-wider font-semibold">
                  Número de Guía *
                </Label>
                <Input
                  value={shippingFormData.numero_guia}
                  onChange={(e) =>
                    setShippingFormData({
                      ...shippingFormData,
                      numero_guia: e.target.value,
                    })
                  }
                  placeholder="Ej: 1234567890"
                  className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-[#e092b2]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fecha de Envío */}
                <div className="space-y-2">
                  <Label className="text-white/80 text-xs uppercase tracking-wider font-semibold">
                    Fecha de Envío
                  </Label>
                  <Input
                    type="date"
                    value={shippingFormData.fecha_envio}
                    onChange={(e) =>
                      setShippingFormData({
                        ...shippingFormData,
                        fecha_envio: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10 text-white h-11 rounded-xl [color-scheme:dark]"
                  />
                </div>

                {/* Fecha Estimada */}
                <div className="space-y-2">
                  <Label className="text-white/80 text-xs uppercase tracking-wider font-semibold">
                    Entrega Estimada
                  </Label>
                  <Input
                    value={shippingFormData.fecha_estimada}
                    onChange={(e) =>
                      setShippingFormData({
                        ...shippingFormData,
                        fecha_estimada: e.target.value,
                      })
                    }
                    placeholder="Ej: 3-5 días"
                    className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <Button
                onClick={handleConfirmShipping}
                disabled={isSaving}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(224, 146, 178, 0.9)";
                  (e.currentTarget as HTMLElement).style.color = "#1a0d14";
                  (e.currentTarget as HTMLElement).style.transform =
                    "scale(1.02)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#e092b2";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }}
                className="w-full h-11 border transition-all duration-300"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#e092b2",
                  color: "#e092b2",
                  fontWeight: 600,
                  borderRadius: "12px",
                  transform: "scale(1)",
                }}
              >
                {isSaving ? "Procesando..." : "Confirmar Envío"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsShippingDialogOpen(false)}
                className="w-full h-11 border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-xl"
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
