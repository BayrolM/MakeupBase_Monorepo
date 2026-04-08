import { useState } from 'react';
import { useStore, Rol, Status } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { StatusSwitch } from '../StatusSwitch';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Plus, Pencil, Trash2, Eye, Search, Users as UsersIcon, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function RolesPermisosModule() {
  const { roles, users, addRol, updateRol, deleteRol } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rolToDelete, setRolToDelete] = useState<string | null>(null);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [viewingRol, setViewingRol] = useState<Rol | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'activo' as Status,
    permisos: {
      usuarios: { ver: false, crear: false, editar: false, eliminar: false },
      productos: { ver: false, crear: false, editar: false, eliminar: false },
      ventas: { ver: false, crear: false, editar: false, eliminar: false },
      compras: { ver: false, crear: false, editar: false, eliminar: false },
      pedidos: { ver: false, crear: false, editar: false, eliminar: false },
      clientes: { ver: false, crear: false, editar: false, eliminar: false },
      proveedores: { ver: false, crear: false, editar: false, eliminar: false },
      devoluciones: { ver: false, crear: false, editar: false, eliminar: false },
      configuracion: { ver: false, crear: false, editar: false, eliminar: false },
    },
  });

  const modulos = [
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'productos', label: 'Productos' },
    { key: 'ventas', label: 'Ventas' },
    { key: 'compras', label: 'Compras' },
    { key: 'pedidos', label: 'Pedidos' },
    { key: 'clientes', label: 'Clientes' },
    { key: 'proveedores', label: 'Proveedores' },
    { key: 'devoluciones', label: 'Devoluciones' },
    { key: 'configuracion', label: 'Configuración' },
  ];

  const handleOpenDialog = (rol?: Rol) => {
    if (rol) {
      setEditingRol(rol);
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        estado: rol.estado,
        permisos: rol.permisos as any,
      });
    } else {
      setEditingRol(null);
      setFormData({
        nombre: '',
        descripcion: '',
        estado: 'activo',
        permisos: {
          usuarios: { ver: false, crear: false, editar: false, eliminar: false },
          productos: { ver: false, crear: false, editar: false, eliminar: false },
          ventas: { ver: false, crear: false, editar: false, eliminar: false },
          compras: { ver: false, crear: false, editar: false, eliminar: false },
          pedidos: { ver: false, crear: false, editar: false, eliminar: false },
          clientes: { ver: false, crear: false, editar: false, eliminar: false },
          proveedores: { ver: false, crear: false, editar: false, eliminar: false },
          devoluciones: { ver: false, crear: false, editar: false, eliminar: false },
          configuracion: { ver: false, crear: false, editar: false, eliminar: false },
        },
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre del rol es requerido');
      return;
    }

    if (editingRol) {
      updateRol(editingRol.id, formData);
      toast.success('Rol actualizado correctamente');
    } else {
      addRol(formData);
      toast.success('Rol creado correctamente');
    }
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    // Validación: no se puede eliminar un rol con usuarios asignados
    const usersWithRole = users.filter(u => u.rolAsignadoId === id);
    if (usersWithRole.length > 0) {
      toast.error(`No se puede eliminar este rol porque tiene ${usersWithRole.length} usuario(s) asignado(s)`);
      return;
    }

    setRolToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (rolToDelete) {
      deleteRol(rolToDelete);
      toast.success('Rol eliminado correctamente');
      setIsDeleteDialogOpen(false);
      setRolToDelete(null);
    }
  };

  const handleViewDetail = (rol: Rol) => {
    setViewingRol(rol);
    setIsDetailDialogOpen(true);
  };

  const handlePermisoChange = (modulo: string, tipo: 'ver' | 'crear' | 'editar' | 'eliminar', value: boolean) => {
    setFormData({
      ...formData,
      permisos: {
        ...formData.permisos,
        [modulo]: {
          ...formData.permisos[modulo as keyof typeof formData.permisos],
          [tipo]: value,
        },
      },
    });
  };

  // Función para cambiar permisos directamente desde la matriz
  const handleMatrizPermisoChange = (rolId: string, modulo: string, tipo: 'ver' | 'crear' | 'editar' | 'eliminar', value: any) => {
    const rol = roles.find(r => r.id === rolId);
    if (!rol) return;

    const nuevosPermisos = {
      ...rol.permisos,
      [modulo]: {
        ...rol.permisos[modulo],
        [tipo]: value,
      },
    };

    updateRol(rolId, { permisos: nuevosPermisos });
    toast.success('Permiso actualizado');
  };

  // Filter roles based on search
  const filteredRoles = roles.filter(rol => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      rol.nombre.toLowerCase().includes(query) ||
      rol.descripcion.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Get users assigned to a role
  const getUsersForRole = (rolId: string) => {
    return users.filter(u => u.rolAsignadoId === rolId);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Roles y Permisos"
        subtitle="Gestión de roles y asignación de permisos"
        actionButton={{
          label: 'Agregar Rol',
          icon: Plus,
          onClick: () => handleOpenDialog(),
        }}
      />

      <div className="p-8 space-y-8">
        {/* Tabla de Roles */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-input-background border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Buscar por nombre o descripción..."
                />
              </div>
            </div>
            <div>
              <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                Mostrando {filteredRoles.length} de {roles.length} roles
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground-secondary">ID</TableHead>
                <TableHead className="text-foreground-secondary">Nombre del Rol</TableHead>
                <TableHead className="text-foreground-secondary">Descripción</TableHead>
                <TableHead className="text-foreground-secondary">Usuarios Asignados</TableHead>
                <TableHead className="text-foreground-secondary">Estado</TableHead>
                <TableHead className="text-foreground-secondary text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-foreground-secondary">
                      {searchQuery ? 'No se encontraron resultados' : 'No hay roles registrados'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRoles.map((rol) => (
                  <TableRow key={rol.id} className="border-border hover:bg-surface/50 transition-all duration-200">
                    <TableCell className="text-foreground-secondary">{rol.id}</TableCell>
                    <TableCell className="text-foreground">{rol.nombre}</TableCell>
                    <TableCell className="text-foreground-secondary">{rol.descripcion}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{getUsersForRole(rol.id).length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusSwitch
                        status={rol.estado}
                        onChange={(newStatus) => updateRol(rol.id, { estado: newStatus })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetail(rol)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDialog(rol)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(rol.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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
        {filteredRoles.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRoles.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        )}

        {/* Matriz de Permisos */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-foreground" style={{ fontSize: '18px', fontWeight: 600 }}>
                  Matriz de Permisos
                </h2>
                <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                  Gestiona los permisos de cada rol directamente desde esta tabla
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground sticky left-0 bg-card z-10 border-r border-border">
                    Módulo
                  </TableHead>
                  {roles.filter(r => r.estado === 'activo').map((rol) => (
                    <TableHead key={rol.id} className="text-center border-r border-border" colSpan={4}>
                      <div className="flex flex-col items-center gap-1 py-2">
                        <span className="text-foreground" style={{ fontSize: '14px', fontWeight: 600 }}>
                          {rol.nombre}
                        </span>
                        <div className="grid grid-cols-4 gap-2 w-full mt-2">
                          <span className="text-foreground-secondary" style={{ fontSize: '11px' }}>Ver</span>
                          <span className="text-foreground-secondary" style={{ fontSize: '11px' }}>Crear</span>
                          <span className="text-foreground-secondary" style={{ fontSize: '11px' }}>Editar</span>
                          <span className="text-foreground-secondary" style={{ fontSize: '11px' }}>Eliminar</span>
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {modulos.map((modulo) => (
                  <TableRow key={modulo.key} className="border-border hover:bg-surface/30">
                    <TableCell className="text-foreground sticky left-0 bg-card z-10 border-r border-border">
                      {modulo.label}
                    </TableCell>
                    {roles.filter(r => r.estado === 'activo').map((rol) => {
                      const permisos = rol.permisos[modulo.key];
                      return (
                        <TableCell key={`${rol.id}-${modulo.key}`} className="border-r border-border p-0" colSpan={4}>
                          <div className="grid grid-cols-4 divide-x divide-border">
                            <div className="flex items-center justify-center py-3">
                              <Checkbox
                                checked={permisos?.ver || false}
                                onCheckedChange={(checked: boolean) =>
                                  handleMatrizPermisoChange(rol.id, modulo.key, 'ver', checked as boolean)
                                }
                              />
                            </div>
                            <div className="flex items-center justify-center py-3">
                              <Checkbox
                                checked={permisos?.crear || false}
                                onCheckedChange={(checked: boolean) =>
                                  handleMatrizPermisoChange(rol.id, modulo.key, 'crear', checked as boolean)
                                }
                              />
                            </div>
                            <div className="flex items-center justify-center py-3">
                              <Checkbox
                                checked={permisos?.editar || false}
                                onCheckedChange={(checked: boolean) =>
                                  handleMatrizPermisoChange(rol.id, modulo.key, 'editar', checked as boolean)
                                }
                              />
                            </div>
                            <div className="flex items-center justify-center py-3">
                              <Checkbox
                                checked={permisos?.eliminar || false}
                                onCheckedChange={(checked: boolean) =>
                                  handleMatrizPermisoChange(rol.id, modulo.key, 'eliminar', checked as boolean)
                                }
                              />
                            </div>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-border bg-surface/30">
            <p className="text-foreground-secondary text-center" style={{ fontSize: '13px' }}>
              💡 Tip: Los checkboxes permiten editar permisos en tiempo real. Los roles inactivos no se muestran en esta matriz.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingRol ? 'Editar Rol' : 'Agregar Rol'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para {editingRol ? 'editar' : 'agregar'} un rol
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                Información Básica
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="nombre" className="text-foreground">Nombre del Rol *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="bg-input-background border-border text-foreground mt-2"
                    placeholder="Ej: Vendedor, Administrador, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion" className="text-foreground">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="bg-input-background border-border text-foreground mt-2"
                    placeholder="Descripción del rol y sus responsabilidades"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-foreground">Estado</Label>
                  <div className="mt-2">
                    <StatusSwitch
                      status={formData.estado}
                      onChange={(newStatus) => setFormData({ ...formData, estado: newStatus })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Permisos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Permisos por Módulo
                </h3>
              </div>
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-foreground">Módulo</TableHead>
                      <TableHead className="text-center text-foreground-secondary">Ver</TableHead>
                      <TableHead className="text-center text-foreground-secondary">Crear</TableHead>
                      <TableHead className="text-center text-foreground-secondary">Editar</TableHead>
                      <TableHead className="text-center text-foreground-secondary">Eliminar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modulos.map((modulo) => (
                      <TableRow key={modulo.key} className="border-border">
                        <TableCell className="text-foreground">{modulo.label}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={formData.permisos[modulo.key as keyof typeof formData.permisos]?.ver || false}
                            onCheckedChange={(checked: boolean) =>
                              handlePermisoChange(modulo.key, 'ver', checked as boolean)
                            }
                            className="mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={formData.permisos[modulo.key as keyof typeof formData.permisos]?.crear || false}
                            onCheckedChange={(checked: boolean) =>
                              handlePermisoChange(modulo.key, 'crear', checked as boolean)
                            }
                            className="mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={formData.permisos[modulo.key as keyof typeof formData.permisos]?.editar || false}
                            onCheckedChange={(checked: boolean) =>
                              handlePermisoChange(modulo.key, 'editar', checked as boolean)
                            }
                            className="mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={formData.permisos[modulo.key as keyof typeof formData.permisos]?.eliminar || false}
                            onCheckedChange={(checked: boolean) =>
                              handlePermisoChange(modulo.key, 'eliminar', checked as boolean)
                            }
                            className="mx-auto"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-border text-foreground hover:bg-surface flex-1"
            >
              ❌ Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-foreground flex-1"
            >
              ✅ {editingRol ? 'Guardar Cambios' : 'Crear Rol'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalle del Rol</DialogTitle>
            <DialogDescription className="sr-only">
              Información completa del rol y permisos asignados
            </DialogDescription>
          </DialogHeader>

          {viewingRol && (
            <div className="space-y-6 py-4">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Nombre del Rol
                    </p>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {viewingRol.nombre}
                    </p>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      ID del Rol
                    </p>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {viewingRol.id}
                    </p>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-border col-span-2">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Descripción
                    </p>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {viewingRol.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Estado
                    </p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        viewingRol.estado === 'activo'
                          ? 'bg-[#3FC27A]/20 text-[#3FC27A]'
                          : 'bg-[#FF6B6B]/20 text-[#FF6B6B]'
                      }`}>
                        {viewingRol.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-border">
                    <p className="text-foreground-secondary" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Usuarios Asignados
                    </p>
                    <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {getUsersForRole(viewingRol.id).length} usuario(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Permisos */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                    Permisos Asignados
                  </h3>
                </div>
                <div className="bg-surface border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-foreground">Módulo</TableHead>
                        <TableHead className="text-center text-foreground-secondary">Ver</TableHead>
                        <TableHead className="text-center text-foreground-secondary">Crear</TableHead>
                        <TableHead className="text-center text-foreground-secondary">Editar</TableHead>
                        <TableHead className="text-center text-foreground-secondary">Eliminar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modulos.map((modulo) => {
                        const permisos = viewingRol.permisos[modulo.key];
                        return (
                          <TableRow key={modulo.key} className="border-border">
                            <TableCell className="text-foreground">{modulo.label}</TableCell>
                            <TableCell className="text-center">
                              <span className={permisos?.ver ? 'text-[#3FC27A]' : 'text-[#FF6B6B]'}>
                                {permisos?.ver ? '✓' : '✗'}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={permisos?.crear ? 'text-[#3FC27A]' : 'text-[#FF6B6B]'}>
                                {permisos?.crear ? '✓' : '✗'}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={permisos?.editar ? 'text-[#3FC27A]' : 'text-[#FF6B6B]'}>
                                {permisos?.editar ? '✓' : '✗'}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={permisos?.eliminar ? 'text-[#3FC27A]' : 'text-[#FF6B6B]'}>
                                {permisos?.eliminar ? '✓' : '✗'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Usuarios Asignados */}
              <div className="space-y-4">
                <h3 className="text-foreground" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Usuarios con este Rol
                </h3>
                {getUsersForRole(viewingRol.id).length === 0 ? (
                  <div className="p-8 text-center bg-surface rounded-lg border border-border">
                    <UsersIcon className="w-12 h-12 text-foreground-secondary mx-auto mb-2 opacity-50" />
                    <p className="text-foreground-secondary">No hay usuarios asignados a este rol</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getUsersForRole(viewingRol.id).map((user) => (
                      <div key={user.id} className="p-4 bg-surface rounded-lg border border-border">
                        <p className="text-foreground" style={{ fontSize: '14px', fontWeight: 500 }}>
                          {user.nombres} {user.apellidos}
                        </p>
                        <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                          {user.email}
                        </p>
                        <p className="text-foreground-secondary" style={{ fontSize: '12px' }}>
                          Rol del sistema: <span className="capitalize">{user.rol}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setIsDetailDialogOpen(false)}
              className="bg-primary hover:bg-primary/90 text-foreground"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-danger" />
              </div>
              <AlertDialogTitle className="text-foreground">
                Confirmar Eliminación
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-foreground-secondary">
              ¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-border text-foreground hover:bg-surface flex-1"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-danger hover:bg-danger/90 text-white flex-1"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
