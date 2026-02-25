import { useState, useEffect } from 'react';
import { useStore, TipoDocumento } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { StatusBadge } from '../StatusBadge';
import { StatusSwitch } from '../StatusSwitch';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { Plus, Eye, Pencil, Trash2, Search, AlertTriangle, X, UserCheck } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ClientesViewModule() {
  const { users, ventas, pedidos, addUser, updateUser, deleteUser, currentUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    fechaNacimiento: '',
    email: '',
    passwordHash: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: 'Colombia',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  const isAdmin = currentUser?.rol === 'admin';

  // Filter only clients (cliente role)
  const clientes = users.filter(user => user.rol === 'cliente');

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenDialog = (cliente?: any) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        tipoDocumento: cliente.tipoDocumento,
        numeroDocumento: cliente.numeroDocumento,
        fechaNacimiento: cliente.fechaNacimiento || '',
        email: cliente.email,
        passwordHash: cliente.passwordHash,
        telefono: cliente.telefono,
        direccion: cliente.direccion || '',
        ciudad: cliente.ciudad || '',
        pais: cliente.pais || 'Colombia',
        estado: cliente.estado,
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombre: '',
        apellido: '',
        tipoDocumento: 'CC',
        numeroDocumento: '',
        fechaNacimiento: '',
        email: '',
        passwordHash: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        pais: 'Colombia',
        estado: 'activo',
      });
    }
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      toast.error('Campo obligatorio', { description: 'El nombre es obligatorio.' });
      return false;
    }

    if (!formData.apellido.trim()) {
      toast.error('Campo obligatorio', { description: 'El apellido es obligatorio.' });
      return false;
    }

    if (formData.nombre.trim().length > 100) {
      toast.error('Nombre demasiado largo', { description: 'El nombre no debe superar 100 caracteres.' });
      return false;
    }

    if (formData.apellido.trim().length > 100) {
      toast.error('Apellido demasiado largo', { description: 'El apellido no debe superar 100 caracteres.' });
      return false;
    }

    if (!formData.numeroDocumento.trim()) {
      toast.error('Campo obligatorio', { description: 'El número de documento es obligatorio.' });
      return false;
    }

    const docExists = users.some(
      u => u.numeroDocumento === formData.numeroDocumento.trim() && (!editingCliente || u.id !== editingCliente.id)
    );
    if (docExists) {
      toast.error('Documento duplicado', { description: 'Ya existe un usuario con este número de documento.' });
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('Campo obligatorio', { description: 'El correo electrónico es obligatorio.' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Email inválido', { description: 'Por favor ingresa un correo electrónico válido.' });
      return false;
    }

    const emailExists = users.some(
      u => u.email.toLowerCase() === formData.email.trim().toLowerCase() && (!editingCliente || u.id !== editingCliente.id)
    );
    if (emailExists) {
      toast.error('Email duplicado', { description: 'Ya existe un usuario con este correo electrónico.' });
      return false;
    }

    if (!editingCliente && !formData.passwordHash.trim()) {
      toast.error('Campo obligatorio', { description: 'La contraseña es obligatoria para nuevos clientes.' });
      return false;
    }

    if (!formData.telefono.trim()) {
      toast.error('Campo obligatorio', { description: 'El teléfono es obligatorio.' });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const clienteData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento.trim(),
        fechaNacimiento: formData.fechaNacimiento || undefined,
        email: formData.email.trim(),
        passwordHash: formData.passwordHash || editingCliente?.passwordHash || 'hashed_password',
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim() || undefined,
        ciudad: formData.ciudad.trim() || undefined,
        pais: formData.pais.trim() || undefined,
        rol: 'cliente' as const,
        estado: formData.estado,
      };

      if (editingCliente) {
        updateUser(editingCliente.id, clienteData);
        toast.success('Cliente actualizado correctamente', {
          description: `${clienteData.nombre} ${clienteData.apellido} ha sido actualizado exitosamente.`,
        });
      } else {
        addUser(clienteData);
        toast.success('Cliente registrado exitosamente', {
          description: `${clienteData.nombre} ${clienteData.apellido} ha sido agregado al sistema.`,
        });
      }

      setIsDialogOpen(false);
      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      toast.error(editingCliente ? 'No se pudo actualizar el cliente' : 'Error al registrar el cliente', {
        description: 'Inténtalo nuevamente.',
      });
    }
  };

  const handleOpenDetailDialog = (cliente: any) => {
    setSelectedCliente(cliente);
    setIsDetailDialogOpen(true);
  };

  const handleOpenDeleteDialog = (cliente: any) => {
    const clienteExists = users.find(u => u.id === cliente.id);
    if (!clienteExists) {
      toast.error('Cliente no encontrado', {
        description: 'El cliente que intentas eliminar no existe o ya fue eliminado.',
      });
      return;
    }

    // Check dependencies
    const ventasCount = ventas.filter(v => v.clienteId === cliente.id).length;
    const pedidosCount = pedidos.filter(p => p.clienteId === cliente.id).length;

    if (ventasCount > 0 || pedidosCount > 0) {
      toast.error('No se puede eliminar un cliente con transacciones asociadas', {
        description: `Este cliente tiene ${ventasCount + pedidosCount} transacción(es) asociada(s). Desactívalo en lugar de eliminarlo.`,
      });
      return;
    }

    setSelectedCliente(cliente);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCliente) return;

    setIsDeleting(true);

    try {
      deleteUser(selectedCliente.id);
      toast.success('Cliente eliminado correctamente', {
        description: `${selectedCliente.nombre} ${selectedCliente.apellido} ha sido eliminado del sistema.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedCliente(null);
      setIsDeleting(false);
    } catch (error) {
      setIsDeleting(false);
      toast.error('No se pudo eliminar el cliente', {
        description: 'Ocurrió un error durante la eliminación. Inténtalo nuevamente.',
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const filteredClientes = clientes.filter(cliente => {
    if (!searchQuery || searchQuery.length < 2) return true;

    const query = searchQuery.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(query) ||
      cliente.apellido.toLowerCase().includes(query) ||
      (cliente.nombre + ' ' + cliente.apellido).toLowerCase().includes(query) ||
      cliente.email.toLowerCase().includes(query) ||
      cliente.numeroDocumento.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Clientes"
        subtitle="Gestión de clientes registrados"
        actionButton={{
          label: 'Nuevo Cliente',
          icon: Plus,
          onClick: () => handleOpenDialog(),
        }}
      />

      <div className="p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-10 bg-input-background border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Buscar cliente por nombre, email o documento..."
                  maxLength={100}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {searchQuery && searchQuery.length >= 2 && (
              <div className="flex items-center gap-2 text-foreground-secondary" style={{ fontSize: '14px' }}>
                <span>Resultados para: <span className="text-foreground" style={{ fontWeight: 600 }}>"{searchQuery}"</span></span>
                <span className="text-foreground-secondary">·</span>
                <span className="text-primary" style={{ fontWeight: 500 }}>{filteredClientes.length} {filteredClientes.length === 1 ? 'resultado' : 'resultados'}</span>
                <button
                  onClick={handleClearSearch}
                  className="text-primary hover:text-primary/80 transition-colors ml-2"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  Limpiar
                </button>
              </div>
            )}

            {searchQuery && searchQuery.length === 1 && (
              <div className="p-3 rounded-lg bg-info/10 border border-info/30">
                <p className="text-info" style={{ fontSize: '13px' }}>
                  Escribe al menos 2 caracteres para comenzar la búsqueda
                </p>
              </div>
            )}

            <div>
              <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                <>
                  Mostrando {filteredClientes.length} de {clientes.length} clientes
                  {searchQuery && searchQuery.length >= 2 && ` · Filtrado en tiempo real`}
                </>
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground-secondary">Nombre Completo</TableHead>
                <TableHead className="text-foreground-secondary">Tipo Doc</TableHead>
                <TableHead className="text-foreground-secondary">Documento</TableHead>
                <TableHead className="text-foreground-secondary">Email</TableHead>
                <TableHead className="text-foreground-secondary">Teléfono</TableHead>
                <TableHead className="text-foreground-secondary">Ciudad</TableHead>
                <TableHead className="text-foreground-secondary">Estado</TableHead>
                <TableHead className="text-foreground-secondary text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-foreground-secondary" />
                      </div>
                      <p className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                        No hay clientes registrados
                      </p>
                      <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                        Comienza agregando tu primer cliente al sistema
                      </p>
                      <Button
                        onClick={() => handleOpenDialog()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        Nuevo Cliente
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClientes.length === 0 && searchQuery.length >= 2 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                        <Search className="w-6 h-6 text-foreground-secondary" />
                      </div>
                      <p className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                        No se encontraron resultados
                      </p>
                      <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                        No hay clientes que coincidan con "{searchQuery}"
                      </p>
                      <Button
                        onClick={handleClearSearch}
                        variant="outline"
                        className="mt-2 border-border text-foreground hover:bg-surface"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpiar búsqueda
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-foreground">{cliente.nombre} {cliente.apellido}</TableCell>
                    <TableCell className="text-foreground-secondary">{cliente.tipoDocumento}</TableCell>
                    <TableCell className="text-foreground">{cliente.numeroDocumento}</TableCell>
                    <TableCell className="text-foreground-secondary">{cliente.email}</TableCell>
                    <TableCell className="text-foreground">{cliente.telefono}</TableCell>
                    <TableCell className="text-foreground-secondary">{cliente.ciudad || 'N/A'}</TableCell>
                    <TableCell>
                      <StatusSwitch
                        status={cliente.estado}
                        onChange={(newStatus) => updateUser(cliente.id, { estado: newStatus })}
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

        {filteredClientes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredClientes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open && !isSaving) {
          setIsDialogOpen(false);
        }
      }}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription className="text-foreground-secondary">
              {editingCliente
                ? 'Modifica la información del cliente existente'
                : 'Completa los campos para registrar un nuevo cliente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-foreground">
                  Nombre <span className="text-danger">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Ej: Juan"
                  disabled={isSaving}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-foreground">
                  Apellido <span className="text-danger">*</span>
                </Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Ej: Pérez"
                  disabled={isSaving}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento" className="text-foreground">
                  Tipo de Documento <span className="text-danger">*</span>
                </Label>
                <Select
                  value={formData.tipoDocumento}
                  onValueChange={(value: TipoDocumento) => setFormData({ ...formData, tipoDocumento: value })}
                  disabled={isSaving}
                >
                  <SelectTrigger className="bg-input-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="CC" className="text-foreground">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="TI" className="text-foreground">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="CE" className="text-foreground">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PAS" className="text-foreground">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroDocumento" className="text-foreground">
                  Número de Documento <span className="text-danger">*</span>
                </Label>
                <Input
                  id="numeroDocumento"
                  value={formData.numeroDocumento}
                  onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Ej: 1234567890"
                  disabled={isSaving}
                  maxLength={30}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email <span className="text-danger">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Ej: cliente@correo.com"
                  disabled={isSaving}
                  maxLength={150}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-foreground">
                  Teléfono <span className="text-danger">*</span>
                </Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Ej: 3001234567"
                  disabled={isSaving}
                  maxLength={20}
                />
              </div>
            </div>

            {!editingCliente && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Contraseña <span className="text-danger">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.passwordHash}
                  onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Ingresa una contraseña segura"
                  disabled={isSaving}
                  maxLength={255}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-foreground">
                Dirección
              </Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="bg-input-background border-border text-foreground"
                placeholder="Ej: Calle 50 #30-20"
                disabled={isSaving}
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad" className="text-foreground">
                  Ciudad
                </Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Ej: Medellín"
                  disabled={isSaving}
                  maxLength={100}
                />
              </div>

              {editingCliente && (
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-foreground">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value: 'activo' | 'inactivo') => setFormData({ ...formData, estado: value })}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="bg-input-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="activo" className="text-foreground">Activo</SelectItem>
                      <SelectItem value="inactivo" className="text-foreground">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {!editingCliente && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>
                  <span className="text-primary" style={{ fontWeight: 600 }}>Nota:</span> El cliente se creará con estado "Activo" por defecto.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-border text-foreground hover:bg-surface"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  {editingCliente ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {editingCliente ? '💾 Actualizar' : '✨ Crear Cliente'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalles del Cliente</DialogTitle>
            <DialogDescription className="sr-only">
              Información completa del cliente seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedCliente && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Nombre Completo</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedCliente.nombre} {selectedCliente.apellido}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Email</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedCliente.email}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Documento</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedCliente.tipoDocumento} {selectedCliente.numeroDocumento}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Teléfono</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedCliente.telefono}</p>
                </div>
                {selectedCliente.ciudad && (
                  <div>
                    <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Ciudad</Label>
                    <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedCliente.ciudad}</p>
                  </div>
                )}
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Estado</Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedCliente.estado} size="sm" />
                  </div>
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setIsDeleteDialogOpen(false);
        }
      }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Eliminar Cliente</DialogTitle>
            <DialogDescription className="sr-only">
              Confirmación para eliminar el cliente del sistema
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-foreground text-center">
              ¿Estás seguro de que deseas eliminar el cliente <span style={{ fontWeight: 600 }}>{selectedCliente?.nombre} {selectedCliente?.apellido}</span>?
            </p>
            <p className="text-foreground-secondary text-center mt-2" style={{ fontSize: '14px' }}>
              Esta acción no se puede deshacer.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-border text-foreground hover:bg-surface"
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-danger hover:bg-danger/90 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                '🗑️ Eliminar Cliente'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}