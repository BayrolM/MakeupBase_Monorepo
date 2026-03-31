import { useState, useEffect } from 'react';
import { useStore, Cliente, Status } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { StatusBadge } from '../StatusBadge';
import { StatusSwitch } from '../StatusSwitch';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../../services/userService';

export function ClientesModule() {
  const { clientes, setClientes } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    documento: '',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  const fetchClientes = async () => {
    try {
      const response = await userService.getAll({ 
        id_rol: 2,
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery
      });
      
      setTotalItems(response.total || 0);
      const mapped: Cliente[] = response.data.map((u: any) => {
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
          estado: (u.estado ? 'activo' as const : 'inactivo' as const) as Status,
          totalCompras: Number(u.total_ventas) || 0,
          fechaRegistro: u.fecha_registro || new Date().toISOString(),
          foto_perfil: u.foto_perfil
        };
      });
      setClientes(mapped);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar clientes');
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleOpenDialog = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        documento: cliente.documento,
        estado: cliente.estado,
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        documento: '',
        estado: 'activo',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userData = {
        nombres: formData.nombre.split(' ')[0],
        apellidos: formData.nombre.split(' ').slice(1).join(' '),
        telefono: formData.telefono,
        estado: formData.estado === 'activo'
      };

      if (editingCliente) {
        await userService.update(editingCliente.id, userData);
        toast.success('Cliente actualizado correctamente');
      } else {
        await userService.create({
          ...userData,
          id_rol: 2, // Cliente
          email: formData.email,
          documento: formData.documento,
          tipo_documento: 'CC',
          password_hash: formData.documento // Password inicial por defecto es su documento
        });
        toast.success('Cliente creado correctamente');
      }
      
      await fetchClientes();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error('Error al guardar cliente', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDetailDialog = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDetailDialogOpen(true);
  };

  const handleOpenDeleteDialog = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCliente) {
      try {
        await userService.deactivate(selectedCliente.id);
        toast.success('Cliente desactivado correctamente');
        await fetchClientes();
        setIsDeleteDialogOpen(false);
        setSelectedCliente(null);
      } catch (error: any) {
        toast.error('Error al desactivar cliente');
      }
    }
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
        title="Clientes"
        subtitle="Gestión de clientes"
        actionButton={{
          label: 'Nuevo Cliente',
          icon: Plus,
          onClick: () => handleOpenDialog(),
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
                  placeholder="Buscar por nombre, email o documento..."
                />
              </div>
            </div>
            <div>
              <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                Mostrando {clientes.length} de {totalItems} clientes
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground-secondary">Documento</TableHead>
                <TableHead className="text-foreground-secondary">Nombre</TableHead>
                <TableHead className="text-foreground-secondary">Email</TableHead>
                <TableHead className="text-foreground-secondary">Teléfono</TableHead>
                <TableHead className="text-foreground-secondary">Estado</TableHead>
                <TableHead className="text-foreground-secondary text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-foreground-secondary">
                      {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay clientes registrados'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((cliente) => (
                  <TableRow key={cliente.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-foreground">{cliente.documento}</TableCell>
                    <TableCell className="text-foreground">{cliente.nombre}</TableCell>
                    <TableCell className="text-foreground-secondary">{cliente.email}</TableCell>
                    <TableCell className="text-foreground-secondary">{cliente.telefono}</TableCell>
                    <TableCell>
                      <StatusSwitch 
                        status={cliente.estado} 
                        onChange={async (newStatus) => {
                          try {
                            await userService.update(cliente.id, { estado: newStatus === 'activo' });
                            await fetchClientes();
                          } catch (e: any) {
                            toast.error('Error al cambiar estado');
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetailDialog(cliente)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-primary-light hover:text-primary hover:bg-surface/80 transition-all"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDialog(cliente)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-primary-light hover:text-primary hover:bg-surface/80 transition-all"
                          title="Editar cliente"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDialog(cliente)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-danger hover:text-danger/80 hover:bg-danger/10 transition-all"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-5 h-5" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingCliente ? 'Formulario para editar información del cliente' : 'Formulario para crear un nuevo cliente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-foreground">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-input-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-input-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-foreground">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="bg-input-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento" className="text-foreground">Documento</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                className="bg-input-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado" className="text-foreground">Estado</Label>
              <Select value={formData.estado} onValueChange={(value: 'activo' | 'inactivo') => setFormData({ ...formData, estado: value })}>
                <SelectTrigger className="bg-input-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="activo" className="text-foreground">Activo</SelectItem>
                  <SelectItem value="inactivo" className="text-foreground">Inactivo</SelectItem>
                </SelectContent>
              </Select>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]"
            >
              {isSaving ? 'Guardando...' : (editingCliente ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalles del Cliente</DialogTitle>
            <DialogDescription className="sr-only">Información completa del cliente seleccionado</DialogDescription>
          </DialogHeader>
          
          {selectedCliente && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground-secondary">Nombre</Label>
                  <p className="text-foreground">{selectedCliente.nombre}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary">Documento</Label>
                  <p className="text-foreground">{selectedCliente.documento}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary">Email</Label>
                  <p className="text-foreground">{selectedCliente.email}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary">Teléfono</Label>
                  <p className="text-foreground">{selectedCliente.telefono}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary">Total Compras</Label>
                  <p className="text-foreground">{selectedCliente.totalCompras}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary">Estado</Label>
                  <StatusBadge status={selectedCliente.estado} size="sm" />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Eliminar Cliente</DialogTitle>
            <DialogDescription className="sr-only">Confirmación para eliminar el cliente del sistema</DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-foreground text-center">
              ¿Estás seguro de que deseas eliminar el cliente <span className="font-semibold">{selectedCliente?.nombre}</span>?
            </p>
            <p className="text-foreground-secondary text-center mt-2" style={{ fontSize: '14px' }}>
              Esta acción no se puede deshacer.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-border text-foreground hover:bg-surface flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-danger hover:bg-danger/90 text-foreground flex-1"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
