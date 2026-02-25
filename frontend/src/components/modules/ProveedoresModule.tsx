import { useState } from 'react';
import { useStore, Proveedor } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { StatusBadge } from '../StatusBadge';
import { StatusSwitch } from '../StatusSwitch';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Pencil, Trash2, Eye, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { providerService } from '../../services/providerService';

export function ProveedoresModule() {
  const { proveedores, setProveedores } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    nit: '',
    direccion: '',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  const refreshProvidersLocal = async () => {
    try {
      const data = await providerService.getAll();
      const mapped = data.map(prov => ({
        id: prov.id_proveedor.toString(),
        nombre: prov.nombre,
        email: prov.email || '',
        telefono: prov.telefono || '',
        nit: prov.documento_nit || '',
        direccion: '', // We don't have it in the backend yet
        estado: prov.estado ? 'activo' as const : 'inactivo' as const,
        fechaRegistro: new Date().toISOString(),
      }));
      setProveedores(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenDialog = (proveedor?: Proveedor) => {
    if (proveedor) {
      setEditingProveedor(proveedor);
      setFormData({
        nombre: proveedor.nombre,
        email: proveedor.email,
        telefono: proveedor.telefono,
        nit: proveedor.nit,
        direccion: proveedor.direccion,
        estado: proveedor.estado,
      });
    } else {
      setEditingProveedor(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        nit: '',
        direccion: '',
        estado: 'activo',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.nit.trim()) {
      toast.error('Nombre y NIT son obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        documento_nit: formData.nit.trim(),
        estado: formData.estado === 'activo',
      };

      if (editingProveedor) {
        await providerService.update(Number(editingProveedor.id), payload);
        toast.success('Proveedor actualizado');
      } else {
        await providerService.create(payload);
        toast.success('Proveedor creado');
      }
      
      await refreshProvidersLocal();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProveedor) return;
    try {
      await providerService.delete(Number(selectedProveedor.id));
      await refreshProvidersLocal();
      toast.success('Proveedor eliminado');
      setIsDeleteDialogOpen(false);
      setSelectedProveedor(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProveedores = proveedores.filter(p => 
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nit.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);
  const paginatedProveedores = filteredProveedores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Proveedores"
        subtitle="Gestión de proveedores"
        actionButton={{
          label: 'Nuevo Proveedor',
          icon: Plus,
          onClick: () => handleOpenDialog(),
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
                placeholder="Buscar por nombre o NIT..."
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Nombre</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProveedores.map((proveedor) => (
                <TableRow key={proveedor.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{proveedor.nombre}</TableCell>
                  <TableCell className="text-foreground-secondary">{proveedor.nit}</TableCell>
                  <TableCell className="text-foreground-secondary">{proveedor.email || 'N/A'}</TableCell>
                  <TableCell className="text-foreground-secondary">{proveedor.telefono || 'N/A'}</TableCell>
                  <TableCell>
                    <StatusSwitch 
                      status={proveedor.estado} 
                      onChange={(newStatus) => {
                        providerService.update(Number(proveedor.id), { estado: newStatus === 'activo' }).then(refreshProvidersLocal);
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedProveedor(proveedor); setIsDetailDialogOpen(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(proveedor)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-danger" onClick={() => { setSelectedProveedor(proveedor); setIsDeleteDialogOpen(true); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                totalItems={filteredProveedores.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>{editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Nombre / Razón Social</Label>
              <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>NIT / Documento</Label>
              <Input value={formData.nit} onChange={e => setFormData({...formData, nit: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Detalles del Proveedor</DialogTitle></DialogHeader>
          {selectedProveedor && (
            <div className="space-y-4 py-4">
              <p><strong>Nombre:</strong> {selectedProveedor.nombre}</p>
              <p><strong>NIT:</strong> {selectedProveedor.nit}</p>
              <p><strong>Email:</strong> {selectedProveedor.email || 'N/A'}</p>
              <p><strong>Teléfono:</strong> {selectedProveedor.telefono || 'N/A'}</p>
              <p><strong>Estado:</strong> <StatusBadge status={selectedProveedor.estado} /></p>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsDetailDialogOpen(false)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Eliminar Proveedor</DialogTitle></DialogHeader>
          <p className="py-4 text-center">¿Seguro que deseas eliminar a <strong>{selectedProveedor?.nombre}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-danger text-foreground" onClick={handleConfirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}