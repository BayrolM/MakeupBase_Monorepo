import { useState } from 'react';
import { useStore } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Plus, Eye, FileText, Edit, Search, Calendar, XCircle, X } from 'lucide-react';

export function DevolucionesModule() {
  const { devoluciones, ventas, clientes, productos, compras, addDevolucion, updateDevolucion, updateStock } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [estadoDialogOpen, setEstadoDialogOpen] = useState(false);
  const [anularDialogOpen, setAnularDialogOpen] = useState(false);
  const [selectedDevolucion, setSelectedDevolucion] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [motivoDecision, setMotivoDecision] = useState('');
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [ventaData, setVentaData] = useState<any>(null);
  const [productosDevolver, setProductosDevolver] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    ventaId: '',
    fechaDevolucion: new Date().toISOString().split('T')[0],
    motivo: '',
    estado: 'Procesada' as 'Procesada' | 'Pendiente' | 'Rechazada',
  });

  const handleOpenDialog = () => {
    setFormData({
      ventaId: '',
      fechaDevolucion: new Date().toISOString().split('T')[0],
      motivo: '',
      estado: 'Procesada',
    });
    setSuccessMessage('');
    setErrorMessage('');
    setVentaData(null);
    setProductosDevolver([]);
    setIsDialogOpen(true);
  };

  const handleVentaIdChange = (id: string) => {
    setFormData({ ...formData, ventaId: id });
    setErrorMessage('');
    setProductosDevolver([]);
    
    if (id.trim() === '') {
      setVentaData(null);
      return;
    }

    // Buscar la venta
    const venta = ventas?.find((v: any) => v.id === id || v.id.toLowerCase().includes(id.toLowerCase()));
    
    if (venta) {
      setVentaData(venta);
      setErrorMessage('');
      // Inicializar productos disponibles para devolver
      const productosDisponibles = venta.productos.map((p: any) => ({
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
      setErrorMessage('La compra no existe, verifica el ID ingresado');
    }
  };

  const handleToggleProducto = (index: number) => {
    const newProductos = [...productosDevolver];
    newProductos[index].selected = !newProductos[index].selected;
    // Si se deselecciona, resetear cantidad a devolver
    if (!newProductos[index].selected) {
      newProductos[index].cantidadADevolver = 0;
    }
    setProductosDevolver(newProductos);
  };

  const handleCantidadDevolucion = (index: number, cantidad: number) => {
    const newProductos = [...productosDevolver];
    if (cantidad >= 0 && cantidad <= newProductos[index].cantidadComprada) {
      newProductos[index].cantidadADevolver = cantidad;
      setProductosDevolver(newProductos);
    }
  };

  const calculateTotalDevolucion = () => {
    return productosDevolver
      .filter(p => p.selected && p.cantidadADevolver > 0)
      .reduce((sum, p) => sum + (p.precioUnitario * p.cantidadADevolver), 0);
  };

  const handleSave = () => {
    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    // Validate ventaId
    if (!formData.ventaId.trim()) {
      setErrorMessage('Debe ingresar el ID de la compra');
      return;
    }

    // Check if venta exists
    if (!ventaData) {
      setErrorMessage('La compra no existe, verifica el ID ingresado');
      return;
    }

    // Validate productos seleccionados
    const productosSeleccionados = productosDevolver.filter(p => p.selected && p.cantidadADevolver > 0);
    
    if (productosSeleccionados.length === 0) {
      setErrorMessage('Seleccione al menos un producto para devolver');
      return;
    }

    // Validar que ninguna cantidad exceda la comprada
    const excedeCompra = productosDevolver.some(p => p.selected && p.cantidadADevolver > p.cantidadComprada);
    if (excedeCompra) {
      setErrorMessage('La cantidad a devolver excede la cantidad comprada');
      return;
    }

    // Validate motivo (mínimo 5 caracteres)
    if (!formData.motivo.trim()) {
      setErrorMessage('Ingrese un motivo válido');
      return;
    }
    
    if (formData.motivo.trim().length < 5) {
      setErrorMessage('Ingrese un motivo válido');
      return;
    }

    // Check if ya existe una devolución para alguno de estos productos
    const productoConDevolucion = productosSeleccionados.find(p => {
      return devoluciones.some((d: any) => 
        d.ventaId === formData.ventaId && 
        d.productos.some((dp: any) => dp.productoId === p.productoId)
      );
    });
    
    if (productoConDevolucion) {
      setErrorMessage('Este producto ya tiene una devolución registrada');
      return;
    }

    // Create devolucion
    addDevolucion({
      compraId: formData.ventaId,
      ventaId: formData.ventaId,
      clienteId: ventaData.clienteId || '',
      fecha: formData.fechaDevolucion,
      motivo: formData.motivo,
      productos: productosSeleccionados.map(p => ({
        productoId: p.productoId,
        cantidad: p.cantidadADevolver
      })),
      estado: formData.estado === 'Procesada' ? 'aprobada' : formData.estado === 'Rechazada' ? 'rechazada' : 'pendiente',
      evidencias: [],
      totalDevuelto: calculateTotalDevolucion(),
    });

    setSuccessMessage('Devolución registrada correctamente');
    
    // Clear form after 2 seconds and close dialog
    setTimeout(() => {
      setIsDialogOpen(false);
      setSuccessMessage('');
      setErrorMessage('');
      setVentaData(null);
      setProductosDevolver([]);
    }, 2000);
  };

  const handleViewDetail = (devolucion: any) => {
    setSelectedDevolucion(devolucion);
    setDetailDialogOpen(true);
  };

  const handleViewPDF = (devolucion: any) => {
    setSelectedDevolucion(devolucion);
    setPdfDialogOpen(true);
  };

  const handleOpenEstadoDialog = (devolucion: any) => {
    setSelectedDevolucion(devolucion);
    setMotivoDecision('');
    setEstadoDialogOpen(true);
  };

  const handleChangeEstado = (newEstado: string) => {
    if (!selectedDevolucion) return;

    // Solo requerir motivo de decisión para aprobación o rechazo
    if ((newEstado === 'aprobada' || newEstado === 'rechazada') && !motivoDecision.trim()) {
      alert('Debe ingresar el motivo de la decisión');
      return;
    }

    // Si se aprueba, devolver productos al stock
    if (newEstado === 'aprobada') {
      selectedDevolucion.productos.forEach((p: any) => {
        updateStock(p.productoId, p.cantidad);
      });
    }

    updateDevolucion(selectedDevolucion.id, { 
      estado: newEstado,
      motivoDecision: (newEstado === 'aprobada' || newEstado === 'rechazada') ? motivoDecision : undefined
    });
    setEstadoDialogOpen(false);
    setMotivoDecision('');
  };

  const handleOpenAnularDialog = (devolucion: any) => {
    setSelectedDevolucion(devolucion);
    setMotivoAnulacion('');
    setAnularDialogOpen(true);
  };

  const handleAnularDevolucion = () => {
    if (!selectedDevolucion) return;

    if (!motivoAnulacion.trim() || motivoAnulacion.trim().length < 5) {
      alert('Debe ingresar un motivo de anulación válido (mínimo 5 caracteres)');
      return;
    }

    // Anular la devolución
    updateDevolucion(selectedDevolucion.id, { 
      estado: 'anulada',
      motivoAnulacion: motivoAnulacion,
      fechaAnulacion: new Date().toISOString().split('T')[0]
    });
    
    setAnularDialogOpen(false);
    setMotivoAnulacion('');
  };

  const canAnularDevolucion = (estado: string) => {
    // Solo se pueden anular devoluciones que estén en pendiente o en_revision
    return estado === 'pendiente' || estado === 'en_revision';
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, { bg: string; text: string; label: string }> = {
      pendiente: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Pendiente' },
      en_revision: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'En Revisión' },
      aprobada: { bg: 'bg-success/10', text: 'text-success', label: 'Aprobada' },
      rechazada: { bg: 'bg-danger/10', text: 'text-danger', label: 'Rechazada' },
      anulada: { bg: 'bg-surface', text: 'text-foreground-secondary', label: 'Anulada' },
    };
    return colors[estado] || colors.pendiente;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Filter devoluciones based on search
  const filteredDevoluciones = devoluciones.filter(devolucion => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const cliente = clientes.find(c => c.id === devolucion.clienteId);
    return (
      devolucion.id.toLowerCase().includes(query) ||
      (cliente?.nombre || '').toLowerCase().includes(query) ||
      devolucion.estado.toLowerCase().includes(query) ||
      devolucion.fecha.includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDevoluciones.length / itemsPerPage);
  const paginatedDevoluciones = filteredDevoluciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const canChangeEstado = (estado: string) => {
    return estado !== 'aprobada' && estado !== 'rechazada' && estado !== 'anulada';
  };

  const isFormValid = () => {
    return formData.ventaId.trim().length > 0 && formData.motivo.trim().length >= 5;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Devoluciones"
        subtitle="Gestión de devoluciones de ventas"
        actionButton={{
          label: 'Nueva Devolución',
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
                  placeholder="Buscar devoluciones por ID, cliente, estado o fecha..."
                />
              </div>
            </div>
            <div>
              <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                Mostrando {filteredDevoluciones.length} de {devoluciones.length} devoluciones
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground-secondary">ID</TableHead>
                <TableHead className="text-foreground-secondary">Cliente</TableHead>
                <TableHead className="text-foreground-secondary">Fecha</TableHead>
                <TableHead className="text-foreground-secondary">Motivo</TableHead>
                <TableHead className="text-foreground-secondary">Total Devuelto</TableHead>
                <TableHead className="text-foreground-secondary">Estado</TableHead>
                <TableHead className="text-foreground-secondary text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevoluciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-foreground-secondary">
                      {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay devoluciones'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDevoluciones.map((devolucion) => {
                const cliente = clientes.find(c => c.id === devolucion.clienteId);
                return (
                  <TableRow key={devolucion.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-foreground-secondary">{devolucion.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-foreground">{cliente?.nombre || 'N/A'}</TableCell>
                    <TableCell className="text-foreground-secondary">{devolucion.fecha}</TableCell>
                    <TableCell className="text-foreground-secondary max-w-[200px] truncate">{devolucion.motivo}</TableCell>
                    <TableCell className="text-foreground">{formatCurrency(devolucion.totalDevuelto)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full ${getEstadoColor(devolucion.estado).bg}`}>
                            <span className={`${getEstadoColor(devolucion.estado).text}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                              {getEstadoColor(devolucion.estado).label}
                            </span>
                          </div>
                          {devolucion.motivoDecision && (
                            <span className="text-foreground-secondary" style={{ fontSize: '11px' }} title={devolucion.motivoDecision}>
                              {devolucion.motivoDecision.length > 30 ? devolucion.motivoDecision.slice(0, 30) + '...' : devolucion.motivoDecision}
                            </span>
                          )}
                          {devolucion.motivoAnulacion && (
                            <span className="text-danger" style={{ fontSize: '11px' }} title={devolucion.motivoAnulacion}>
                              {devolucion.motivoAnulacion.length > 30 ? devolucion.motivoAnulacion.slice(0, 30) + '...' : devolucion.motivoAnulacion}
                            </span>
                          )}
                        </div>
                        {canChangeEstado(devolucion.estado) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEstadoDialog(devolucion)}
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
                          onClick={() => handleViewPDF(devolucion)}
                          className="h-8 w-8 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                          title="Ver PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetail(devolucion)}
                          className="h-8 w-8 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                          title="Ver Detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canAnularDevolucion(devolucion.estado) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenAnularDialog(devolucion)}
                            className="h-8 w-8 p-0 text-danger hover:text-danger/80 hover:bg-danger/10"
                            title="Anular Devolución"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredDevoluciones.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDevoluciones.length}
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
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Registrar Devolución</DialogTitle>
            <DialogDescription className="sr-only">Formulario para registrar una nueva devolución de productos</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                <p className="text-success" style={{ fontSize: '14px', fontWeight: 500 }}>
                  {successMessage}
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
                <p className="text-danger" style={{ fontSize: '14px', fontWeight: 500 }}>
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-foreground">
                ID de compra <span className="text-danger">*</span>
              </Label>
              <input
                type="text"
                value={formData.ventaId}
                onChange={(e) => handleVentaIdChange(e.target.value)}
                className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingrese el ID de la compra"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">
                Fecha de devolución <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.fechaDevolucion}
                  onChange={(e) => setFormData({ ...formData, fechaDevolucion: e.target.value })}
                  className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">
                Motivo de la devolución <span className="text-danger">*</span>
              </Label>
              <Textarea
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                className="bg-input-background border-border text-foreground"
                placeholder="Describa el motivo de la devolución (mínimo 5 caracteres)"
                rows={4}
              />
              <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                Caracteres ingresados: {formData.motivo.length} / Mínimo: 5
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Estado</Label>
              <Select 
                value={formData.estado} 
                onValueChange={(value: 'Procesada' | 'Pendiente' | 'Rechazada') => 
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger className="bg-input-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Procesada" className="text-foreground">
                    Procesada
                  </SelectItem>
                  <SelectItem value="Pendiente" className="text-foreground">
                    Pendiente
                  </SelectItem>
                  <SelectItem value="Rechazada" className="text-foreground">
                    Rechazada
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {ventaData && (
              <div className="space-y-4">
                <div className="bg-surface p-4 rounded-lg border border-border">
                  <p className="text-foreground mb-3" style={{ fontSize: '14px', fontWeight: 500 }}>Información de la Compra</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Fecha de compra</p>
                      <p className="text-foreground">{ventaData.fecha}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Nombre del cliente</p>
                      <p className="text-foreground">{clientes.find(c => c.id === ventaData.clienteId)?.nombre || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Productos comprados</Label>
                  <div className="border border-border rounded-lg overflow-hidden">
                    {ventaData.productos && ventaData.productos.map((item: any, index: number) => {
                      const producto = productos.find(p => p.id === item.productoId);
                      const isSelected = productosDevolver[index]?.selected || false;
                      const totalProducto = item.cantidad * item.precioUnitario;
                      return (
                        <div 
                          key={index} 
                          className={`p-4 ${
                            index !== ventaData.productos.length - 1 ? 'border-b border-border' : ''
                          } ${isSelected ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleProducto(index)}
                              className="border-border"
                            />
                            <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                              <div>
                                <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                                  {producto?.nombre || 'N/A'}
                                </p>
                                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                                  SKU: {producto?.sku || 'N/A'}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                                  Cantidad comprada
                                </p>
                                <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                                  {item.cantidad}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                                  Precio individual
                                </p>
                                <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                                  {formatCurrency(item.precioUnitario || 0)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                                  Total producto
                                </p>
                                <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                                  {formatCurrency(totalProducto || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="mt-3 pl-10 flex items-center gap-4">
                              <div className="flex-1">
                                <Label className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                                  Cantidad a devolver (máx: {item.cantidad})
                                </Label>
                                <input
                                  type="number"
                                  min="1"
                                  max={item.cantidad}
                                  value={productosDevolver[index]?.cantidadADevolver || ''}
                                  onChange={(e) => handleCantidadDevolucion(index, parseInt(e.target.value) || 0)}
                                  className="w-full h-9 px-3 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                  placeholder="Ingrese cantidad"
                                />
                              </div>
                              {productosDevolver[index]?.cantidadADevolver > 0 && (
                                <div className="bg-primary/10 px-3 py-2 rounded-lg">
                                  <p className="text-foreground-secondary" style={{ fontSize: '11px' }}>Monto a devolver</p>
                                  <p className="text-primary" style={{ fontSize: '14px', fontWeight: 600 }}>
                                    {formatCurrency((productosDevolver[index]?.cantidadADevolver || 0) * item.precioUnitario)}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                    Seleccione uno o más productos y especifique la cantidad a devolver
                  </p>
                </div>

                {productosDevolver.some(p => p.selected && p.cantidadADevolver > 0) && (
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                        Total Estimado a Devolver:
                      </span>
                      <span className="text-primary" style={{ fontSize: '20px', fontWeight: 700 }}>
                        {formatCurrency(calculateTotalDevolucion())}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!isFormValid() || !productosDevolver.some(p => p.selected && p.cantidadADevolver > 0)}
            >
              Registrar Devolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalle de Devolución</DialogTitle>
            <DialogDescription className="sr-only">Información completa de la devolución seleccionada</DialogDescription>
          </DialogHeader>
          
          {selectedDevolucion && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>ID de Devolución</p>
                  <p className="text-foreground">{selectedDevolucion.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Estado</p>
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full ${getEstadoColor(selectedDevolucion.estado).bg}`}>
                    <span className={`${getEstadoColor(selectedDevolucion.estado).text}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                      {getEstadoColor(selectedDevolucion.estado).label}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Cliente</p>
                  <p className="text-foreground">{clientes.find(c => c.id === selectedDevolucion.clienteId)?.nombre || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Fecha</p>
                  <p className="text-foreground">{selectedDevolucion.fecha}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>ID de Venta</p>
                  <p className="text-foreground">{selectedDevolucion.ventaId.slice(0, 8)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Total Devuelto</p>
                  <p className="text-primary" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {formatCurrency(selectedDevolucion.totalDevuelto)}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-foreground mb-3" style={{ fontWeight: 500 }}>Motivo de Devolución</p>
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-foreground-secondary">{selectedDevolucion.motivo}</p>
                </div>
              </div>

              {selectedDevolucion.motivoDecision && (
                <div className="border-t border-border pt-4">
                  <p className="text-foreground mb-3" style={{ fontWeight: 500 }}>Motivo de Decisión</p>
                  <div className="bg-surface p-4 rounded-lg border-l-4 border-primary">
                    <p className="text-foreground-secondary">{selectedDevolucion.motivoDecision}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <p className="text-foreground mb-3" style={{ fontWeight: 500 }}>Productos Devueltos</p>
                <div className="space-y-2">
                  {selectedDevolucion.productos.map((p: any, i: number) => {
                    const producto = productos.find(prod => prod.id === p.productoId);
                    return (
                      <div key={i} className="p-3 bg-surface rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-foreground">{producto?.nombre || 'N/A'}</p>
                          <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>SKU: {producto?.sku || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>Cantidad</p>
                          <p className="text-foreground" style={{ fontWeight: 500 }}>{p.cantidad}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
            <DialogTitle className="text-foreground">Comprobante de Devolución - PDF</DialogTitle>
            <DialogDescription className="sr-only">Vista de impresión del comprobante de devolución</DialogDescription>
          </DialogHeader>
          
          {selectedDevolucion && (
            <div className="space-y-6 py-6 px-4 overflow-y-auto max-h-[70vh]">
              {/* Header del PDF */}
              <div className="text-center border-b border-border pb-6">
                <h2 className="text-primary" style={{ fontSize: '24px', fontWeight: 600 }}>GLAMOUR ML</h2>
                <p className="text-foreground-secondary mt-1">Medellín, Colombia</p>
                <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>NIT: 900.XXX.XXX-X</p>
                <div className="mt-4 inline-block bg-primary/10 px-4 py-2 rounded-lg">
                  <p className="text-primary" style={{ fontWeight: 600 }}>COMPROBANTE DE DEVOLUCIÓN</p>
                  <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>No. {selectedDevolucion.id}</p>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-foreground-secondary mb-2" style={{ fontSize: '12px', fontWeight: 600 }}>DATOS DEL CLIENTE</p>
                  <div className="space-y-1">
                    <p className="text-foreground">{clientes.find(c => c.id === selectedDevolucion.clienteId)?.nombre || 'N/A'}</p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      {clientes.find(c => c.id === selectedDevolucion.clienteId)?.documento || 'N/A'}
                    </p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      {clientes.find(c => c.id === selectedDevolucion.clienteId)?.telefono || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-foreground-secondary mb-2" style={{ fontSize: '12px', fontWeight: 600 }}>INFORMACIÓN DE DEVOLUCIÓN</p>
                  <div className="space-y-1">
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      <span className="text-foreground" style={{ fontWeight: 500 }}>Fecha:</span> {selectedDevolucion.fecha}
                    </p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      <span className="text-foreground" style={{ fontWeight: 500 }}>Venta Ref:</span> {selectedDevolucion.ventaId.slice(0, 8)}
                    </p>
                    <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                      <span className="text-foreground" style={{ fontWeight: 500 }}>Estado:</span>{' '}
                      {selectedDevolucion.estado === 'aprobada' ? (
                        <span className="text-success">Aprobada</span>
                      ) : selectedDevolucion.estado === 'rechazada' ? (
                        <span className="text-danger">Rechazada</span>
                      ) : selectedDevolucion.estado === 'en_revision' ? (
                        <span className="text-blue-600">En Revisión</span>
                      ) : selectedDevolucion.estado === 'anulada' ? (
                        <span className="text-foreground-secondary">Anulada</span>
                      ) : (
                        <span className="text-yellow-600">Pendiente</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Motivo de Devolución */}
              <div className="bg-surface p-4 rounded-lg border border-border">
                <p className="text-foreground mb-2" style={{ fontSize: '12px', fontWeight: 600 }}>MOTIVO DE DEVOLUCIÓN</p>
                <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>{selectedDevolucion.motivo}</p>
              </div>

              {/* Motivo de Decisión */}
              {selectedDevolucion.motivoDecision && (
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                  <p className="text-foreground mb-2" style={{ fontSize: '12px', fontWeight: 600 }}>MOTIVO DE DECISIÓN</p>
                  <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>{selectedDevolucion.motivoDecision}</p>
                </div>
              )}

              {/* Detalle de Productos */}
              <div>
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-lg">
                  <div className="grid grid-cols-12 gap-4">
                    <p className="col-span-8" style={{ fontSize: '12px', fontWeight: 600 }}>PRODUCTO</p>
                    <p className="col-span-2 text-center" style={{ fontSize: '12px', fontWeight: 600 }}>CANT.</p>
                    <p className="col-span-2 text-right" style={{ fontSize: '12px', fontWeight: 600 }}>SKU</p>
                  </div>
                </div>
                <div className="border border-t-0 border-border rounded-b-lg">
                  {selectedDevolucion.productos.map((p: any, i: number) => {
                    const producto = productos.find(prod => prod.id === p.productoId);
                    return (
                      <div 
                        key={i} 
                        className={`grid grid-cols-12 gap-4 px-4 py-3 ${
                          i !== selectedDevolucion.productos.length - 1 ? 'border-b border-border' : ''
                        }`}
                      >
                        <p className="col-span-8 text-foreground">{producto?.nombre || 'N/A'}</p>
                        <p className="col-span-2 text-center text-foreground-secondary">{p.cantidad}</p>
                        <p className="col-span-2 text-right text-foreground-secondary">{producto?.sku || 'N/A'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-surface p-4 rounded-lg border border-border">
                <p className="text-foreground mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>RESUMEN DE DEVOLUCIÓN</p>
                <div className="flex items-center justify-between">
                  <span className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>Total Devuelto:</span>
                  <span className="text-primary" style={{ fontSize: '20px', fontWeight: 700 }}>
                    {formatCurrency(selectedDevolucion.totalDevuelto)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-foreground-secondary pt-4 border-t border-border">
                <p style={{ fontSize: '12px' }}>Este documento es un comprobante de devolución</p>
                <p style={{ fontSize: '12px' }}>GLAMOUR ML - Medellín, Colombia</p>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Estado Change Dialog */}
      <Dialog open={estadoDialogOpen} onOpenChange={setEstadoDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Cambiar Estado de Devolución</DialogTitle>
            <DialogDescription className="sr-only">Formulario para actualizar el estado de la devolución</DialogDescription>
          </DialogHeader>

          {selectedDevolucion && (
            <div className="space-y-4 py-4">
              <div className="bg-surface p-4 rounded-lg">
                <p className="text-foreground-secondary mb-2" style={{ fontSize: '12px' }}>Estado Actual</p>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full ${getEstadoColor(selectedDevolucion.estado).bg}`}>
                  <span className={`${getEstadoColor(selectedDevolucion.estado).text}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                    {getEstadoColor(selectedDevolucion.estado).label}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Seleccionar Nuevo Estado</Label>
                
                {selectedDevolucion.estado === 'pendiente' && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleChangeEstado('en_revision')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Pasar a En Revisión
                    </Button>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                        La devolución pasará a revisión para evaluar la solicitud del cliente.
                      </p>
                    </div>
                  </div>
                )}

                {selectedDevolucion.estado === 'en_revision' && (
                  <>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleChangeEstado('aprobada')}
                          className="bg-success hover:bg-success/90 text-background"
                        >
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => handleChangeEstado('rechazada')}
                          className="bg-danger hover:bg-danger/90 text-background"
                        >
                          Rechazar
                        </Button>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                          <strong className="text-foreground">Aprobar:</strong> Los productos serán devueltos al inventario.<br/>
                          <strong className="text-foreground">Rechazar:</strong> La devolución será rechazada sin afectar el inventario.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <Label className="text-foreground">
                        Motivo de Decisión <span className="text-danger">*</span>
                      </Label>
                      <Textarea
                        value={motivoDecision}
                        onChange={(e) => setMotivoDecision(e.target.value)}
                        className="bg-input-background border-border text-foreground"
                        placeholder="Escriba la razón por la cual está aprobando o rechazando la devolución..."
                        rows={4}
                      />
                      <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                        Este motivo será visible en el detalle de la devolución
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEstadoDialogOpen(false);
                setMotivoDecision('');
              }} 
              className="border-border text-foreground hover:bg-surface"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Anular Devolución Dialog */}
      <Dialog open={anularDialogOpen} onOpenChange={setAnularDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Anular Devolución</DialogTitle>
            <DialogDescription className="sr-only">Formulario para anular una devolución activa</DialogDescription>
          </DialogHeader>

          {selectedDevolucion && (
            <div className="space-y-4 py-4">
              <div className="bg-surface p-4 rounded-lg">
                <p className="text-foreground-secondary mb-2" style={{ fontSize: '12px' }}>Estado Actual</p>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full ${getEstadoColor(selectedDevolucion.estado).bg}`}>
                  <span className={`${getEstadoColor(selectedDevolucion.estado).text}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                    {getEstadoColor(selectedDevolucion.estado).label}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">
                  Motivo de Anulación <span className="text-danger">*</span>
                </Label>
                <Textarea
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Escriba el motivo por el cual está anulando la devolución..."
                  rows={4}
                />
                <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                  Este motivo será visible en el detalle de la devolución
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAnularDialogOpen(false);
                setMotivoAnulacion('');
              }} 
              className="border-border text-foreground hover:bg-surface"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAnularDevolucion} 
              className="bg-danger hover:bg-danger/90 text-background"
              disabled={!motivoAnulacion.trim() || motivoAnulacion.trim().length < 5}
            >
              Anular Devolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}