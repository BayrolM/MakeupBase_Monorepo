import { useState } from 'react';
import { useStore, User, UserRole } from '../../lib/store';
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
import { Plus, Pencil, Trash2, FileDown, Search, Eye } from 'lucide-react';

export function UsersModule() {
  const { users, addUser, updateUser, deleteUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol: 'vendedor' as UserRole,
    estado: 'activo' as 'activo' | 'inactivo',
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        estado: user.estado,
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        rol: 'vendedor',
        estado: 'activo',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      deleteUser(id);
    }
  };

  const handleViewDetail = (user: User) => {
    setViewingUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleExport = () => {
    const csv = [
      ['Nombre', 'Email', 'Teléfono', 'Rol', 'Estado', 'Fecha Creación'],
      ...users.map(u => [u.nombre, u.email, u.telefono, u.rol, u.estado, u.fechaCreacion])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios.csv';
    a.click();
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.nombre.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.telefono.includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
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
        title="Usuarios"
        subtitle="Gestión de usuarios del sistema"
        actionButton={{
          label: 'Nuevo Usuario',
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
              <Button
                onClick={handleExport}
                variant="outline"
                className="gap-2 border-border text-foreground hover:bg-surface"
              >
                <FileDown className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
            <div>
              <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground-secondary">Nombre</TableHead>
                <TableHead className="text-foreground-secondary">Email</TableHead>
                <TableHead className="text-foreground-secondary">Teléfono</TableHead>
                <TableHead className="text-foreground-secondary">Rol</TableHead>
                <TableHead className="text-foreground-secondary">Estado</TableHead>
                <TableHead className="text-foreground-secondary">Fecha Creación</TableHead>
                <TableHead className="text-foreground-secondary text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-foreground-secondary">No se encontraron resultados</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                <TableRow key={user.id} className="border-border hover:bg-surface/50">
                  <TableCell className="text-foreground">{user.nombre}</TableCell>
                  <TableCell className="text-foreground-secondary">{user.email}</TableCell>
                  <TableCell className="text-foreground-secondary">{user.telefono}</TableCell>
                  <TableCell>
                    <span className="capitalize text-foreground">{user.rol}</span>
                  </TableCell>
                  <TableCell>
                    <StatusSwitch 
                      status={user.estado} 
                      onChange={(newStatus) => updateUser(user.id, { estado: newStatus })}
                    />
                  </TableCell>
                  <TableCell className="text-foreground-secondary">{user.fechaCreacion}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetail(user)}
                        className="h-8 w-8 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(user)}
                        className="h-8 w-8 p-0 text-foreground-secondary hover:text-primary hover:bg-primary/10"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(user.id)}
                        className="h-8 w-8 p-0 text-foreground-secondary hover:text-danger hover:bg-danger/10"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalle del Usuario</DialogTitle>
            <DialogDescription className="sr-only">
              Información completa del usuario
            </DialogDescription>
          </DialogHeader>

          {viewingUser && (
            <div className="space-y-6 py-4">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Nombre Completo
                    </p>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {viewingUser.nombre}
                    </p>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Email
                    </p>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {viewingUser.email}
                    </p>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Teléfono
                    </p>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {viewingUser.telefono}
                    </p>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      ID de Usuario
                    </p>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {viewingUser.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del Sistema */}
              <div className="space-y-4">
                <h3 className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Información del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Rol
                    </p>
                    <p className="text-foreground capitalize" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {viewingUser.rol}
                    </p>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Estado
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={viewingUser.estado} />
                    </div>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Fecha de Creación
                    </p>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {viewingUser.fechaCreacion}
                    </p>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Última Actualización
                    </p>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {viewingUser.fechaActualizacion || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setIsDetailDialogOpen(false)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingUser ? 'Formulario para editar información del usuario' : 'Formulario para crear un nuevo usuario'}
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
                placeholder="Nombre completo"
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
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-foreground">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="bg-input-background border-border text-foreground"
                placeholder="3001234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol" className="text-foreground">Rol</Label>
              <Select value={formData.rol} onValueChange={(value: UserRole) => setFormData({ ...formData, rol: value })}>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
