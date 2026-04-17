import { useState, useEffect } from 'react';
import { useStore, TipoDocumento, Status } from '../../lib/store';
import { Pagination } from '../Pagination';
import { toast } from 'sonner';
import { userService } from '../../services/userService';
import { validateField } from '../../utils/usuarioUtils';

// Sub-componentes
import { UsuarioHeader } from './usuarios/UsuarioHeader';
import { UsuarioTable } from './usuarios/UsuarioTable';
import { UsuarioFormDialog } from './usuarios/UsuarioFormDialog';
import { UsuarioDetailDialog } from './usuarios/UsuarioDetailDialog';
import { UsuarioDeleteDialog } from './usuarios/UsuarioDeleteDialog';

export function UsuariosModule() {
  const { users, setUsers, pedidos, currentUser } = useStore();
  
  // Estados de Diálogos
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Estados de carga y datos
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Formulario
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    fechaNacimiento: '',
    email: '',
    passwordHash: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: 'Colombia',
    rol: 'cliente' as any,
    estado: 'activo' as Status,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isAdmin = currentUser?.rol === 'admin';

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll({
        q: searchQuery.length >= 2 ? searchQuery : undefined,
        limit: 100,
      });
      const mapped = response.data.map((u: any) => ({
        id: u.id_usuario.toString(),
        nombres: u.nombres || u.nombre,
        apellidos: u.apellidos || u.apellido,
        tipoDocumento: u.tipo_documento || 'CC',
        numeroDocumento: u.documento || u.numeroDocumento,
        email: u.email,
        passwordHash: '',
        telefono: u.telefono,
        direccion: u.direccion,
        ciudad: u.ciudad,
        rol: (Number(u.id_rol) === 1 ? 'admin' : Number(u.id_rol) === 2 ? 'cliente' : 'vendedor') as any,
        estado: (u.estado ? 'activo' : 'inactivo') as Status,
        fechaCreacion: u.fecha_registro || new Date().toISOString(),
      }));
      setUsers(mapped);
    } catch (error: any) {
      toast.error('Error al cargar usuarios', { description: error.message });
    }
  };

  useEffect(() => { fetchUsers(); }, [searchQuery]);

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value, editingUser);
    
    if (name === 'email' && !error) {
      const emailExists = users.some(u => u.email.toLowerCase() === value.trim().toLowerCase() && (!editingUser || u.id !== editingUser.id));
      setFieldErrors(prev => ({ ...prev, [name]: emailExists ? 'Este email ya está registrado' : '' }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleOpenDialog = (user?: any) => {
    if (!isAdmin) { toast.error('Solo los administradores pueden gestionar usuarios.'); return; }
    if (user && user.estado === 'inactivo') {
      toast.error('Usuario inactivo', { description: 'Debes activar el usuario antes de poder editarlo.' });
      return;
    }
    
    if (user) {
      setEditingUser(user);
      setFormData({
        nombres: user.nombres, apellidos: user.apellidos,
        tipoDocumento: user.tipoDocumento, numeroDocumento: user.numeroDocumento,
        fechaNacimiento: user.fechaNacimiento || '', email: user.email,
        passwordHash: '', telefono: user.telefono,
        direccion: user.direccion || '', ciudad: user.ciudad || '',
        pais: user.pais || 'Colombia', rol: user.rol, estado: user.estado,
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombres: '', apellidos: '', tipoDocumento: 'CC', numeroDocumento: '',
        fechaNacimiento: '', email: '', passwordHash: '', telefono: '',
        direccion: '', ciudad: '', pais: 'Colombia', rol: 'cliente', estado: 'activo',
      });
    }
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    const fields = ['nombres', 'apellidos', 'numeroDocumento', 'email', 'telefono', 'direccion', 'ciudad'];
    if (!editingUser) fields.push('passwordHash');
    const newErrors: Record<string, string> = {};
    fields.forEach(f => {
      const err = validateField(f, (formData as any)[f] || '', editingUser);
      if (err) newErrors[f] = err;
    });
    
    const emailExists = users.some(u => u.email.toLowerCase() === formData.email.trim().toLowerCase() && (!editingUser || u.id !== editingUser.id));
    if (emailExists) newErrors.email = 'Este email ya está registrado';
    
    const docExists = users.some(u => u.numeroDocumento === formData.numeroDocumento.trim() && (!editingUser || u.id !== editingUser.id));
    if (docExists) newErrors.numeroDocumento = 'Ya existe un usuario con este documento';

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Corrige los errores antes de continuar');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const userData = {
        id_rol: formData.rol === 'admin' ? 1 : 2,
        nombres: formData.nombres.trim(), 
        apellidos: formData.apellidos.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim() || undefined,
        ciudad: formData.ciudad.trim() || undefined,
        estado: formData.estado === 'activo',
      };
      
      if (editingUser) {
        await userService.update(editingUser.id, userData);
        toast.success('Usuario actualizado correctamente');
      } else {
        await userService.create({ 
          ...userData, 
          tipo_documento: formData.tipoDocumento, 
          documento: formData.numeroDocumento, 
          email: formData.email, 
          password_hash: formData.passwordHash 
        });
        toast.success('Usuario creado correctamente');
      }
      await fetchUsers();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error('Error al procesar usuario', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteDialog = (user: any) => {
    if (!isAdmin) { toast.error('Solo los administradores pueden eliminar usuarios.'); return; }
    if (user.rol === 'admin') {
      toast.error('No permitido', { description: 'No se puede eliminar a un usuario administrador.' });
      return;
    }
    
    const pedidosActivos = pedidos.filter(p =>
      p.clienteId === user.id &&
      !['entregado', 'cancelado'].includes(p.estado)
    );
    if (pedidosActivos.length > 0) {
      toast.error('No se puede eliminar este usuario', {
        description: `Tiene ${pedidosActivos.length} pedido(s) activo(s). Deben estar entregados o cancelados primero.`,
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
      await userService.deletePermanent(selectedUser.id);
      toast.success('Usuario eliminado correctamente');
      await fetchUsers();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error('No se pudo eliminar el usuario', { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (user: any, newStatus: 'activo' | 'inactivo') => {
    try {
      await userService.update(user.id, { estado: newStatus === 'activo' });
      await fetchUsers();
      toast.success(`Usuario ${newStatus === 'activo' ? 'activado' : 'desactivado'}`);
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery || searchQuery.length < 2) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.nombres.toLowerCase().includes(q) ||
      user.apellidos.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.numeroDocumento.includes(q)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <UsuarioHeader 
        isAdmin={isAdmin} 
        onOpenDialog={handleOpenDialog} 
      />

      <div className="px-8 pb-8">
        <UsuarioTable 
          users={paginatedUsers}
          pedidos={pedidos}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          onViewDetail={(u) => { setSelectedUser(u); setIsDetailDialogOpen(true); }}
          onEdit={handleOpenDialog}
          onDelete={handleOpenDeleteDialog}
          onStatusChange={handleStatusChange}
          isAdmin={isAdmin}
        />

        {filteredUsers.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          </div>
        )}
      </div>

      <UsuarioFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingUser={editingUser}
        formData={formData}
        fieldErrors={fieldErrors}
        isSaving={isSaving}
        onFieldChange={handleFieldChange}
        onSelectChange={(name, val) => setFormData(p => ({ ...p, [name]: val }))}
        onSave={handleSave}
      />

      <UsuarioDetailDialog 
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        user={selectedUser}
      />

      <UsuarioDeleteDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        user={selectedUser}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
