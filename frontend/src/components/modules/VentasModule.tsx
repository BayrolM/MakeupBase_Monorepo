import { useState } from 'react';
import { useStore } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { StatusBadge } from '../StatusBadge';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Plus, Eye, Trash2, FileText, Search, X } from 'lucide-react';

export function VentasModule() {
  const { ventas, clientes, productos, pedidos, addVenta, updateStock, updateVenta } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    pedidoId: '', // Opcional - si viene de un pedido
    metodoPago: 'Efectivo' as 'Efectivo' | 'Transferencia',
    productos: [{ productoId: '', cantidad: 1, precioUnitario: 0 }],
  });

  const handleOpenDialog = () => {
    setFormData({
      clienteId: clientes[0]?.id || '',
      pedidoId: '', // Opcional - si viene de un pedido
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

  const handleSave = () => {
    // Validate stock
    for (const item of formData.productos) {
      const producto = productos.find(p => p.id === item.productoId);
      if (!producto || producto.stock < item.cantidad) {
        alert(`Stock insuficiente para ${producto?.nombre || 'producto'}`);
        return;
      }
    }

    const subtotal = formData.productos.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
    const iva = Math.round(subtotal * 0.19); // IVA del 19%
    const costoEnvio = 10000; // Costo fijo de envío
    const total = subtotal + iva + costoEnvio;
    
    addVenta({
      clienteId: formData.clienteId,
      fecha: new Date().toISOString().split('T')[0],
      productos: formData.productos,
      subtotal,
      iva,
      costoEnvio,
      total,
      estado: 'activo',
      metodoPago: formData.metodoPago,
    });

    // Reduce stock
    formData.productos.forEach(p => {
      updateStock(p.productoId, -p.cantidad);
    });

    setIsDialogOpen(false);
  };

  const handleViewVenta = (venta: any) => {
    setSelectedVenta(venta);
    setViewDialogOpen(true);
  };

  const handleViewDetail = (venta: any) => {
    setSelectedVenta(venta);
    setDetailDialogOpen(true);
  };

  const handleViewPDF = (venta: any) => {
    setSelectedVenta(venta);
    setPdfDialogOpen(true);
  };

  const handleToggleEstadoVenta = (ventaId: string, currentStatus: 'activo' | 'anulada') => {
    if (currentStatus === 'anulada') {
      // No permitir cambiar de anulada a activo
      return;
    }
    
    // Cambiar de activo a anulada
    const newStatus = 'anulada';
    updateVenta(ventaId, { estado: newStatus });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Filter ventas based on search
  const filteredVentas = ventas.filter(venta => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const cliente = clientes.find(c => c.id === venta.clienteId);
    return (
      venta.id.toLowerCase().includes(query) ||
      (cliente?.nombre || '').toLowerCase().includes(query) ||
      venta.estado.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVentas.length / itemsPerPage);
  const paginatedVentas = filteredVentas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <div className="flex items-center justify-between">
              <p className="text-foreground" style={{ fontSize: '16px', fontWeight: 500 }}>
                Total de ventas: {filteredVentas.length} | Monto total: {formatCurrency(ventas.reduce((sum, v) => sum + v.total, 0))}
              </p>
            </div>
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
                <TableHead className="text-foreground-secondary">Cliente</TableHead>
                <TableHead className="text-foreground-secondary">Fecha</TableHead>
                <TableHead className="text-foreground-secondary">Total</TableHead>
                <TableHead className="text-foreground-secondary">Método Pago</TableHead>
                <TableHead className="text-foreground-secondary">Estado</TableHead>
                <TableHead className="text-foreground-secondary text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVentas.map((venta) => {
                const cliente = clientes.find(c => c.id === venta.clienteId);
                const isAnulada = venta.estado === 'anulada';
                return (
                  <TableRow key={venta.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-foreground-secondary">{venta.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-foreground">{cliente?.nombre || 'N/A'}</TableCell>
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
                          onClick={() => handleViewPDF(venta)}
                          className="h-8 w-8 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                          title="Ver PDF"
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
                            onClick={() => handleToggleEstadoVenta(venta.id, venta.estado)}
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
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredVentas.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredVentas.length}
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
            <DialogTitle className="text-foreground">Nueva Venta</DialogTitle>
            <DialogDescription className="sr-only">Formulario para crear una nueva venta</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Cliente</Label>
                <Select value={formData.clienteId} onValueChange={(value) => setFormData({ ...formData, clienteId: value })}>
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
                <Select value={formData.metodoPago} onValueChange={(value) => setFormData({ ...formData, metodoPago: value })}>
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
                    <Select value={prod.productoId} onValueChange={(value) => updateProductLine(index, 'productoId', value)}>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border text-foreground hover:bg-surface">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Confirmar Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
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
                      <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                        <div className="flex-1">
                          <p className="text-foreground" style={{ fontWeight: 500 }}>{producto?.nombre || 'Producto no encontrado'}</p>
                          <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                            Cantidad: {p.cantidad} × {formatCurrency(p.precioUnitario)}
                          </p>
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

      {/* PDF Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Comprobante de Venta - PDF</DialogTitle>
            <DialogDescription className="sr-only">Vista de impresión del comprobante de venta</DialogDescription>
          </DialogHeader>
          
          {selectedVenta && (
            <div className="space-y-6 py-6 px-4">
              {/* Header del PDF */}
              <div className="text-center border-b border-border pb-6">
                <h2 className="text-primary" style={{ fontSize: '24px', fontWeight: 600 }}>GLAMOUR ML</h2>
                <p className="text-foreground-secondary mt-1">Medellín, Colombia</p>
                <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>NIT: 900.XXX.XXX-X</p>
                <div className="mt-4 inline-block bg-primary/10 px-4 py-2 rounded-lg">
                  <p className="text-primary" style={{ fontWeight: 600 }}>FACTURA DE VENTA</p>
                  <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>No. {selectedVenta.id}</p>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-foreground-secondary mb-2" style={{ fontSize: '12px', fontWeight: 600 }}>DATOS DEL CLIENTE</p>
                  <div className="space-y-1">
                    <p className="text-foreground">{clientes.find(c => c.id === selectedVenta.clienteId)?.nombre || 'N/A'}</p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      {clientes.find(c => c.id === selectedVenta.clienteId)?.documento || 'N/A'}
                    </p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      {clientes.find(c => c.id === selectedVenta.clienteId)?.telefono || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-foreground-secondary mb-2" style={{ fontSize: '12px', fontWeight: 600 }}>INFORMACIÓN DE VENTA</p>
                  <div className="space-y-1">
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      <span className="text-foreground" style={{ fontWeight: 500 }}>Fecha:</span> {selectedVenta.fecha}
                    </p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      <span className="text-foreground" style={{ fontWeight: 500 }}>Método de Pago:</span> {selectedVenta.metodoPago}
                    </p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      <span className="text-foreground" style={{ fontWeight: 500 }}>Estado:</span>{' '}
                      <span className={selectedVenta.estado === 'activo' ? 'text-success' : 'text-danger'}>
                        {selectedVenta.estado === 'activo' ? 'Activa' : 'Anulada'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalle de Productos */}
              <div>
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-lg">
                  <div className="grid grid-cols-12 gap-4">
                    <p className="col-span-5" style={{ fontSize: '12px', fontWeight: 600 }}>PRODUCTO</p>
                    <p className="col-span-2 text-center" style={{ fontSize: '12px', fontWeight: 600 }}>CANT.</p>
                    <p className="col-span-2 text-right" style={{ fontSize: '12px', fontWeight: 600 }}>PRECIO</p>
                    <p className="col-span-3 text-right" style={{ fontSize: '12px', fontWeight: 600 }}>SUBTOTAL</p>
                  </div>
                </div>
                <div className="border border-t-0 border-border rounded-b-lg">
                  {selectedVenta.productos.map((p: any, i: number) => {
                    const producto = productos.find(prod => prod.id === p.productoId);
                    return (
                      <div 
                        key={i} 
                        className={`grid grid-cols-12 gap-4 px-4 py-3 ${
                          i !== selectedVenta.productos.length - 1 ? 'border-b border-border' : ''
                        }`}
                      >
                        <p className="col-span-5 text-foreground">{producto?.nombre || 'N/A'}</p>
                        <p className="col-span-2 text-center text-foreground-secondary">{p.cantidad}</p>
                        <p className="col-span-2 text-right text-foreground-secondary">{formatCurrency(p.precioUnitario)}</p>
                        <p className="col-span-3 text-right text-foreground" style={{ fontWeight: 500 }}>
                          {formatCurrency(p.cantidad * p.precioUnitario)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen de la Transacción */}
              <div className="bg-surface p-4 rounded-lg border border-border">
                <p className="text-foreground mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>RESUMEN DE LA TRANSACCIÓN</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>Subtotal:</span>
                    <span className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {formatCurrency(selectedVenta.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>IVA (19%):</span>
                    <span className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {formatCurrency(selectedVenta.iva)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>Costo de Envío:</span>
                    <span className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {formatCurrency(selectedVenta.costoEnvio)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: '18px', fontWeight: 700 }}>TOTAL A PAGAR:</span>
                      <span className="text-primary" style={{ fontSize: '26px', fontWeight: 700 }}>
                        {formatCurrency(selectedVenta.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedVenta.estado === 'anulada' && (
                <div className="bg-danger/10 border-2 border-danger rounded-lg p-4 text-center">
                  <p className="text-danger" style={{ fontSize: '16px', fontWeight: 700 }}>
                    ⚠️ FACTURA ANULADA
                  </p>
                  {selectedVenta.motivoAnulacion && (
                    <p className="text-foreground mt-2" style={{ fontSize: '14px' }}>
                      Motivo: {selectedVenta.motivoAnulacion}
                    </p>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-foreground-secondary pt-4 border-t border-border">
                <p style={{ fontSize: '12px' }}>Gracias por su compra</p>
                <p style={{ fontSize: '12px' }}>GLAMOUR ML - Cosméticos de calidad</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPdfDialogOpen(false)} 
              className="border-border text-foreground hover:bg-surface"
            >
              Cerrar
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => window.print()}
            >
              <FileText className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}