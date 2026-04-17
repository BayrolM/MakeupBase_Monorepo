import { useState, useEffect } from "react";
import { 
  useStore, 
  OrderStatus, 
  Cliente, 
  Producto, 
  Status 
} from "../../lib/store";
import { toast } from "sonner";
import { generateOrderPDF } from "../../lib/pdfGenerator";
import { orderService } from "../../services/orderService";
import { userService } from "../../services/userService";
import { productService } from "../../services/productService";
import { CONFIG } from "../../lib/constants";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../Pagination";

// Sub-componentes
import { PedidoHeader } from "./pedidos/PedidoHeader";
import { PedidoTable } from "./pedidos/PedidoTable";
import { PedidoFormDialog } from "./pedidos/PedidoFormDialog";
import { PedidoEditDialog } from "./pedidos/PedidoEditDialog";
import { PedidoStatusDialog } from "./pedidos/PedidoStatusDialog";
import { PedidoDetailDialog } from "./pedidos/PedidoDetailDialog";
import { PedidoShippingDialog } from "./pedidos/PedidoShippingDialog";
import { PedidoPaymentConfirmDialog } from "./pedidos/PedidoPaymentConfirmDialog";
import { PedidoPreviewDialog } from "./pedidos/PedidoPreviewDialog";

// Utils
import { getTrackingUrl } from "../../utils/pedidoUtils";

export function PedidosModule() {
  const { pedidos, clientes, productos, setPedidos, setClientes, setProductos } = useStore();
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Data States
  const [editingPedido, setEditingPedido] = useState<any>(null);
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [pedidoToConfirm, setPedidoToConfirm] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pendiente");
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleLimitChange,
  } = usePagination({ totalItems });

  // Form States
  const [formData, setFormData] = useState({
    clienteId: "",
    direccionEnvio: "",
    productos: [{ productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 }],
  });
  const [editFormData, setEditFormData] = useState({
    clienteId: "",
    direccionEnvio: "",
    productos: [] as { productoId: string; cantidad: number; precioUnitario: number; maxStock: number }[],
  });
  const [shippingFormData, setShippingFormData] = useState({
    transportadora: "Servientrega",
    numero_guia: "",
    fecha_envio: new Date().toISOString().split("T")[0],
    fecha_estimada: "",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    refreshDependencies();
  }, []);

  useEffect(() => {
    refreshPedidos();
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  const refreshDependencies = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        userService.getAll({ id_rol: 2, limit: 100 }),
        productService.getAll({ limit: 100 })
      ]);
      
      const mappedClientes: Cliente[] = (uRes.data || []).map((u: any) => ({
        id: u.id_usuario.toString(),
        nombre: `${u.nombres || ""} ${u.apellidos || ""}`.trim() || "Sin Nombre",
        nombres: u.nombres || "",
        apellidos: u.apellidos || "",
        email: u.email || "",
        telefono: u.telefono || "",
        documento: u.documento || "",
        numeroDocumento: u.documento || "",
        estado: (u.estado ? "activo" : "inactivo") as Status,
        totalCompras: Number(u.total_ventas) || 0,
        fechaRegistro: u.fecha_registro || new Date().toISOString(),
      }));
      setClientes(mappedClientes);

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
      toast.error("Error al cargar dependencias");
    }
  };

  const refreshPedidos = async () => {
    try {
      const ESTADOS_VALIDOS = ['pendiente', 'preparado', 'procesando', 'enviado', 'entregado', 'cancelado'];
      const qLower = debouncedSearchQuery.toLowerCase().trim();
      const esEstado = ESTADOS_VALIDOS.includes(qLower);

      const response = await orderService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: esEstado ? undefined : debouncedSearchQuery || undefined,
        estado: esEstado ? qLower : undefined,
      });

      setTotalItems(response.total || 0);
      const mappedOrders = (response.data || []).map((o: any) => ({
        id: o.id_pedido.toString(),
        clienteId: o.id_usuario_cliente?.toString() || "N/A",
        clienteNombre: o.nombre_usuario || "Sin Nombre",
        fecha: o.fecha_pedido ? o.fecha_pedido.split("T")[0] : "N/A",
        productos: [],
        subtotal: o.total ? Math.round(Number(o.total) / (1 + CONFIG.IVA)) : 0,
        iva: o.total ? Math.round(Number(o.total) - Math.round(Number(o.total) / (1 + CONFIG.IVA))) : 0,
        costoEnvio: CONFIG.COSTO_ENVIO,
        total: Number(o.total),
        estado: o.estado as OrderStatus,
        direccionEnvio: o.direccion || "N/A",
        pago_confirmado: !!o.pago_confirmado,
        comprobante_url: o.comprobante_url || "",
      }));
      setPedidos(mappedOrders);
    } catch (error) {
      toast.error("Error cargando pedidos");
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      clienteId: "",
      direccionEnvio: "",
      productos: [{ productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 }],
    });
    setIsDialogOpen(true);
  };

  const updateProductLine = (isEdit: boolean, index: number, field: string, value: any, prodObj?: any) => {
    const currentData = isEdit ? editFormData : formData;
    const newProductos = [...currentData.productos];

    if (field === "productoId") {
      const existingIdx = newProductos.findIndex((p, i) => i !== index && p.productoId === value);
      if (existingIdx !== -1 && value) {
        toast.info("Producto ya agregado.");
        return;
      }
      newProductos[index] = {
        ...newProductos[index],
        productoId: value,
        precioUnitario: prodObj?.precioVenta || 0,
        maxStock: prodObj?.stock || 0,
        cantidad: 1,
      };
    } else if (field === "cantidad") {
      const ms = newProductos[index].maxStock || 0;
      const parsed = parseInt(value) || 1;
      newProductos[index].cantidad = ms > 0 ? Math.min(parsed, ms) : parsed;
    }

    if (isEdit) setEditFormData({ ...editFormData, productos: newProductos });
    else setFormData({ ...formData, productos: newProductos });
  };

  const handleSave = async () => {
    if (!formData.clienteId || !formData.direccionEnvio) {
      toast.error("Cliente y dirección son obligatorios");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        id_cliente: Number(formData.clienteId),
        direccion: formData.direccionEnvio,
        ciudad: "Bogotá", // Valor predeterminado
        metodo_pago: "Transferencia", // Valor predeterminado para pedidos directos
        items: formData.productos.map(p => ({ id_producto: Number(p.productoId), cantidad: p.cantidad })),
      };
      await orderService.createDirect(payload);
      toast.success("Pedido creado");
      refreshPedidos();
      setIsDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Error al crear");
    } finally { setIsSaving(false); }
  };

  const handleOpenEdit = async (pedido: any) => {
    try {
      const fullOrder = await orderService.getById(Number(pedido.id));
      setEditingPedido(pedido);
      setEditFormData({
        clienteId: pedido.clienteId,
        direccionEnvio: pedido.direccionEnvio,
        productos: (fullOrder.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(),
          cantidad: Number(i.cantidad),
          precioUnitario: Number(i.precio_unitario) || 0,
          maxStock: productos.find(p => p.id === i.id_producto.toString())?.stock || 0,
        })),
      });
      setIsEditDialogOpen(true);
    } catch { toast.error("Error al cargar"); }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const payload: any = { direccion: editFormData.direccionEnvio.trim() };
      if (editingPedido.estado === 'pendiente') {
        payload.id_cliente = Number(editFormData.clienteId);
        payload.items = editFormData.productos.map(p => ({ id_producto: Number(p.productoId), cantidad: p.cantidad }));
      }
      await orderService.update(Number(editingPedido.id), payload);
      toast.success("Actualizado");
      refreshPedidos();
      setIsEditDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setIsSaving(false); }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === "cancelado" && !motivoAnulacion) {
      toast.error("Motivo requerido");
      return;
    }
    if (newStatus === "enviado") {
      setIsStatusDialogOpen(false);
      setIsShippingDialogOpen(true);
      return;
    }
    setIsSaving(true);
    try {
      await orderService.updateStatus(Number(selectedPedido.id), newStatus, motivoAnulacion);
      toast.success("Estado actualizado");
      refreshPedidos();
      setIsStatusDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setIsSaving(false); }
  };

  const handleConfirmShipping = async () => {
    setIsSaving(true);
    try {
      const tracking_link = getTrackingUrl(shippingFormData.transportadora, shippingFormData.numero_guia);
      await orderService.updateStatus(Number(selectedPedido.id), "enviado", "", { ...shippingFormData, tracking_link });
      toast.success("Enviado");
      refreshPedidos();
      setIsShippingDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setIsSaving(false); }
  };

  const handleConfirmPayment = async () => {
    setIsSaving(true);
    try {
      const nuevoEstado = !pedidoToConfirm.pago_confirmado;
      await orderService.confirmPayment(Number(pedidoToConfirm.id), nuevoEstado);
      toast.success(nuevoEstado ? "Confirmado" : "Removido");
      refreshPedidos();
      setIsPaymentConfirmOpen(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setIsSaving(false); }
  };

  const handleViewPDF = async (pedido: any) => {
    try {
      const fullOrder = await orderService.getById(Number(pedido.id));
      const orderData = { 
        ...pedido, 
        productos: (fullOrder?.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(), 
          cantidad: i.cantidad, 
          precio_unitario: i.precio_unitario
        })) 
      };
      const cliente = clientes.find(c => c.id === pedido.clienteId);
      await generateOrderPDF(orderData, cliente, productos, CONFIG);
    } catch { toast.error("Error PDF"); }
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <PedidoHeader onOpenDialog={handleOpenDialog} />
      
      <div className="px-8 pb-8">
        <PedidoTable 
          pedidos={pedidos}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); handlePageChange(1); }}
          onViewDetail={async (p) => { 
            const f = await orderService.getById(Number(p.id)); 
            setSelectedPedido({
              ...p, 
              productos: (f?.items || []).map((i: any) => ({
                productoId: i.id_producto.toString(), 
                cantidad: i.cantidad, 
                precioUnitario: i.precio_unitario
              }))
            });
            setDetailDialogOpen(true); 
          }}
          onViewPDF={handleViewPDF}
          onEdit={handleOpenEdit}
          onStatusClick={(p) => { setSelectedPedido(p); setNewStatus(p.estado); setIsStatusDialogOpen(true); }}
          onConfirmPayment={(p) => { setPedidoToConfirm(p); setIsPaymentConfirmOpen(true); }}
          onViewComprobante={(url) => { setPreviewImageUrl(`http://localhost:3000${url}`); setIsPreviewOpen(true); }}
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

      <PedidoFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        onSave={handleSave}
        onAddProduct={() => setFormData({...formData, productos: [...formData.productos, {productoId:"", cantidad:1, precioUnitario:0, maxStock:0}]})}
        onRemoveProduct={(idx) => setFormData({...formData, productos: formData.productos.filter((_,i)=>i!==idx)})}
        onUpdateProduct={(idx, f, v, o) => updateProductLine(false, idx, f, v, o)}
      />

      <PedidoEditDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingPedido={editingPedido}
        formData={editFormData}
        setFormData={setEditFormData}
        isSaving={isSaving}
        onSave={handleSaveEdit}
        onAddProduct={() => setEditFormData({...editFormData, productos: [...editFormData.productos, {productoId:"", cantidad:1, precioUnitario:0, maxStock:0}]})}
        onRemoveProduct={(idx) => setEditFormData({...editFormData, productos: editFormData.productos.filter((_,i)=>i!==idx)})}
        onUpdateProduct={(idx, f, v, o) => updateProductLine(true, idx, f, v, o)}
      />

      <PedidoStatusDialog 
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        selectedPedido={selectedPedido}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        motivoAnulacion={motivoAnulacion}
        setMotivoAnulacion={setMotivoAnulacion}
        isSaving={isSaving}
        onUpdateStatus={handleUpdateStatus}
      />

      <PedidoDetailDialog 
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        selectedPedido={selectedPedido}
        productos={productos}
      />

      <PedidoShippingDialog 
        open={isShippingDialogOpen}
        onOpenChange={setIsShippingDialogOpen}
        shippingFormData={shippingFormData}
        setShippingFormData={setShippingFormData}
        isSaving={isSaving}
        onConfirm={handleConfirmShipping}
      />

      <PedidoPaymentConfirmDialog 
        open={isPaymentConfirmOpen}
        onOpenChange={setIsPaymentConfirmOpen}
        pedidoToConfirm={pedidoToConfirm}
        isSaving={isSaving}
        onConfirm={handleConfirmPayment}
      />

      <PedidoPreviewDialog 
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        imageUrl={previewImageUrl}
      />
    </div>
  );
}
