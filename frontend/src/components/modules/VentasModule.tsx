import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Plus, Eye, Trash2, FileText, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { saleService } from '../../services/saleService';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';
import { Cliente, Producto, Status } from '../../lib/store';
import { CONFIG } from '../../lib/constants';

export function VentasModule() {
  const { ventas, clientes, productos, setVentas, setClientes, setProductos } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAnnulDialogOpen, setIsAnnulDialogOpen] = useState(false);
  const [saleToAnnul, setSaleToAnnul] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    refreshVentas();
    refreshDependencies();
  }, []);

  const refreshDependencies = async () => {
    try {
      // Fetch clients (rol 2)
      const uRes = await userService.getAll({ id_rol: 2, limit: 100 });
      const mappedClientes: Cliente[] = uRes.data.map(u => {
        const nombres = u.nombres || u.nombre || '';
        const apellidos = u.apellidos || u.apellido || '';
        return {
          id: u.id_usuario.toString(),
          nombre: `${nombres} ${apellidos}`.trim() || 'Sin Nombre',
          nombres: nombres,
          apellidos: apellidos,
          email: u.email,
          telefono: u.telefono || '',
          documento: u.documento || '',
          numeroDocumento: u.documento || '',
          estado: (u.estado ? 'activo' : 'inactivo') as Status,
          totalCompras: Number(u.total_ventas) || 0,
          fechaRegistro: u.fecha_registro || new Date().toISOString()
        };
      });
      setClientes(mappedClientes);

      // Fetch products
      const pRes = await productService.getAll({ limit: 100 });
      const mappedProductos: Producto[] = pRes.data.map(p => ({
        id: p.id_producto.toString(),
        sku: p.sku,
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        categoriaId: p.id_categoria.toString(),
        marca: p.id_marca.toString(), // O el nombre si lo tienes
        precioCompra: Number(p.costo_promedio),
        precioVenta: Number(p.precio_venta),
        stock: p.stock_actual,
        stockMinimo: p.stock_min,
        stockMaximo: p.stock_max,
        imagenUrl: p.imagen_url || '',
        estado: p.estado ? 'activo' : 'inactivo',
        fechaCreacion: new Date().toISOString()
      }));
      setProductos(mappedProductos);
    } catch (e) {
      console.error('Error fetching dependencies:', e);
    }
  };

  const refreshVentas = async () => {
    try {
      const response = await saleService.getAll({ 
        page: currentPage, 
        limit: itemsPerPage,
        q: searchQuery 
      });
      
      const salesItems = response.items || [];
      setTotalItems(response.total || 0);
      
      const mapped = salesItems.map((v: any) => ({
        id: v.id_venta.toString(),
        clienteId: v.id_usuario_cliente?.toString() || '',
        clienteNombre: `${v.nombre_cliente || ''} ${v.apellido_cliente || ''}`.trim() || 'Sin Nombre',
        pedidoId: v.id_pedido?.toString() || '',
        fecha: new Date(v.fecha_venta).toLocaleDateString(),
        productos: (v.productos || []).map((p: any) => ({
          productoId: p.id_producto.toString(),
          cantidad: p.cantidad,
          precioUnitario: Number(p.precio_unitario)
        })),
        subtotal: Number(v.subtotal),
        iva: Number(v.iva),
        costoEnvio: 0,
        total: Number(v.total),
        estado: v.estado ? 'activo' as const : 'anulada' as const,
        metodoPago: (v.metodo_pago as any) || 'Efectivo',
      }));

      setVentas(mapped);
    } catch (e) {
      console.error('Error fetching ventas:', e);
      toast.error('Error al cargar ventas');
    }
  };

  useEffect(() => {
    refreshVentas();
  }, [currentPage, itemsPerPage, searchQuery]);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    pedidoId: '', 
    metodoPago: 'Efectivo' as 'Efectivo' | 'Transferencia',
    productos: [{ productoId: '', cantidad: 1, precioUnitario: 0 }],
  });

  const handleOpenDialog = () => {
    setFormData({
      clienteId: clientes[0]?.id || '',
      pedidoId: '', 
      metodoPago: 'Efectivo',
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
    const newProductos = formData.productos.filter((_, i) => i !== index);
    setFormData({ ...formData, productos: newProductos });
  };

  const updateProductLine = (index: number, field: string, value: any) => {
    const newProductos = [...formData.productos];
    const productoId = field === 'productoId' ? value : newProductos[index].productoId;
    const producto = productos.find(p => p.id === productoId);

    if (field === 'productoId') {
      newProductos[index] = {
        ...newProductos[index],
        productoId: value,
        precioUnitario: producto?.precioVenta || 0,
        cantidad: Math.min(newProductos[index].cantidad, producto?.stock || 0)
      };
    } else if (field === 'cantidad') {
      const cantidadValida = Math.max(1, Math.min(value, producto?.stock || 0));
      if (value > (producto?.stock || 0)) {
        toast.warning(`Stock limitado. Máximo disponible: ${producto?.stock || 0}`);
      }
      newProductos[index] = { ...newProductos[index], cantidad: cantidadValida };
    } else {
      newProductos[index] = { ...newProductos[index], [field]: value };
    }
    setFormData({ ...formData, productos: newProductos });
  };

  const handleSave = async () => {
    const clienteIdNum = Number(formData.clienteId);
    if (!formData.clienteId || isNaN(clienteIdNum)) {
      toast.error('Debe seleccionar un cliente válido');
      return;
    }

    // Validar que haya productos y que tengan ID válido
    const productosValidos = formData.productos.every(p => p.productoId && !isNaN(Number(p.productoId)));
    if (!productosValidos) {
      toast.error('Asegúrese de que todos los productos seleccionados sean válidos');
      return;
    }

    setIsSaving(true);
    try {
      const subtotal = formData.productos.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
      const iva = Math.round(subtotal * CONFIG.IVA);
      const total = subtotal + iva;

      const payload = {
        id_usuario_cliente: clienteIdNum,
        id_pedido: formData.pedidoId ? Number(formData.pedidoId) : null,
        metodo_pago: formData.metodoPago,
        productos: formData.productos,
        subtotal,
        iva,
        total
      };

      await saleService.create(payload);
      toast.success('Venta registrada con éxito');
      await refreshVentas();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar la venta');
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
      toast.success('Venta anulada correctamente');
      await refreshVentas();
      await refreshDependencies(); // Refresh stock
      setIsAnnulDialogOpen(false);
      setSaleToAnnul(null);
    } catch (error: any) {
      toast.error('Error al anular la venta');
    }
  };

  const handleDownloadPDF = (venta: any) => {
    try {
      const doc = new jsPDF() as any;
      const cliente = clientes.find((c: Cliente) => c.id === venta.clienteId);
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(255, 105, 180); // Color rosa
      doc.text('GLAMOUR ML', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('NIT: 900.XXX.XXX-X | Medellín, Colombia', 105, 28, { align: 'center' });
      
      doc.setDrawColor(200);
      doc.line(20, 35, 190, 35);
      
      // Factura Info
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('FACTURA DE VENTA', 20, 45);
      doc.setFontSize(10);
      doc.text(`No. FACTURA: ${venta.id}`, 20, 52);
      doc.text(`FECHA: ${venta.fecha}`, 20, 57);
      doc.text(`MÉTODO DE PAGO: ${venta.metodoPago || 'N/A'}`, 20, 62);
      
      // Cliente Info
      doc.setFontSize(12);
      doc.text('DATOS DEL CLIENTE', 120, 45);
      doc.setFontSize(10);
      doc.text(`NOMBRE: ${cliente?.nombre || 'N/A'}`, 120, 52);
      doc.text(`DOC: ${cliente?.documento || cliente?.numeroDocumento || 'N/A'}`, 120, 57);
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
      (venta.productos || []).forEach((p: any) => {
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
      doc.text(`SUBTOTAL: ${safeCurrency(venta.subtotal)}`, 140, finalY);
      doc.text(`IVA (19%): ${safeCurrency(venta.iva)}`, 140, finalY + 7);
      doc.setFontSize(14);
      doc.setTextColor(255, 105, 180);
      doc.text(`TOTAL: ${safeCurrency(venta.total)}`, 140, finalY + 15);
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('¡Gracias por su compra!', 105, 280, { align: 'center' });
      
      doc.save(`factura_${venta.id}.pdf`);
      toast.success('El PDF ha sido generado y la descarga ha iniciado');
    } catch (error: any) {
      console.error('Error generando PDF:', error);
      toast.error('Ocurrió un error al intentar generar el PDF');
    }
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

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Ventas"
        subtitle="Gestión de ventas"
        actionButton={{
          label: 'Nueva Venta',
          icon: Plus,
          onClick: handleOpenDialog,
        }}
      />

      <div className="p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
              <Input
                placeholder="Buscar por ID, cliente o estado..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-input-background border-border text-foreground"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground-secondary">ID</TableHead>
                <TableHead className="text-foreground-secondary">ID Pedido</TableHead>
                <TableHead className="text-foreground-secondary">Cliente</TableHead>
                <TableHead className="text-foreground-secondary">Fecha</TableHead>
                <TableHead className="text-foreground-secondary">Total</TableHead>
                <TableHead className="text-foreground-secondary">Método Pago</TableHead>
                <TableHead className="text-foreground-secondary">Estado</TableHead>
                <TableHead className="text-foreground-secondary text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <p className="text-foreground-secondary">
                      {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay ventas'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                ventas.map((venta) => {
                  const isAnulada = venta.estado === 'anulada';
                  return (
                    <TableRow key={venta.id} className="border-border hover:bg-surface/50">
                      <TableCell className="text-foreground-secondary">{venta.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-foreground-secondary" style={{ fontSize: '12px' }}>{venta.pedidoId ? `#${venta.pedidoId}` : '- Venta Directa -'}</TableCell>
                      <TableCell className="text-foreground">{(venta as any).clienteNombre || 'Sin Nombre'}</TableCell>
                      <TableCell className="text-foreground-secondary">{venta.fecha}</TableCell>
                      <TableCell className="text-foreground">{formatCurrency(venta.total)}</TableCell>
                      <TableCell className="text-foreground-secondary">{venta.metodoPago}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${
                          venta.estado === 'activo' 
                            ? 'bg-success/10 text-success border border-success/30' 
                            : 'bg-danger/10 text-danger border border-danger/30'
                        }`} style={{ fontSize: '12px', fontWeight: 500 }}>
                          {venta.estado === 'activo' ? 'Activa' : 'Anulada'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadPDF(venta)}
                            className="h-8 w-8 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                            title="Descargar PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetail(venta)}
                            className="h-8 w-8 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                            title="Ver Detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!isAnulada && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSaleToAnnul(venta.id);
                                setIsAnnulDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 text-danger hover:text-danger/80 hover:bg-danger/10"
                              title="Anular Venta"
                            >
                              <X className="w-4 h-4" />
                            </Button>
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
        {totalItems > 0 && (
          <div className="mt-4 text-right">
            <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
              Mostrando {ventas.length} de {totalItems} ventas
            </p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nueva Venta</DialogTitle>
            <DialogDescription className="sr-only">Formulario para crear una nueva venta</DialogDescription>
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
                <Label className="text-foreground">Método de Pago</Label>
                                <Select value={formData.metodoPago} onValueChange={(value: 'Efectivo' | 'Transferencia') => setFormData({ ...formData, metodoPago: value })}>
                  <SelectTrigger className="bg-input-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Efectivo" className="text-foreground">Efectivo</SelectItem>
                    <SelectItem value="Transferencia" className="text-foreground">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
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
                  <div className="col-span-5 space-y-1">
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
                  <div className="col-span-2 space-y-1">
                    <Label className="text-foreground-secondary" style={{ fontSize: '12px' }}>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={prod.cantidad}
                      onChange={(e) => updateProductLine(index, 'cantidad', parseInt(e.target.value))}
                      className="bg-input-background border-border text-foreground h-9"
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-foreground-secondary" style={{ fontSize: '12px' }}>Precio</Label>
                    <Input
                      type="number"
                      value={prod.precioUnitario}
                      onChange={(e) => updateProductLine(index, 'precioUnitario', parseFloat(e.target.value))}
                      className="bg-input-background border-border text-foreground h-9"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-foreground-secondary" style={{ fontSize: '12px' }}>Total</Label>
                    <div className="h-9 px-3 bg-input-background/50 border border-border rounded-lg flex items-center">
                      <span className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                        {formatCurrency(prod.cantidad * prod.precioUnitario)}
                      </span>
                    </div>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border text-foreground hover:bg-surface" disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Confirmar Venta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalle de Venta</DialogTitle>
            <DialogDescription className="sr-only">Información completa de la venta seleccionada</DialogDescription>
          </DialogHeader>
          
          {selectedVenta && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>ID de Venta</p>
                  <p className="text-foreground">{selectedVenta.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>ID de Pedido</p>
                  <p className="text-foreground">{selectedVenta.pedidoId ? `#${selectedVenta.pedidoId}` : 'Venta Directa'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Estado</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${
                      selectedVenta.estado === 'activo' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-danger/10 text-danger'
                    }`} style={{ fontSize: '12px', fontWeight: 500 }}>
                      {selectedVenta.estado === 'activo' ? 'Activa' : 'Anulada'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Cliente</p>
                  <p className="text-foreground">{clientes.find(c => c.id === selectedVenta.clienteId)?.nombre || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Fecha</p>
                  <p className="text-foreground">{selectedVenta.fecha}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Método de Pago</p>
                  <p className="text-foreground">{selectedVenta.metodoPago}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Total</p>
                  <p className="text-primary" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {formatCurrency(selectedVenta.total)}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-foreground mb-3" style={{ fontWeight: 500 }}>Productos Vendidos</p>
                <div className="space-y-2">
                  {selectedVenta.productos.map((p: any, i: number) => {
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
                <p className="text-foreground mb-3" style={{ fontWeight: 500 }}>Resumen de la Transacción</p>
                <div className="bg-surface rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Subtotal:</span>
                    <span className="text-foreground">{formatCurrency(selectedVenta.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">IVA (19%):</span>
                    <span className="text-foreground">{formatCurrency(selectedVenta.iva)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Costo de Envío:</span>
                    <span className="text-foreground">{formatCurrency(selectedVenta.costoEnvio)}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>Total a Pagar:</span>
                      <span className="text-primary" style={{ fontSize: '20px', fontWeight: 700 }}>
                        {formatCurrency(selectedVenta.total)}
                      </span>
                    </div>
                  </div>
                  {selectedVenta.estado === 'anulada' && (
                    <div className="pt-2">
                      <p className="text-foreground-secondary text-center" style={{ fontSize: '12px', opacity: 0.7 }}>
                        Transacción anulada
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedVenta.motivoAnulacion && (
                <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
                  <p className="text-danger" style={{ fontSize: '12px', fontWeight: 600 }}>Motivo de Anulación</p>
                  <p className="text-foreground mt-1">{selectedVenta.motivoAnulacion}</p>
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

      {/* Annul Confirmation Dialog */}
      <Dialog open={isAnnulDialogOpen} onOpenChange={setIsAnnulDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Anular Venta</DialogTitle>
            <DialogDescription className="text-foreground-secondary">
              ¿Estás seguro que deseas anular esta venta? Esta acción devolverá el stock a los productos y marcará la venta como anulada permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsAnnulDialogOpen(false)}
              className="border-border text-foreground hover:bg-surface"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleAnularVenta}
              className="bg-danger hover:bg-danger/90 text-white"
            >
              Confirmar Anulación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}