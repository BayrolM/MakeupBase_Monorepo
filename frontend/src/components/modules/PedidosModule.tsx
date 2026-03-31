import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { useStore, OrderStatus, Cliente, Producto, Status } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Plus, Edit, Eye, Search, FileText, Trash2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';
import { CONFIG } from '../../lib/constants';

export function PedidosModule() {
  const { pedidos, clientes, productos, setPedidos, setClientes, setProductos } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pendiente');
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    refreshPedidos();
    refreshDependencies();
  }, []);

  const refreshDependencies = async () => {
    try {
      const uRes = await userService.getAll({ id_rol: 2, limit: 100 });
      const mappedClientes: Cliente[] = uRes.data.map((u: any) => ({
        id: u.id_usuario.toString(),
        nombre: `${u.nombres || u.nombre || ''} ${u.apellidos || u.apellido || ''}`.trim() || 'Sin Nombre',
        nombres: u.nombres || u.nombre || '',
        apellidos: u.apellidos || u.apellido || '',
        email: u.email,
        telefono: u.telefono || '',
        documento: u.documento || '',
        numeroDocumento: u.documento || '',
        estado: (u.estado ? 'activo' : 'inactivo') as Status,
        totalCompras: Number(u.total_ventas) || 0,
        fechaRegistro: u.fecha_registro || new Date().toISOString()
      }));
      setClientes(mappedClientes);

      const pRes = await productService.getAll({ limit: 100 });
      const mappedProductos: Producto[] = pRes.data.map((p: any) => ({
        id: p.id_producto.toString(),
        sku: p.sku || '',
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        categoriaId: p.id_categoria?.toString() || '1',
        marca: p.marca || '',
        precioCompra: Number(p.precio_compra) || 0,
        precioVenta: Number(p.precio_venta) || 0,
        stock: Number(p.stock_actual) || 0,
        stockMinimo: Number(p.stock_min) || 0,
        stockMaximo: Number(p.stock_max) || 100,
        imagenUrl: p.imagen_url || '',
        estado: (p.estado ? 'activo' : 'inactivo') as Status,
        fechaCreacion: p.fecha_creacion || new Date().toISOString()
      }));
      setProductos(mappedProductos);
    } catch (error) {
      console.error('Error loading dependencies', error);
      toast.error('Error al cargar dependencias');
    }
  };

  const refreshPedidos = async () => {
    try {
      const response = await orderService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery
      });
      
      setTotalItems(response.total || 0);
      const dbOrders = response.data || [];
      
      const mappedOrders = dbOrders.map((o: any) => ({
        id: o.id_pedido.toString(),
        clienteId: o.id_usuario_cliente ? o.id_usuario_cliente.toString() : 'N/A',
        clienteNombre: o.nombre_usuario || 'Sin Nombre',
        fecha: (o.fecha_pedido && typeof o.fecha_pedido === 'string') ? o.fecha_pedido.split('T')[0] : 'N/A',
        productos: [], 
        subtotal: o.total ? Math.round(Number(o.total) / (1 + CONFIG.IVA)) : 0, 
        iva: o.total ? Math.round(Number(o.total) - Math.round(Number(o.total) / (1 + CONFIG.IVA))) : 0, 
        costoEnvio: CONFIG.COSTO_ENVIO,
        total: Number(o.total),
        estado: o.estado as OrderStatus,
        direccionEnvio: o.direccion || 'N/A',
      }));
      setPedidos(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders', error);
      toast.error('Ocurrió un error cargando los pedidos desde la DB');
    }
  };

  useEffect(() => {
    refreshPedidos();
  }, [currentPage, itemsPerPage, searchQuery]);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    direccionEnvio: '',
    productos: [{ productoId: '', cantidad: 1, precioUnitario: 0 }],
  });

  const handleOpenDialog = () => {
    setFormData({
      clienteId: clientes[0]?.id || '',
      direccionEnvio: '',
      productos: [{ productoId: productos[0]?.id || '', cantidad: 1, precioUnitario: productos[0]?.precioVenta || 0 }],
    });
    setIsDialogOpen(true);
  };

  const addProductLine = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { productoId: productos[0]?.id || '', cantidad: 1, precioUnitario: productos[0]?.precioVenta || 0 }],
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
    if (field === 'productoId') {
      const producto = productos.find(p => p.id === value);
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
        toast.error('Debe seleccionar un cliente.');
        setIsSaving(false);
        return;
      }
      if (formData.productos.length === 0 || !formData.productos[0].productoId) {
        toast.error('Debes agregar al menos un producto válido.');
        setIsSaving(false);
        return;
      }

      // Format payload for endpoint
      const payload = {
        id_cliente: Number(formData.clienteId),
        direccion: formData.direccionEnvio || 'N/A',
        ciudad: 'Bello', // default city just in case
        metodo_pago: 'efectivo',
        items: formData.productos.map(p => ({
          id_producto: Number(p.productoId),
          cantidad: p.cantidad
        }))
      };

      await orderService.createDirect(payload);
      toast.success('Pedido creado en la Base de Datos exitosamente.');
      await refreshPedidos();
      await refreshDependencies(); // Para refrescar los stocks
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating order', error);
      toast.error(error.message || 'Ocurrió un error al crear el pedido.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenStatusDialog = (pedido: any) => {
    setSelectedPedido(pedido);
    setNewStatus(pedido.estado);
    setMotivoAnulacion('');
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
        }))
      });
      setDetailDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Error obteniendo el detalle completo del pedido');
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
          precioUnitario: i.precio_unitario || 0,
        }))
      };

      const doc = new jsPDF() as any;
      const cliente = clientes.find((c: Cliente) => c.id === orderData.clienteId);
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(255, 105, 180); // Color rosa
      doc.text('GLAMOUR ML', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('NIT: 900.XXX.XXX-X | Medellín, Colombia', 105, 28, { align: 'center' });
      
      doc.setDrawColor(200);
      doc.line(20, 35, 190, 35);
      
      // Pedido Info
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('COMPROBANTE DE PEDIDO', 20, 45);
      doc.setFontSize(10);
      doc.text(`No. PEDIDO: ${orderData.id}`, 20, 52);
      doc.text(`FECHA: ${orderData.fecha}`, 20, 57);
      doc.text(`ESTADO: ${orderData.estado.toUpperCase()}`, 20, 62);
      
      // Cliente Info
      doc.setFontSize(12);
      doc.text('DATOS DEL CLIENTE', 120, 45);
      doc.setFontSize(10);
      doc.text(`NOMBRE: ${(orderData as any).clienteNombre || cliente?.nombre || 'N/A'}`, 120, 52);
      doc.text(`DIRECCIÓN: ${orderData.direccionEnvio}`, 120, 57);
      doc.text(`TEL: ${cliente?.telefono || 'N/A'}`, 120, 62);
      
      // Header de la tabla de productos
      doc.setFillColor(255, 105, 180);
      doc.rect(20, 70, 170, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('PRODUCTO', 22, 75.5);
      doc.text('CANT.', 100, 75.5);
      doc.text('PRECIO', 130, 75.5);
      doc.text('SUBTOTAL', 160, 75.5);
      
      doc.setTextColor(0);
      let listY = 85;

      const safeCurrency = (val: any) => {
        if (typeof val !== 'number' || isNaN(val)) return formatCurrency(0);
        return formatCurrency(val);
      };

      // Fila de productos
      (orderData.productos || []).forEach((p: any) => {
        const prod = productos.find((pr: Producto) => pr.id === p.productoId);
        const prodName = doc.splitTextToSize(prod?.nombre || 'Producto Desconocido', 70);
        
        doc.text(prodName, 22, listY);
        doc.text(String(p.cantidad || 0), 100, listY);
        doc.text(safeCurrency(p.precioUnitario), 130, listY);
        doc.text(safeCurrency((p.cantidad || 0) * (p.precioUnitario || 0)), 160, listY);
        
        listY += (prodName.length * 5) + 3;
      });
      
      // Totales
      const finalY = listY + 10;
      doc.text(`TOTAL: ${safeCurrency(orderData.total)}`, 140, finalY);
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Este documento es un comprobante de pedido.', 105, 280, { align: 'center' });
      
      doc.save(`pedido_${orderData.id}.pdf`);
      toast.success('El PDF ha sido generado y la descarga ha iniciado');
    } catch (error: any) {
      console.error('Error generando PDF:', error);
      toast.error('Ocurrió un error al intentar generar el PDF');
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === 'cancelado' && !motivoAnulacion) {
      toast.error('Debe especificar un motivo de cancelación');
      return;
    }

    try {
      await orderService.updateStatus(Number(selectedPedido.id), newStatus, motivoAnulacion);
      toast.success('Estado actualizado correctamente');
      await refreshPedidos();
      await refreshDependencies(); // <--- Refresh stock if cancelled
      setIsStatusDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al actualizar el estado del pedido');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, { bg: string; text: string; label: string }> = {
      'pendiente': { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Pendiente' },
      'preparado': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Preparado' },
      'procesando': { bg: 'bg-indigo-500/10', text: 'text-indigo-600', label: 'Procesando' },
      'enviado': { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'Enviado' },
      'entregado': { bg: 'bg-success/10', text: 'text-success', label: 'Entregado' },
      'cancelado': { bg: 'bg-danger/10', text: 'text-danger', label: 'Cancelado' },
      'carrito': { bg: 'bg-gray-500/10', text: 'text-gray-600', label: 'Carrito' },
    };
    return colors[status] || colors['pendiente'];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
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
    return ['pendiente', 'preparado', 'enviado', 'entregado', 'cancelado'];
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Pedidos"
        subtitle="Gestión de pedidos y seguimiento"
        actionButton={{
          label: 'Nuevo Pedido',
          icon: Plus,
          onClick: handleOpenDialog,
        }}
      />

      <div className="p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-input-background border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Buscar pedidos por ID, cliente o estado..."
                />
              </div>
            </div>
            <div>
              <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                Mostrando {pedidos.length} de {totalItems} pedidos
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground-secondary">ID</TableHead>
                <TableHead className="text-foreground-secondary">Cliente</TableHead>
                <TableHead className="text-foreground-secondary">Fecha</TableHead>
                <TableHead className="text-foreground-secondary">Total</TableHead>
                <TableHead className="text-foreground-secondary">Dirección</TableHead>
                <TableHead className="text-foreground-secondary">Estado</TableHead>
                <TableHead className="text-foreground-secondary text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-foreground-secondary">
                      {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay pedidos'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                pedidos.map((pedido) => {
                return (
                  <TableRow key={pedido.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-foreground-secondary">{pedido.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-foreground">{(pedido as any).clienteNombre || 'Sin Nombre'}</TableCell>
                    <TableCell className="text-foreground-secondary">{pedido.fecha}</TableCell>
                    <TableCell className="text-foreground">{formatCurrency(pedido.total)}</TableCell>
                    <TableCell className="text-foreground-secondary max-w-[200px] truncate">{pedido.direccionEnvio}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full ${getStatusColor(pedido.estado).bg}`}>
                          <span className={`${getStatusColor(pedido.estado).text}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                            {getStatusColor(pedido.estado).label}
                          </span>
                        </div>
                        {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenStatusDialog(pedido)}
                            className="h-7 w-7 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                            title="Cambiar estado"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewPDF(pedido)}
                          className="h-8 w-8 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                          title="Ver PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetail(pedido)}
                          className="h-8 w-8 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                          title="Ver Detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }))}
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
                <Select value={formData.clienteId} onValueChange={(value: string) => setFormData({ ...formData, clienteId: value })}>
                  <SelectTrigger className="bg-input-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {clientes.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-foreground">{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Dirección de Envío</Label>
                <Input
                  value={formData.direccionEnvio}
                  onChange={(e) => setFormData({ ...formData, direccionEnvio: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Calle 50 #30-20"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Productos</Label>
                <Button size="sm" onClick={addProductLine} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-1" /> Agregar
                </Button>
              </div>

              {formData.productos.map((prod, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-surface rounded-lg">
                  <div className="col-span-6 space-y-1">
                    <Label className="text-foreground-secondary" style={{ fontSize: '12px' }}>Producto</Label>
                    <Select value={prod.productoId} onValueChange={(value: string) => updateProductLine(index, 'productoId', value)}>
                      <SelectTrigger className="bg-input-background border-border text-foreground h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {productos.filter(p => p.estado === 'activo').map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-foreground">
                            {p.nombre} (Stock: {p.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-foreground-secondary" style={{ fontSize: '12px' }}>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={isNaN(prod.cantidad) ? '' : prod.cantidad}
                      onChange={(e) => {
                        const val = e.target.value === '' ? NaN : parseInt(e.target.value);
                        updateProductLine(index, 'cantidad', val);
                      }}
                      className="bg-input-background border-border text-foreground h-9"
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-foreground-secondary" style={{ fontSize: '12px' }}>Precio</Label>
                    <Input
                      type="number"
                      value={isNaN(prod.precioUnitario) ? '' : prod.precioUnitario}
                      onChange={(e) => {
                        const val = e.target.value === '' ? NaN : parseFloat(e.target.value);
                        updateProductLine(index, 'precioUnitario', val);
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
                  <span className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>Total:</span>
                  <span className="text-primary" style={{ fontSize: '20px', fontWeight: 600 }}>
                    {formatCurrency(formData.productos.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border text-foreground hover:bg-surface">
              Cancelar
            </Button>
            <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isSaving ? 'Creando...' : 'Crear Pedido'}
      </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Actualizar Estado del Pedido</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedPedido && (
              <div className="bg-surface p-3 rounded-lg border border-border">
                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Estado Actual</p>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full mt-1 ${getStatusColor(selectedPedido.estado).bg}`}>
                  <span className={`${getStatusColor(selectedPedido.estado).text}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                    {getStatusColor(selectedPedido.estado).label}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-foreground">Nuevo Estado</Label>
              <Select value={newStatus} onValueChange={(value: OrderStatus) => setNewStatus(value)}>
                <SelectTrigger className="bg-input-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {getAllStatuses().map(status => {
                    const statusInfo = getStatusColor(status);
                    return (
                      <SelectItem 
                        key={status} 
                        value={status} 
                        className="text-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${statusInfo.bg.replace('/10', '')}`}></div>
                          <span>{statusInfo.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'cancelado' && (
              <div className="space-y-2">
                <Label className="text-foreground">Motivo de Anulación *</Label>
                <Textarea
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Especifique el motivo de la anulación"
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} className="border-border text-foreground hover:bg-surface">
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Actualizar Estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalle del Pedido</DialogTitle>
          </DialogHeader>
          
          {selectedPedido && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>ID del Pedido</p>
                  <p className="text-foreground">{selectedPedido.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Estado</p>
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full ${getStatusColor(selectedPedido.estado).bg}`}>
                    <span className={`${getStatusColor(selectedPedido.estado).text}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                      {getStatusColor(selectedPedido.estado).label}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Cliente</p>
                  <p className="text-foreground">{clientes.find(c => c.id === selectedPedido.clienteId)?.nombre || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Fecha</p>
                  <p className="text-foreground">{selectedPedido.fecha}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Dirección de Envío</p>
                  <p className="text-foreground">{selectedPedido.direccionEnvio}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Total</p>
                  <p className="text-primary" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {formatCurrency(selectedPedido.total)}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-foreground mb-3" style={{ fontWeight: 500 }}>Productos del Pedido</p>
                <div className="space-y-2">
                  {selectedPedido.productos.map((p: any, i: number) => {
                    const producto = productos.find(prod => prod.id === p.productoId);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-card rounded flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                            {producto?.imagenUrl ? (
                              <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-primary" style={{ fontSize: '10px' }}>
                                {producto?.sku || 'N/A'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-foreground" style={{ fontWeight: 500 }}>{producto?.nombre || 'Producto no encontrado'}</p>
                            <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                              Cantidad: {p.cantidad} × {formatCurrency(p.precioUnitario)}
                            </p>
                          </div>
                        </div>
                        <p className="text-foreground" style={{ fontWeight: 600 }}>
                          {formatCurrency(p.cantidad * p.precioUnitario)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-foreground mb-3" style={{ fontWeight: 500 }}>Resumen del Pedido</p>
                <div className="bg-surface rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Subtotal:</span>
                    <span className="text-foreground">{formatCurrency(selectedPedido.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">IVA ({CONFIG.IVA * 100}%):</span>
                    <span className="text-foreground">{formatCurrency(selectedPedido.iva)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Costo de Envío:</span>
                    <span className="text-foreground">{formatCurrency(selectedPedido.costoEnvio)}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>Total a Pagar:</span>
                      <span className="text-primary" style={{ fontSize: '20px', fontWeight: 700 }}>
                        {formatCurrency(selectedPedido.total)}
                      </span>
                    </div>
                  </div>
                  {selectedPedido.estado === 'cancelado' && (
                    <div className="pt-2">
                      <p className="text-foreground-secondary text-center" style={{ fontSize: '12px', opacity: 0.7 }}>
                        Transacción anulada
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedPedido.motivoAnulacion && (
                <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
                  <p className="text-danger" style={{ fontSize: '12px', fontWeight: 600 }}>Motivo de Anulación</p>
                  <p className="text-foreground mt-1">{selectedPedido.motivoAnulacion}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDetailDialogOpen(false)} 
              className="border-border text-foreground hover:bg-surface"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}