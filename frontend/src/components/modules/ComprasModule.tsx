import { useState } from 'react';
import { useStore, Compra } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Plus, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';
import { purchaseService } from '../../services/purchaseService';
import { productService } from '../../services/productService';

export function ComprasModule() {
  const { compras, proveedores, productos, setCompras, setProductos } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    proveedorId: '',
    observaciones: '',
    detalles: [] as { productoId: string; cantidad: number; precioUnitario: number }[],
  });

  const [selectedProductId, setSelectedProductId] = useState('');
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempPrice, setTempPrice] = useState(0);

  const refreshData = async () => {
    try {
      // Refresh compras
      const purchasesResp = await purchaseService.getAll();
      const mappedPurchases = purchasesResp.data.map((purch: any) => ({
        id: purch.id_compra.toString(),
        proveedorId: purch.id_proveedor.toString(),
        fecha: purch.fecha_compra,
        total: Number(purch.total),
        estado: purch.estado ? 'confirmada' as const : 'anulada' as const,
        confirmada: purch.estado,
        observaciones: purch.observaciones || '',
        productos: [],
      }));
      setCompras(mappedPurchases);

      // Refresh products (for stock update)
      const productsResp = await productService.getAll({ limit: 100 });
      const mappedProducts = productsResp.data.map(prod => ({
        id: prod.id_producto.toString(),
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        categoriaId: prod.id_categoria.toString(),
        marca: (prod as any).nombre_marca || 'Genérica',
        precioCompra: Number(prod.costo_promedio) || 0,
        precioVenta: Number(prod.precio_venta) || 0,
        stock: prod.stock_actual || 0,
        stockMinimo: prod.stock_min || 0,
        stockMaximo: prod.stock_max || 100,
        imagenUrl: prod.imagen_url || '',
        estado: prod.estado ? 'activo' as const : 'inactivo' as const,
        fechaCreacion: new Date().toISOString(),
      }));
      setProductos(mappedProducts);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      proveedorId: proveedores[0]?.id || '',
      observaciones: '',
      detalles: [],
    });
    setIsDialogOpen(true);
  };

  const addProductToDetalles = () => {
    if (!selectedProductId) return;
    const prod = productos.find(p => p.id === selectedProductId);
    if (!prod) return;

    setFormData({
      ...formData,
      detalles: [
        ...formData.detalles,
        { productoId: selectedProductId, cantidad: tempQuantity, precioUnitario: tempPrice || prod.precioCompra }
      ]
    });
    setSelectedProductId('');
    setTempQuantity(1);
    setTempPrice(0);
  };

  const handleSave = async () => {
    if (!formData.proveedorId || formData.detalles.length === 0) {
      toast.error('Seleccione un proveedor y al menos un producto');
      return;
    }

    setIsSaving(true);
    try {
      await purchaseService.create({
        id_proveedor: Number(formData.proveedorId),
        observaciones: formData.observaciones,
        detalles: formData.detalles.map(d => ({
          id_producto: Number(d.productoId),
          cantidad: d.cantidad,
          precio_compra: d.precioUnitario,
        }))
      });
      toast.success('Compra registrada y stock actualizado');
      await refreshData();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const filteredCompras = compras.filter(c => {
    const provee = proveedores.find(p => p.id === c.proveedorId);
    return c.id.includes(searchQuery) || (provee?.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const paginatedCompras = filteredCompras.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCompras.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Compras"
        subtitle="Gestión de adquisiciones y stock"
        actionButton={{
          label: 'Nueva Compra',
          icon: Plus,
          onClick: handleOpenDialog,
        }}
      />

      <div className="p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-10 bg-input-background border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Buscar por ID o proveedor..."
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>ID</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCompras.map((compra) => (
                <TableRow key={compra.id} className="border-border">
                  <TableCell className="font-medium text-foreground">#{compra.id}</TableCell>
                  <TableCell>{proveedores.find(p => p.id === compra.proveedorId)?.nombre || 'N/A'}</TableCell>
                  <TableCell className="text-foreground-secondary">{new Date(compra.fecha).toLocaleDateString()}</TableCell>
                  <TableCell className="text-primary font-semibold">{formatCurrency(compra.total)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedCompra(compra); setIsDetailDialogOpen(true); }}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredCompras.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl bg-card border-border">
          <DialogHeader><DialogTitle>Registrar Compra</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Select value={formData.proveedorId} onValueChange={(v: string) => setFormData({...formData, proveedorId: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {proveedores.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Input value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 mb-4">
            <h4 className="mb-2 font-semibold">Agregar Productos</h4>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label>Producto</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger><SelectValue placeholder="Buscar producto" /></SelectTrigger>
                  <SelectContent>
                    {productos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24 space-y-1">
                <Label>Cant.</Label>
                <Input type="number" value={tempQuantity} onChange={e => setTempQuantity(Number(e.target.value))} />
              </div>
              <div className="w-32 space-y-1">
                <Label>Costo Unit.</Label>
                <Input type="number" value={tempPrice} onChange={e => setTempPrice(Number(e.target.value))} />
              </div>
              <Button onClick={addProductToDetalles}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>

          <Table>
            <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Cant.</TableHead><TableHead>Costo</TableHead><TableHead>Subtotal</TableHead></TableRow></TableHeader>
            <TableBody>
              {formData.detalles.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>{productos.find(p => p.id === d.productoId)?.nombre}</TableCell>
                  <TableCell>{d.cantidad}</TableCell>
                  <TableCell>{formatCurrency(d.precioUnitario)}</TableCell>
                  <TableCell>{formatCurrency(d.cantidad * d.precioUnitario)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Registrando...' : 'Registrar Compra'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Detalles de Compra #{selectedCompra?.id}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p><strong>Proveedor:</strong> {proveedores.find(p => p.id === selectedCompra?.proveedorId)?.nombre}</p>
            <p><strong>Fecha:</strong> {selectedCompra && new Date(selectedCompra.fecha).toLocaleString()}</p>
            <p><strong>Total:</strong> {selectedCompra && formatCurrency(selectedCompra.total)}</p>
            <p><strong>Observaciones:</strong> {selectedCompra?.observaciones || 'N/A'}</p>
          </div>
          <DialogFooter><Button onClick={() => setIsDetailDialogOpen(false)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}