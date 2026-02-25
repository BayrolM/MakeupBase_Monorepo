import { useState, useEffect } from 'react';
import { useStore, TipoDocumento, UserRole, Status } from '../../lib/store';
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
import { Plus, Eye, Pencil, Trash2, Search, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

import { userService } from '../../services/userService';

export function UsuariosModule() {
  const { users, setUsers, ventas, pedidos, currentUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
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
    rol: 'cliente' as 'admin' | 'vendedor' | 'cliente' | 'bodeguero',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  const isAdmin = currentUser?.rol === 'admin';

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll({
        q: searchQuery.length >= 2 ? searchQuery : undefined,
        limit: 100 // Cargar suficientes para el store inicial
      });
      // Mapear campos del backend (nombres, id_usuario) a los del frontend (nombre, id)
      const mapped = response.data.map(u => ({
        id: u.id_usuario.toString(),
        nombre: u.nombres || u.nombre,
        apellido: u.apellidos || u.apellido,
        tipoDocumento: u.tipo_documento || 'CC',
        numeroDocumento: u.documento || u.numeroDocumento,
        email: u.email,
        passwordHash: '', // El backend no devuelve el hash por seguridad
        telefono: u.telefono,
        direccion: u.direccion,
        ciudad: u.ciudad,
        rol: (u.nombre_rol?.toLowerCase() === 'admin' ? 'admin' : 
             u.nombre_rol?.toLowerCase() === 'vendedor' ? 'vendedor' : 'cliente') as UserRole,
        estado: (u.estado ? 'activo' : 'inactivo') as Status,
        fechaCreacion: u.fecha_registro || new Date().toISOString()
      }));
      setUsers(mapped);
    } catch (error: any) {
      toast.error('Error al cargar usuarios', { description: error.message });
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleOpenDialog = (user?: any) => {
    if (!isAdmin) {
      toast.error('Acceso denegado', {
        description: 'Solo los administradores pueden crear o editar usuarios.',
      });
      return;
    }

    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        tipoDocumento: user.tipoDocumento,
        numeroDocumento: user.numeroDocumento,
        fechaNacimiento: user.fechaNacimiento || '',
        email: user.email,
        passwordHash: user.passwordHash,
        telefono: user.telefono,
        direccion: user.direccion || '',
        ciudad: user.ciudad || '',
        pais: user.pais || 'Colombia',
        rol: user.rol,
        estado: user.estado,
      });
    } else {
      setEditingUser(null);
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
        rol: 'cliente',
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

    if (formData.numeroDocumento.trim().length > 30) {
      toast.error('Documento demasiado largo', { description: 'El número de documento no debe superar 30 caracteres.' });
      return false;
    }

    const docExists = users.some(
      u => u.numeroDocumento === formData.numeroDocumento.trim() && (!editingUser || u.id !== editingUser.id)
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

    if (formData.email.trim().length > 150) {
      toast.error('Email demasiado largo', { description: 'El correo electrónico no debe superar 150 caracteres.' });
      return false;
    }

    const emailExists = users.some(
      u => u.email.toLowerCase() === formData.email.trim().toLowerCase() && (!editingUser || u.id !== editingUser.id)
    );
    if (emailExists) {
      toast.error('Email duplicado', { description: 'Ya existe un usuario con este correo electrónico.' });
      return false;
    }

    if (!editingUser && !formData.passwordHash.trim()) {
      toast.error('Campo obligatorio', { description: 'La contraseña es obligatoria para nuevos usuarios.' });
      return false;
    }

    if (!formData.telefono.trim()) {
      toast.error('Campo obligatorio', { description: 'El teléfono es obligatorio.' });
      return false;
    }

    if (formData.telefono.trim().length > 20) {
      toast.error('Teléfono demasiado largo', { description: 'El teléfono no debe superar 20 caracteres.' });
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
      const userData = {
        id_rol: formData.rol === 'admin' ? 1 : formData.rol === 'vendedor' ? 2 : 3,
        nombres: formData.nombre.trim(),
        apellidos: formData.apellido.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim() || undefined,
        ciudad: formData.ciudad.trim() || undefined,
        estado: formData.estado === 'activo'
      };

      if (editingUser) {
        await userService.update(editingUser.id, userData);
        toast.success('Usuario actualizado correctamente');
      } else {
        // Para crear nuevos usamos register del authService o un endpoint de admin
        // Por ahora asumimos que el endpoint de actualización maneja creación si implementamos POST
        toast.info('La creación se realiza desde el registro público o una ruta POST no implementada aún');
      }

      await fetchUsers();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error('Error al procesar usuario', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDetailDialog = (user: any) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: any) => {
    if (!isAdmin) {
      toast.error('Acceso denegado', {
        description: 'Solo los administradores pueden eliminar usuarios.',
      });
      return;
    }

    const userExists = users.find(u => u.id === user.id);
    if (!userExists) {
      toast.error('Usuario no encontrado', {
        description: 'El usuario que intentas eliminar no existe o ya fue eliminado.',
      });
      return;
    }

    // Check dependencies
    const ventasCount = ventas.filter(v => v.clienteId === user.id).length;
    const pedidosCount = pedidos.filter(p => p.clienteId === user.id).length;

    if (ventasCount > 0 || pedidosCount > 0) {
      toast.error('No se puede eliminar un usuario con transacciones asociadas', {
        description: `Este usuario tiene ${ventasCount + pedidosCount} transacción(es) asociada(s). Desactívalo en lugar de eliminarlo.`,
      });
      return;
    }

    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);

    try {
      await userService.deactivate(selectedUser.id);
      toast.success('Usuario desactivado correctamente');
      await fetchUsers();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error('No se pudo desactivar el usuario', { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery || searchQuery.length < 2) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.nombre.toLowerCase().includes(query) ||
      user.apellido.toLowerCase().includes(query) ||
      (user.nombre + ' ' + user.apellido).toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.numeroDocumento.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      vendedor: 'Vendedor',
      cliente: 'Cliente',
      bodeguero: 'Bodeguero',
    };
    return labels[rol] || rol;
  };

  const getTipoDocumentoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      CC: 'Cédula de Ciudadanía',
      TI: 'Tarjeta de Identidad',
      CE: 'Cédula de Extranjería',
      PAS: 'Pasaporte',
      NIT: 'NIT',
      OTRO: 'Otro',
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Usuarios"
        subtitle="Gestión completa de usuarios del sistema"
        actionButton={{
          label: 'Nuevo Usuario',
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
                  placeholder="Buscar por nombre, apellido, email o documento..."
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
                <span className="text-primary" style={{ fontWeight: 500 }}>{filteredUsers.length} {filteredUsers.length === 1 ? 'resultado' : 'resultados'}</span>
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
                  Mostrando {filteredUsers.length} de {users.length} usuarios
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
                <TableHead className="text-foreground-secondary">Rol</TableHead>
                <TableHead className="text-foreground-secondary">Estado</TableHead>
                <TableHead className="text-foreground-secondary text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-foreground-secondary" />
                      </div>
                      <p className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                        No hay usuarios registrados
                      </p>
                      <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                        Comienza agregando tu primer usuario al sistema
                      </p>
                      {isAdmin && (
                        <Button
                          onClick={() => handleOpenDialog()}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-4"
                        >
                          <Plus className="w-4 h-4" />
                          Nuevo Usuario
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 && searchQuery.length >= 2 ? (
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
                        No hay usuarios que coincidan con "{searchQuery}"
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
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-foreground">{user.nombre} {user.apellido}</TableCell>
                    <TableCell className="text-foreground-secondary">{user.tipoDocumento}</TableCell>
                    <TableCell className="text-foreground">{user.numeroDocumento}</TableCell>
                    <TableCell className="text-foreground-secondary">{user.email}</TableCell>
                    <TableCell className="text-foreground">{user.telefono}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                        {getRolLabel(user.rol)}
                      </span>
                    </TableCell>
                     <TableCell>
                      <StatusSwitch
                        status={user.estado}
                        onChange={async (newStatus) => {
                          try {
                            await userService.update(user.id, { estado: newStatus === 'activo' });
                            await fetchUsers();
                          } catch (e: any) {
                            toast.error('Error al cambiar estado');
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetailDialog(user)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-primary-light hover:text-primary hover:bg-surface/80 transition-all"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDialog(user)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-primary-light hover:text-primary hover:bg-surface/80 transition-all"
                          title="Editar usuario"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDialog(user)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-danger hover:text-danger/80 hover:bg-danger/10 transition-all"
                          title="Eliminar usuario"
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

        {filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
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
      <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
        if (!open && !isSaving) {
          setIsDialogOpen(false);
        }
      }}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription className="text-foreground-secondary">
              {editingUser
                ? 'Modifica la información del usuario existente'
                : 'Completa los campos para registrar un nuevo usuario'}
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
                    <SelectItem value="NIT" className="text-foreground">NIT</SelectItem>
                    <SelectItem value="OTRO" className="text-foreground">Otro</SelectItem>
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
                <Label htmlFor="fechaNacimiento" className="text-foreground">
                  Fecha de Nacimiento
                </Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  disabled={isSaving}
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
                placeholder="Ej: usuario@correo.com"
                disabled={isSaving}
                maxLength={150}
              />
            </div>

            {!editingUser && (
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

              <div className="space-y-2">
                <Label htmlFor="pais" className="text-foreground">
                  País
                </Label>
                <Input
                  id="pais"
                  value={formData.pais}
                  onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  placeholder="Ej: Colombia"
                  disabled={isSaving}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rol" className="text-foreground">
                  Rol <span className="text-danger">*</span>
                </Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value: 'admin' | 'vendedor' | 'cliente' | 'bodeguero') => setFormData({ ...formData, rol: value })}
                  disabled={isSaving}
                >
                  <SelectTrigger className="bg-input-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="admin" className="text-foreground">Administrador</SelectItem>
                    <SelectItem value="vendedor" className="text-foreground">Vendedor</SelectItem>
                    <SelectItem value="bodeguero" className="text-foreground">Bodeguero</SelectItem>
                    <SelectItem value="cliente" className="text-foreground">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingUser && (
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

            {!editingUser && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-foreground-secondary" style={{ fontSize: '13px' }}>
                  <span className="text-primary" style={{ fontWeight: 600 }}>Nota:</span> El usuario se creará con estado "Activo" por defecto.
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
                  {editingUser ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {editingUser ? '💾 Actualizar' : '✨ Crear Usuario'}
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
            <DialogTitle className="text-foreground">Detalles del Usuario</DialogTitle>
            <DialogDescription className="sr-only">
              Información completa del usuario seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Nombre Completo</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedUser.nombre} {selectedUser.apellido}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Email</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Tipo de Documento</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{getTipoDocumentoLabel(selectedUser.tipoDocumento)}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Número de Documento</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedUser.numeroDocumento}</p>
                </div>
                {selectedUser.fechaNacimiento && (
                  <div>
                    <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Fecha de Nacimiento</Label>
                    <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{new Date(selectedUser.fechaNacimiento).toLocaleDateString('es-CO')}</p>
                  </div>
                )}
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Teléfono</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedUser.telefono}</p>
                </div>
                {selectedUser.direccion && (
                  <div className="col-span-2">
                    <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Dirección</Label>
                    <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedUser.direccion}</p>
                  </div>
                )}
                {selectedUser.ciudad && (
                  <div>
                    <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Ciudad</Label>
                    <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedUser.ciudad}</p>
                  </div>
                )}
                {selectedUser.pais && (
                  <div>
                    <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>País</Label>
                    <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{selectedUser.pais}</p>
                  </div>
                )}
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Rol</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{getRolLabel(selectedUser.rol)}</p>
                </div>
                <div>
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Estado</Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedUser.estado} size="sm" />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-foreground-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Fecha de Registro</Label>
                  <p className="text-foreground mt-1" style={{ fontSize: '15px' }}>{new Date(selectedUser.fechaCreacion).toLocaleDateString('es-CO')}</p>
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open: boolean) => {
        if (!open && !isDeleting) {
          setIsDeleteDialogOpen(false);
        }
      }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Eliminar Usuario</DialogTitle>
            <DialogDescription className="sr-only">
              Confirmación para eliminar el usuario del sistema
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-foreground text-center">
              ¿Estás seguro de que deseas eliminar el usuario <span style={{ fontWeight: 600 }}>{selectedUser?.nombre} {selectedUser?.apellido}</span>?
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
                '🗑️ Eliminar Usuario'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}