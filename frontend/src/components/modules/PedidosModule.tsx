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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
// Removed unused Select imports
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
import { AsyncClientSelect } from "../AsyncClientSelect";
import { AsyncProductSelect } from "../AsyncProductSelect";
import { GenericCombobox } from "../GenericCombobox";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    clienteId: "",
    direccionEnvio: "",
    productos: [] as { productoId: string; cantidad: number; precioUnitario: number; maxStock: number }[],
  });
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
      // Detectar si el query es un estado conocido para enviarlo como filtro de estado
      const ESTADOS_VALIDOS = ['pendiente', 'preparado', 'procesando', 'enviado', 'entregado', 'cancelado'];
      const qLower = searchQuery.toLowerCase().trim();
      const esEstado = ESTADOS_VALIDOS.includes(qLower);

      const response = await orderService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: esEstado ? undefined : searchQuery || undefined,
        estado: esEstado ? qLower : undefined,
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
    productos: [
      { productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 },
    ],
  });

  const handleOpenDialog = () => {
    setFormData({
      clienteId: "",
      direccionEnvio: "",
      productos: [
        { productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 },
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
    if (formData.productos.length > 1) {
      const newProductos = formData.productos.filter((_, i) => i !== index);
      setFormData({ ...formData, productos: newProductos });
    }
  };

  const updateProductLine = (
    index: number,
    field: string,
    value: any,
    prodObj?: any,
  ) => {
    const newProductos = [...formData.productos];

    if (field === "productoId") {
      // Evitar duplicados: si ya existe en otra línea, fusionar cantidades
      const existingIndex = newProductos.findIndex(
        (p, i) => i !== index && p.productoId === value
      );
      if (existingIndex !== -1 && value) {
        const ms = newProductos[existingIndex].maxStock || prodObj?.stock || 0;
        const nuevaCantidad = newProductos[existingIndex].cantidad + (newProductos[index].cantidad || 1);
        const cantidadFinal = ms > 0 ? Math.min(nuevaCantidad, ms) : nuevaCantidad;
        if (ms > 0 && nuevaCantidad > ms) {
          toast.warning(`Stock limitado. Se ajustó al máximo disponible: ${ms}`);
        } else {
          toast.info("Producto ya agregado. Se actualizó la cantidad.");
        }
        newProductos[existingIndex] = { ...newProductos[existingIndex], cantidad: cantidadFinal };
        const filtered = newProductos.filter((_, i) => i !== index);
        setFormData({ ...formData, productos: filtered });
        return;
      }

      const producto = productos.find((p) => p.id === value);
      newProductos[index] = {
        ...newProductos[index],
        productoId: value,
        precioUnitario: prodObj?.precioVenta || producto?.precioVenta || 0,
        maxStock: prodObj?.stock || producto?.stock || 0,
        cantidad: Math.min(newProductos[index].cantidad || 1, prodObj?.stock || producto?.stock || 999) || 1,
      };

    } else if (field === "cantidad") {
      const ms = newProductos[index].maxStock || 0;
      const parsed = parseInt(value) || 1;

      if (parsed <= 0) {
        toast.warning("La cantidad debe ser mayor a 0");
        newProductos[index] = { ...newProductos[index], cantidad: 1 };
        setFormData({ ...formData, productos: newProductos });
        return;
      }
      if (ms > 0 && parsed > ms) {
        toast.warning(`Stock insuficiente. Máximo disponible: ${ms}`);
        newProductos[index] = { ...newProductos[index], cantidad: ms };
        setFormData({ ...formData, productos: newProductos });
        return;
      }
      newProductos[index] = { ...newProductos[index], cantidad: parsed };

    } else if (field === "precioUnitario") {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed < 0) {
        toast.warning("El precio no puede ser negativo");
        newProductos[index] = { ...newProductos[index], precioUnitario: 0 };
        setFormData({ ...formData, productos: newProductos });
        return;
      }
      newProductos[index] = { ...newProductos[index], precioUnitario: isNaN(parsed) ? 0 : parsed };

    } else {
      newProductos[index] = { ...newProductos[index], [field]: value };
    }

    setFormData({ ...formData, productos: newProductos });
  };

  const handleSave = async () => {
    // Cliente obligatorio
    if (!formData.clienteId) {
      toast.error("Debe seleccionar un cliente.");
      return;
    }

    // Dirección obligatoria
    if (!formData.direccionEnvio.trim()) {
      toast.error("La dirección de envío es obligatoria.");
      return;
    }

    // Al menos un producto válido
    if (formData.productos.length === 0 || !formData.productos[0].productoId) {
      toast.error("Debes agregar al menos un producto válido.");
      return;
    }

    const productosInvalidos = formData.productos.some(
      (p) => !p.productoId || isNaN(Number(p.productoId))
    );
    if (productosInvalidos) {
      toast.error("Todos los productos deben ser válidos.");
      return;
    }

    // Cantidades > 0
    const cantidadesInvalidas = formData.productos.some((p) => !p.cantidad || p.cantidad <= 0);
    if (cantidadesInvalidas) {
      toast.error("La cantidad de cada producto debe ser mayor a 0.");
      return;
    }

    // Cantidades ≤ stock disponible
    const stockExcedido = formData.productos.some(
      (p) => p.maxStock > 0 && p.cantidad > p.maxStock
    );
    if (stockExcedido) {
      toast.error("Uno o más productos superan el stock disponible.");
      return;
    }

    // Precios ≥ 0
    const preciosInvalidos = formData.productos.some(
      (p) => isNaN(p.precioUnitario) || p.precioUnitario < 0
    );
    if (preciosInvalidos) {
      toast.error("Los precios no pueden ser negativos.");
      return;
    }

    // Total > 0
    const subtotal = formData.productos.reduce(
      (sum, p) => sum + p.cantidad * p.precioUnitario, 0
    );
    if (subtotal <= 0) {
      toast.error("El total del pedido debe ser mayor a 0.");
      return;
    }

    setIsSaving(true);
    try {
      // Estado inicial siempre "pendiente"
      const payload = {
        id_cliente: Number(formData.clienteId),
        direccion: formData.direccionEnvio.trim(),
        ciudad: "Bello",
        metodo_pago: "efectivo",
        estado: "pendiente",
        items: formData.productos.map((p) => ({
          id_producto: Number(p.productoId),
          cantidad: p.cantidad,
        })),
      };

      await orderService.createDirect(payload);
      toast.success("Pedido creado exitosamente.");
      await refreshPedidos();
      await refreshDependencies();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating order", error);
      toast.error(error.message || "Ocurrió un error al crear el pedido.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEditDialog = async (pedido: any) => {
    try {
      const fullOrder = await orderService.getById(Number(pedido.id));
      setEditingPedido(pedido);
      setEditFormData({
        clienteId: pedido.clienteId || "",
        direccionEnvio: pedido.direccionEnvio || "",
        productos: (fullOrder.items || []).map((i: any) => {
          const productoId = i.id_producto.toString();
          const prodEnStore = productos.find(p => p.id === productoId);
          return {
            productoId,
            cantidad: Number(i.cantidad),
            precioUnitario: Number(i.precio_unitario) || 0,
            maxStock: prodEnStore?.stock || 0,
          };
        }),
      });
      setIsEditDialogOpen(true);
    } catch (e) {
      toast.error("Error al cargar el pedido para editar");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPedido) return;
    const estado = editingPedido.estado;

    // Enviado o posterior: solo lectura
    if (['enviado', 'entregado', 'cancelado'].includes(estado)) {
      toast.error("Este pedido no puede ser modificado en su estado actual.");
      return;
    }

    if (!editFormData.direccionEnvio.trim()) {
      toast.error("La dirección de envío es obligatoria.");
      return;
    }

    // Validaciones de productos (solo en pendiente)
    if (estado === 'pendiente') {
      if (!editFormData.clienteId) { toast.error("Debe seleccionar un cliente."); return; }

      // Producto obligatorio en cada línea
      const sinProducto = editFormData.productos.some(p => !p.productoId);
      if (sinProducto) { toast.error("Todos los productos deben ser seleccionados."); return; }

      // Cantidad > 0
      const cantidadInvalida = editFormData.productos.some(p => !p.cantidad || p.cantidad <= 0);
      if (cantidadInvalida) { toast.error("La cantidad de cada producto debe ser mayor a 0."); return; }

      // Cantidad ≤ stock
      const stockExcedido = editFormData.productos.some(p => p.maxStock > 0 && p.cantidad > p.maxStock);
      if (stockExcedido) { toast.error("Uno o más productos superan el stock disponible."); return; }

      // Precio ≥ 0
      const precioInvalido = editFormData.productos.some(p => isNaN(p.precioUnitario) || p.precioUnitario < 0);
      if (precioInvalido) { toast.error("Los precios no pueden ser negativos."); return; }

      // Total > 0
      const total = editFormData.productos.reduce((s, p) => s + p.cantidad * p.precioUnitario, 0);
      if (total <= 0) { toast.error("El total del pedido debe ser mayor a 0."); return; }
    }

    setIsSaving(true);
    try {
      const payload: any = { direccion: editFormData.direccionEnvio.trim() };

      if (estado === 'pendiente') {
        payload.id_cliente = Number(editFormData.clienteId);
        payload.items = editFormData.productos.map(p => ({
          id_producto: Number(p.productoId),
          cantidad: p.cantidad,
        }));
      }

      await orderService.update(Number(editingPedido.id), payload);
      toast.success("Pedido actualizado correctamente.");
      await refreshPedidos();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el pedido.");
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

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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
    // Sanitizar: solo letras, números, espacios y guiones
    const sanitized = query.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]/g, "");
    setSearchQuery(sanitized);
    setCurrentPage(1);
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
                  placeholder="Buscar por ID, cliente o estado (pendiente, enviado, entregado...)"
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
                      <span className="text-gray-800 font-semibold text-sm">
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
                          onClick={() => handleOpenEditDialog(pedido)}
                          title="Editar pedido"
                          className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Edit className="w-4 h-4" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 2px 8px rgba(196,123,150,0.3)" }}
              >
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Editar Pedido
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-0.5">
                  {editingPedido && ['enviado','entregado','cancelado'].includes(editingPedido.estado)
                    ? "Solo lectura — el pedido no puede modificarse en este estado"
                    : editingPedido?.estado === 'pendiente'
                      ? "Puedes cambiar cliente, dirección y productos"
                      : "Solo puedes modificar la dirección de envío"}
                </DialogDescription>
              </div>
            </div>
            <button onClick={() => setIsEditDialogOpen(false)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {editingPedido && (
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Banner estado */}
              {['enviado','entregado','cancelado'].includes(editingPedido.estado) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-700 font-medium">
                    Este pedido está en estado <strong className="uppercase">{editingPedido.estado}</strong> y no puede ser modificado.
                  </p>
                </div>
              )}

              {/* Cliente — solo en pendiente */}
              {editingPedido.estado === 'pendiente' && (
                <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <User className="w-3.5 h-3.5" /> Cliente <span style={{ color: "#f87171" }}>*</span>
                  </p>
                  <AsyncClientSelect
                    value={editFormData.clienteId}
                    onChange={(val) => setEditFormData({ ...editFormData, clienteId: val })}
                  />
                </div>
              )}

              {/* Dirección — pendiente y procesando */}
              {!['enviado','entregado','cancelado'].includes(editingPedido.estado) && (
                <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin className="w-3.5 h-3.5" /> Dirección de Envío <span style={{ color: "#f87171" }}>*</span>
                  </p>
                  <Input
                    value={editFormData.direccionEnvio}
                    onChange={(e) => setEditFormData({ ...editFormData, direccionEnvio: e.target.value })}
                    className="border-gray-200 text-gray-800 h-10 rounded-lg"
                    style={{ background: "#ffffff" }}
                    placeholder="Calle 50 #30-20"
                  />
                </div>
              )}

              {/* Productos — solo en pendiente */}
              {editingPedido.estado === 'pendiente' && (
                <div style={{ background: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px" }}>
                  <div className="flex items-center justify-between" style={{ background: "#f9fafb", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                      <Package className="w-3.5 h-3.5" /> Productos
                    </p>
                    <Button
                      type="button" size="sm"
                      onClick={() => setEditFormData({ ...editFormData, productos: [...editFormData.productos, { productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 }] })}
                      className="hover:opacity-90 rounded-lg font-bold text-xs h-7 px-3 border-0 flex items-center"
                      style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
                    </Button>
                  </div>
                  <div style={{ padding: "0 16px", maxHeight: "300px", overflowY: "auto" }}>
                    {editFormData.productos.map((prod, index) => (
                      <div key={index} style={{ display: "flex", flexDirection: "column", padding: "14px 0", borderBottom: index < editFormData.productos.length - 1 ? "1px solid #f3f4f6" : "none", position: "relative", zIndex: 100 - index }}>
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-6">
                            <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>Producto</p>
                            <AsyncProductSelect
                              value={prod.productoId}
                              onChange={(val, prodObj) => {
                                const newP = [...editFormData.productos];
                                // Verificar duplicados
                                const existingIdx = newP.findIndex((p, i) => i !== index && p.productoId === val);
                                if (existingIdx !== -1 && val) {
                                  const ms = newP[existingIdx].maxStock || prodObj?.stock || 0;
                                  const nuevaCant = newP[existingIdx].cantidad + (newP[index].cantidad || 1);
                                  newP[existingIdx] = { ...newP[existingIdx], cantidad: ms > 0 ? Math.min(nuevaCant, ms) : nuevaCant };
                                  toast.info("Producto ya agregado. Se actualizó la cantidad.");
                                  setEditFormData({ ...editFormData, productos: newP.filter((_, i) => i !== index) });
                                  return;
                                }
                                newP[index] = { ...newP[index], productoId: val, precioUnitario: prodObj?.precioVenta || 0, maxStock: prodObj?.stock || 0 };
                                setEditFormData({ ...editFormData, productos: newP });
                              }}
                            />
                          </div>
                          <div className="col-span-2">
                            <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>Cant.</p>
                            <Input
                              type="number" min="1"
                              value={prod.cantidad}
                              onChange={(e) => {
                                const newP = [...editFormData.productos];
                                const val = parseInt(e.target.value) || 1;
                                const ms = newP[index].maxStock;
                                if (val <= 0) {
                                  toast.warning("La cantidad debe ser mayor a 0");
                                  newP[index] = { ...newP[index], cantidad: 1 };
                                } else if (ms > 0 && val > ms) {
                                  toast.warning(`Stock insuficiente. Máximo: ${ms}`);
                                  newP[index] = { ...newP[index], cantidad: ms };
                                } else {
                                  newP[index] = { ...newP[index], cantidad: val };
                                }
                                setEditFormData({ ...editFormData, productos: newP });
                              }}
                              className="border-gray-200 text-gray-800 h-9 rounded-lg"
                            />
                          </div>
                          <div className="col-span-2">
                            <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>Precio</p>
                            <div style={{ height: "36px", padding: "0 10px", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center" }}>
                              <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                                {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(prod.precioUnitario)}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>Subtotal</p>
                            <div style={{ height: "36px", padding: "0 10px", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center" }}>
                              <span style={{ fontSize: "12px", fontWeight: 800, color: "#1f2937" }}>
                                {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(prod.cantidad * prod.precioUnitario)}
                              </span>
                            </div>
                          </div>
                          {editFormData.productos.length > 1 && (
                            <div className="absolute -top-1 -right-1">
                              <Button size="sm" variant="ghost"
                                onClick={() => setEditFormData({ ...editFormData, productos: editFormData.productos.filter((_, i) => i !== index) })}
                                style={{ height: 24, width: 24, padding: 0 }}
                                className="bg-white border border-gray-200 rounded-full text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Total */}
                  <div className="bg-gradient-to-r from-[#fff0f5] to-[#fce8f0] px-4 py-3 border-t border-[#f0d5e0] flex items-center justify-between">
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#c47b96", textTransform: "uppercase", letterSpacing: "0.07em" }}>Total</span>
                    <span style={{ fontSize: "18px", fontWeight: 900, color: "#c47b96" }}>
                      {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
                        editFormData.productos.reduce((sum, p) => sum + p.cantidad * p.precioUnitario, 0)
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Dirección solo lectura si está enviado */}
              {['enviado','entregado','cancelado'].includes(editingPedido.estado) && (
                <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Dirección de Envío</p>
                  <p className="text-sm text-gray-700">{editingPedido.direccionEnvio || "—"}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm" disabled={isSaving}>
              Cancelar
            </Button>
            {editingPedido && !['enviado','entregado','cancelado'].includes(editingPedido.estado) && (
              <Button onClick={handleSaveEdit} disabled={isSaving} className="rounded-lg font-semibold px-6 h-10 text-sm border-0" style={{ backgroundColor: "#c47b96", color: "#ffffff" }}>
                {isSaving ? (
                  <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</div>
                ) : "Guardar Cambios"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          {/* Encabezado con avatar */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
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
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Nuevo Pedido
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Registra una nueva orden manualmente
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <User className="w-3.5 h-3.5" /> Cliente{" "}
                  <span style={{ color: "#f87171" }}>*</span>
                </p>
                <div style={{ background: "#ffffff", borderRadius: "8px" }}>
                  <AsyncClientSelect
                    value={formData.clienteId}
                    onChange={(value: string) =>
                      setFormData({ ...formData, clienteId: value })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <MapPin className="w-3.5 h-3.5" /> Dirección de Envío{" "}
                  <span style={{ color: "#f87171" }}>*</span>
                </p>
                <Input
                  value={formData.direccionEnvio}
                  onChange={(e) =>
                    setFormData({ ...formData, direccionEnvio: e.target.value })
                  }
                  className="border-gray-200 text-gray-800 h-10 rounded-lg"
                  style={{ background: "#ffffff" }}
                  placeholder="Calle 50 #30-20"
                />
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #f3f4f6",
                borderRadius: "12px",
                // overflow: "hidden", // Removido para permitir que los dropdowns se vean por encima
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{
                  background: "#f9fafb",
                  padding: "12px 16px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    margin: 0,
                  }}
                >
                  <Package className="w-3.5 h-3.5" /> Productos{" "}
                  <span style={{ color: "#f87171" }}>*</span>
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

              <div
                style={{
                  padding: "0 16px",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {formData.productos.map((prod, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "16px 0",
                      borderBottom:
                        index < formData.productos.length - 1
                          ? "1px solid #f3f4f6"
                          : "none",
                      position: "relative",
                      zIndex: 100 - index,
                    }}
                  >
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-6">
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            marginBottom: "6px",
                          }}
                        >
                          Producto
                        </p>
                        <div
                          style={{ background: "#ffffff", borderRadius: "8px" }}
                        >
                          <AsyncProductSelect
                            value={prod.productoId}
                            onChange={(val, prodObj) =>
                              updateProductLine(
                                index,
                                "productoId",
                                val,
                                prodObj,
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            marginBottom: "6px",
                          }}
                        >
                          Cant.
                        </p>
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
                          className="border-gray-200 text-gray-800 h-9 rounded-lg"
                        />
                      </div>
                      <div className="col-span-3">
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            marginBottom: "6px",
                          }}
                        >
                          Precio
                        </p>
                        <Input
                          type="number"
                          value={
                            isNaN(prod.precioUnitario)
                              ? ""
                              : prod.precioUnitario
                          }
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? NaN
                                : parseFloat(e.target.value);
                            updateProductLine(index, "precioUnitario", val);
                          }}
                          className="border-gray-200 text-gray-800 h-9 rounded-lg"
                        />
                      </div>

                      {formData.productos.length > 1 && (
                        <div className="absolute -top-1 -right-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeProductLine(index)}
                            style={{
                              height: "24px",
                              width: "24px",
                              padding: 0,
                            }}
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

              <div className="bg-gradient-to-r from-[#fff0f5] to-[#fce8f0] p-4 rounded-xl border border-[#f0d5e0]">
                <div className="flex items-center justify-between">
                  <span className="text-[#2e1020] font-semibold text-base">
                    Total de la Orden
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

          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
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
              {isSaving ? "Creando..." : "Crear Pedido"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog Premium & Horizontal Layout Force */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-4xl p-0 overflow-hidden rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
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
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Gestionar Estado del Pedido
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  ID Transacción:{" "}
                  <span className="text-[#c47b96] font-mono font-semibold">
                    #{selectedPedido?.id?.slice(0, 8)?.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsStatusDialogOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-row gap-0">
            {/* Columna Izquierda: Información Actual (45%) */}
            <div className="w-[45%] p-8 border-r border-gray-100 bg-gray-50 flex flex-col justify-center">
              <div className="space-y-6">
                <div>
                  <Label className="text-gray-500 text-[10px] uppercase tracking-[0.15em] font-bold mb-4 block">
                    Información Actual
                  </Label>
                  {selectedPedido && (
                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                          Estado
                        </p>
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${getStatusColor(selectedPedido.estado).bg.replace("bg-", "bg-").split(" ")[0]} animate-pulse`}
                          style={{ boxShadow: "0 0 8px currentColor" }}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gray-50 text-gray-600 border border-gray-100">
                          {getStatusColor(selectedPedido.estado).icon}
                        </div>
                        <span className="text-gray-900 font-black text-lg tracking-tight uppercase">
                          {getStatusColor(selectedPedido.estado).label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    Resumen
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Este pedido se encuentra en la etapa de{" "}
                    <span className="text-[#c47b96] font-bold">
                      {getStatusColor(selectedPedido?.estado).label}
                    </span>
                    . Selecciona la siguiente acción para continuar con el flujo
                    lógico.
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Acciones (55%) */}
            <div className="w-[55%] p-8 space-y-6 flex flex-col justify-center bg-white">
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ml-1">
                    Nuevo Estado
                  </p>
                  <GenericCombobox
                    options={[
                      { value: "pendiente", label: "Pendiente" },
                      { value: "preparado", label: "Preparado" },
                      { value: "enviado", label: "Enviado" },
                      { value: "entregado", label: "Entregado" },
                      { value: "cancelado", label: "Cancelado" },
                    ]}
                    value={newStatus}
                    onChange={(v) => setNewStatus(v as OrderStatus)}
                    placeholder="Seleccionar nuevo estado"
                    disabled={isSaving}
                  />
                </div>

                {newStatus === "cancelado" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-red-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-2 ml-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Motivo de Anulación *
                    </Label>
                    <Textarea
                      value={motivoAnulacion}
                      onChange={(e) => setMotivoAnulacion(e.target.value)}
                      className="bg-white border border-red-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 resize-none min-h-[120px]"
                      placeholder="Especifique con detalle por qué desea anular este pedido..."
                      disabled={isSaving}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={handleUpdateStatus}
                  disabled={isSaving}
                  style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
                  className="w-full h-12 rounded-xl border-0 font-bold hover:opacity-90 transition-all duration-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsStatusDialogOpen(false)}
                  disabled={isSaving}
                  className="w-full h-12 rounded-xl text-gray-600 border-gray-200 hover:bg-gray-50 transition-colors duration-200 font-semibold"
                >
                  Descartar y volver
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
          {selectedPedido && (
            <>
              {/* Encabezado con avatar */}
              <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 sticky top-0 bg-white z-10">
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
                      Detalle del Pedido
                    </DialogTitle>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ORDEN #{selectedPedido.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      background: [
                        "entregado",
                        "enviado",
                        "preparado",
                      ].includes(selectedPedido.estado)
                        ? "#d1fae5"
                        : selectedPedido.estado === "cancelado"
                          ? "#fee2e2"
                          : "#f3f4f6",
                      color: ["entregado", "enviado", "preparado"].includes(
                        selectedPedido.estado,
                      )
                        ? "#065f46"
                        : selectedPedido.estado === "cancelado"
                          ? "#991b1b"
                          : "#4b5563",
                    }}
                  >
                    {getStatusColor(selectedPedido.estado).label}
                  </span>
                  <button
                    onClick={() => setDetailDialogOpen(false)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Cuerpo */}
              <div
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Info Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  {/* Client Info */}
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <User className="w-3.5 h-3.5" /> Titular de la Compra
                    </p>
                    <div
                      style={{
                        background: "#ffffff",
                        borderRadius: "8px",
                        padding: "12px",
                        border: "1px solid #f3f4f6",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#1f2937",
                          marginBottom: "4px",
                        }}
                      >
                        {clientes.find((c) => c.id === selectedPedido.clienteId)
                          ?.nombre || "Consumidor Final"}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          fontWeight: 600,
                        }}
                      >
                        ID Cliente: {selectedPedido.clienteId}
                      </p>
                    </div>
                  </div>

                  {/* Order Meta */}
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <MapPin className="w-3.5 h-3.5" /> Resumen de Envío
                    </p>
                    <div
                      style={{
                        background: "#ffffff",
                        borderRadius: "8px",
                        padding: "12px",
                        border: "1px solid #f3f4f6",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Calendar className="w-4 h-4 text-[#c47b96]" />
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#374151",
                            fontWeight: 600,
                          }}
                        >
                          {selectedPedido.fecha}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <MapPin className="w-4 h-4 text-[#c47b96]" />
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#374151",
                            fontWeight: 600,
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {selectedPedido.direccionEnvio}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #f3f4f6",
                    borderRadius: "12px",
                    // overflow: "hidden", // Removido
                  }}
                >
                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "12px 16px",
                      borderBottom: "1px solid #f3f4f6",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        margin: 0,
                      }}
                    >
                      Productos Incluidos
                    </p>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#c47b96",
                        background: "#fff1f2",
                        padding: "2px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      {selectedPedido.productos.length} ÍTEMS
                    </span>
                  </div>
                  <div style={{ padding: "0 16px" }}>
                    {selectedPedido.productos.map((p: any, i: number) => {
                      const producto = productos.find(
                        (prod) => prod.id === p.productoId,
                      );
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "16px 0",
                            borderBottom:
                              i < selectedPedido.productos.length - 1
                                ? "1px solid #f3f4f6"
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "16px",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                background: "#f9fafb",
                                border: "1px solid #f3f4f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {producto?.imagenUrl ? (
                                <img
                                  src={producto.imagenUrl}
                                  alt={producto.nombre}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    borderRadius: 8,
                                  }}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <p
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 700,
                                  color: "#1f2937",
                                  marginBottom: 2,
                                }}
                              >
                                {producto?.nombre || "Producto"}
                              </p>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  fontWeight: 500,
                                }}
                              >
                                {p.cantidad} unid. x{" "}
                                {formatCurrency(p.precioUnitario)}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p
                              style={{
                                fontSize: "15px",
                                fontWeight: 800,
                                color: "#1f2937",
                              }}
                            >
                              {formatCurrency(p.cantidad * p.precioUnitario)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total Section */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}
                >
                  <div style={{ width: "100%", maxWidth: 300 }}>
                    <div
                      style={{
                        background: "#fff5f7",
                        borderRadius: "12px",
                        padding: "16px",
                        border: "1px solid #fce8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#c47b96",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          Monto Total Liquidado
                        </span>
                        <CheckCheck className="w-4 h-4 text-[#c47b96]" />
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: 800,
                          color: "#1f2937",
                          lineHeight: 1,
                        }}
                      >
                        {formatCurrency(selectedPedido.total)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Info */}
                {selectedPedido.motivoAnulacion && (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <p
                      style={{
                        color: "#b91c1c",
                        fontSize: "11px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Motivo de Anulación
                    </p>
                    <p
                      style={{
                        color: "#dc2626",
                        fontSize: "13px",
                        fontStyle: "italic",
                        lineHeight: 1.4,
                      }}
                    >
                      "{selectedPedido.motivoAnulacion}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-4 border-t border-gray-100 bg-white">
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

      {/* Comprobante Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-white border border-gray-100 max-w-3xl rounded-2xl p-0 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
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
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Verificación de Comprobante
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Evidencia fotográfica adjunta
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex justify-center bg-gray-50 border-t border-b border-gray-100">
            <img
              src={previewImageUrl}
              alt="Comprobante de pago"
              className="max-w-full h-auto max-h-[60vh] rounded-lg shadow-sm object-contain"
            />
          </div>

          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 bg-white">
            <Button
              onClick={() => setIsPreviewOpen(false)}
              className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
              style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
            >
              Cerrar Vista
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog
        open={isPaymentConfirmOpen}
        onOpenChange={setIsPaymentConfirmOpen}
      >
        <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl p-0 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
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
                <CheckCircle2
                  className="w-5 h-5"
                  style={{ color: "#ef4444" }}
                />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Confirmar Pago Manual
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  ORDEN #{pedidoToConfirm?.id?.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPaymentConfirmOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-red-50 rounded-xl p-5 border border-red-100 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm font-medium mb-1">
                  ¿Estás seguro que revisaste bien si se pagó este pedido?
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Esta acción es irreversible para el historial contable y
                  afecta los reportes financieros.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsPaymentConfirmOpen(false)}
              disabled={isConfirmingPayment}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmPaymentToggle}
              disabled={isConfirmingPayment}
              className="rounded-lg text-white font-semibold px-6 h-10 text-sm border-0"
              style={{ background: "#ef4444" }}
            >
              {isConfirmingPayment ? "Procesando..." : "Sí, confirmar pago"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Shipping Info Dialog - Premium & Minimalist */}
      {/* Shipping Info Dialog */}
      <Dialog
        open={isShippingDialogOpen}
        onOpenChange={setIsShippingDialogOpen}
      >
        <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl p-0 shadow-2xl">
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
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
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                  Información de Envío
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  ORDEN #
                  {selectedPedido?.id?.slice(0, 8)?.toUpperCase() || "..."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsShippingDialogOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 bg-white">
            {/* Transportadora */}
            <div className="space-y-3">
              <Label className="text-gray-700 text-xs uppercase tracking-wider font-semibold">
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
                    onClick={() =>
                      setShippingFormData((prev) => ({
                        ...prev,
                        transportadora: carrier,
                      }))
                    }
                    className="relative flex items-center justify-center p-3 rounded-xl border transition-all duration-200"
                    style={{
                      background:
                        shippingFormData.transportadora === carrier
                          ? "#fff0f5"
                          : "#f9fafb",
                      borderColor:
                        shippingFormData.transportadora === carrier
                          ? "#c47b96"
                          : "#f3f4f6",
                    }}
                  >
                    <span
                      className="text-sm font-semibold tracking-tight transition-colors"
                      style={{
                        color:
                          shippingFormData.transportadora === carrier
                            ? "#c47b96"
                            : "#6b7280",
                      }}
                    >
                      {carrier}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Número de Guía */}
            <div className="space-y-3">
              <Label className="text-gray-700 text-xs uppercase tracking-wider font-semibold">
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
                className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 focus:ring-[#c47b96]/20 focus:border-[#c47b96]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Fecha de Envío */}
              <div className="space-y-3">
                <Label className="text-gray-700 text-xs uppercase tracking-wider font-semibold">
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
                  className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 focus:ring-[#c47b96]/20 focus:border-[#c47b96] [color-scheme:light]"
                />
              </div>

              {/* Fecha Estimada */}
              <div className="space-y-3">
                <Label className="text-gray-700 text-xs uppercase tracking-wider font-semibold">
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
                  className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 focus:ring-[#c47b96]/20 focus:border-[#c47b96]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100 bg-white">
            <Button
              variant="outline"
              onClick={() => setIsShippingDialogOpen(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmShipping}
              disabled={isSaving}
              className="rounded-lg font-semibold px-6 h-10 text-sm border-0"
              style={{ backgroundColor: "#c47b96", color: "#ffffff" }}
            >
              {isSaving ? "Procesando..." : "Confirmar Envío"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
