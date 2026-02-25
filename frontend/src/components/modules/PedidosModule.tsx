import { useState } from 'react';
import { useStore, OrderStatus } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { StatusBadge } from '../StatusBadge';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Plus, Edit, Eye, Search, FileText, Package, Trash2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';

export function PedidosModule() {
  const { pedidos, clientes, productos, addPedido, updatePedidoEstado, updateStock } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pendiente');
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
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
    const costoEnvio = 12000; // Costo fijo de envío para pedidos
    const total = subtotal + iva + costoEnvio;
    
    addPedido({
      clienteId: formData.clienteId,
      fecha: new Date().toISOString().split('T')[0],
      productos: formData.productos,
      subtotal,
      iva,
      costoEnvio,
      total,
      estado: 'pendiente',
      direccionEnvio: formData.direccionEnvio,
    });

    // Reduce stock
    formData.productos.forEach(p => {
      updateStock(p.productoId, -p.cantidad);
    });

    setIsDialogOpen(false);
  };

  const handleOpenStatusDialog = (pedido: any) => {
    setSelectedPedido(pedido);
    setNewStatus(pedido.estado);
    setMotivoAnulacion('');
    setIsStatusDialogOpen(true);
  };

  const handleViewDetail = (pedido: any) => {
    setSelectedPedido(pedido);
    setDetailDialogOpen(true);
  };

  const handleViewPDF = (pedido: any) => {
    setSelectedPedido(pedido);
    setPdfDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (newStatus === 'cancelado' && !motivoAnulacion) {
      alert('Debe especificar un motivo de cancelación');
      return;
    }

    updatePedidoEstado(selectedPedido.id, newStatus, motivoAnulacion || undefined);
    setIsStatusDialogOpen(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, { bg: string; text: string; label: string }> = {
      'pendiente': { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Pendiente' },
      'preparado': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Preparado' },
      'entregado': { bg: 'bg-success/10', text: 'text-success', label: 'Entregado' },
      'cancelado': { bg: 'bg-danger/10', text: 'text-danger', label: 'Cancelado' },
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

  // Filter pedidos based on search
  const filteredPedidos = pedidos.filter(pedido => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const cliente = clientes.find(c => c.id === pedido.clienteId);
    return (
      pedido.id.toLowerCase().includes(query) ||
      (cliente?.nombre || '').toLowerCase().includes(query) ||
      pedido.estado.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);
  const paginatedPedidos = filteredPedidos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const getAllStatuses = (): OrderStatus[] => {
    return ['pendiente', 'preparado', 'entregado', 'cancelado'];
  };

  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      'pendiente': 'Pendiente',
      'preparado': 'Preparado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado',
    };
    return labels[status] || status;
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
                Mostrando {filteredPedidos.length} de {pedidos.length} pedidos
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
              {filteredPedidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-foreground-secondary">
                      {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay pedidos'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPedidos.map((pedido) => {
                const cliente = clientes.find(c => c.id === pedido.clienteId);
                return (
                  <TableRow key={pedido.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-foreground-secondary">{pedido.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-foreground">{cliente?.nombre || 'N/A'}</TableCell>
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
        {filteredPedidos.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPedidos.length}
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
                  <div className="col-span-3 space-y-1">
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
              Crear Pedido
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
        <DialogContent className="bg-card border-border max-w-2xl">
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
                <p className="text-foreground mb-3" style={{ fontWeight: 500 }}>Resumen del Pedido</p>
                <div className="bg-surface rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">Subtotal:</span>
                    <span className="text-foreground">{formatCurrency(selectedPedido.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary">IVA (19%):</span>
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

      {/* PDF Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Comprobante de Pedido - PDF</DialogTitle>
          </DialogHeader>
          
          {selectedPedido && (
            <div className="space-y-6 py-6 px-4">
              {/* Header del PDF */}
              <div className="text-center border-b border-border pb-6">
                <h2 className="text-primary" style={{ fontSize: '24px', fontWeight: 600 }}>GLAMOUR ML</h2>
                <p className="text-foreground-secondary mt-1">Medellín, Colombia</p>
                <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>NIT: 900.XXX.XXX-X</p>
                <div className="mt-4 inline-block bg-primary/10 px-4 py-2 rounded-lg">
                  <p className="text-primary" style={{ fontWeight: 600 }}>COMPROBANTE DE PEDIDO</p>
                  <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>No. {selectedPedido.id}</p>
                </div>
              </div>

              {/* Información del Cliente y Pedido */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-foreground-secondary mb-2" style={{ fontSize: '12px', fontWeight: 600 }}>DATOS DEL CLIENTE</p>
                  <div className="space-y-1">
                    <p className="text-foreground">{clientes.find(c => c.id === selectedPedido.clienteId)?.nombre || 'N/A'}</p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      {clientes.find(c => c.id === selectedPedido.clienteId)?.documento || 'N/A'}
                    </p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      {clientes.find(c => c.id === selectedPedido.clienteId)?.telefono || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-foreground-secondary mb-2" style={{ fontSize: '12px', fontWeight: 600 }}>INFORMACIÓN DEL PEDIDO</p>
                  <div className="space-y-1">
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      <span className="text-foreground" style={{ fontWeight: 500 }}>Fecha:</span> {selectedPedido.fecha}
                    </p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      <span className="text-foreground" style={{ fontWeight: 500 }}>Estado:</span>{' '}
                      <span className={getStatusColor(selectedPedido.estado).text}>
                        {getStatusColor(selectedPedido.estado).label}
                      </span>
                    </p>
                    <div className="pt-2">
                      <p className="text-foreground-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Dirección de Envío:</p>
                      <p className="text-foreground" style={{ fontSize: '14px' }}>{selectedPedido.direccionEnvio}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado del Pedido - Timeline */}
              <div className="bg-surface p-4 rounded-lg">
                <p className="text-foreground mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>SEGUIMIENTO DEL PEDIDO</p>
                <div className="flex items-center justify-between">
                  {getAllStatuses().filter(s => s !== 'anulado').map((status, index) => {
                    const statusInfo = getStatusColor(status);
                    const currentIndex = getAllStatuses().indexOf(selectedPedido.estado);
                    const thisIndex = getAllStatuses().indexOf(status);
                    const isActive = thisIndex <= currentIndex;
                    const isAnulado = selectedPedido.estado === 'anulado';
                    
                    return (
                      <div key={status} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isActive && !isAnulado ? statusInfo.bg + ' border-2 ' + statusInfo.text.replace('text-', 'border-') : 'bg-surface border border-border'
                          }`}>
                            <Package className={`w-5 h-5 ${isActive && !isAnulado ? statusInfo.text : 'text-foreground-secondary'}`} />
                          </div>
                          <p className={`text-center mt-2 ${isActive && !isAnulado ? statusInfo.text : 'text-foreground-secondary'}`} style={{ fontSize: '10px', fontWeight: 500 }}>
                            {statusInfo.label}
                          </p>
                        </div>
                        {index < 3 && (
                          <div className={`h-0.5 flex-1 ${isActive && !isAnulado && thisIndex < currentIndex ? statusInfo.bg.replace('/10', '') : 'bg-border'}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {selectedPedido.estado === 'anulado' && (
                  <div className="mt-4 bg-danger/10 border border-danger/30 rounded-lg p-3 text-center">
                    <p className="text-danger" style={{ fontSize: '14px', fontWeight: 600 }}>
                      ⚠️ PEDIDO ANULADO
                    </p>
                  </div>
                )}
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
                  {selectedPedido.productos.map((p: any, i: number) => {
                    const producto = productos.find(prod => prod.id === p.productoId);
                    return (
                      <div 
                        key={i} 
                        className={`grid grid-cols-12 gap-4 px-4 py-3 ${
                          i !== selectedPedido.productos.length - 1 ? 'border-b border-border' : ''
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

              {/* Resumen del Pedido */}
              <div className="bg-surface p-4 rounded-lg border border-border">
                <p className="text-foreground mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>RESUMEN DEL PEDIDO</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>Subtotal:</span>
                    <span className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {formatCurrency(selectedPedido.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>IVA (19%):</span>
                    <span className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {formatCurrency(selectedPedido.iva)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-secondary" style={{ fontSize: '14px' }}>Costo de Envío:</span>
                    <span className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {formatCurrency(selectedPedido.costoEnvio)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: '18px', fontWeight: 700 }}>TOTAL A PAGAR:</span>
                      <span className="text-primary" style={{ fontSize: '26px', fontWeight: 700 }}>
                        {formatCurrency(selectedPedido.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPedido.motivoAnulacion && (
                <div className="bg-danger/10 border-2 border-danger rounded-lg p-4">
                  <p className="text-danger" style={{ fontSize: '12px', fontWeight: 700 }}>
                    MOTIVO DE ANULACIÓN
                  </p>
                  <p className="text-foreground mt-2" style={{ fontSize: '14px' }}>
                    {selectedPedido.motivoAnulacion}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-foreground-secondary pt-4 border-t border-border">
                <p style={{ fontSize: '12px' }}>Gracias por tu pedido</p>
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