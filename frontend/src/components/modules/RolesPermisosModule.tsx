import { useState } from 'react';
import { useStore, Rol, Status } from '../../lib/store';
import { Pagination } from '../Pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { INITIAL_PERMISOS } from '../../utils/rolUtils';

// Sub-componentes
import { RolHeader } from './roles/RolHeader';
import { RolTable } from './roles/RolTable';
import { RolMatrizPermisos } from './roles/RolMatrizPermisos';
import { RolFormDialog } from './roles/RolFormDialog';
import { RolDetailDialog } from './roles/RolDetailDialog';

export function RolesPermisosModule() {
  const { roles, users, addRol, updateRol, deleteRol } = useStore();
  
  // Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Selection
  const [rolToDelete, setRolToDelete] = useState<string | null>(null);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'activo' as Status,
    permisos: INITIAL_PERMISOS as any,
  });

  const handleOpenDialog = (rol?: Rol) => {
    if (rol) {
      setEditingRol(rol);
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        estado: rol.estado,
        permisos: JSON.parse(JSON.stringify(rol.permisos)), // Deep copy
      });
    } else {
      setEditingRol(null);
      setFormData({
        nombre: '',
        descripcion: '',
        estado: 'activo',
        permisos: JSON.parse(JSON.stringify(INITIAL_PERMISOS)),
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
    const usersWithRole = users.filter(u => u.rolAsignadoId === id);
    if (usersWithRole.length > 0) {
      toast.error(`Conflicto de integridad`, {
        description: `No se puede eliminar este rol porque tiene ${usersWithRole.length} usuario(s) asignado(s).`
      });
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

  const handleMatrizPermisoChange = (rolId: string, modulo: string, tipo: 'ver' | 'crear' | 'editar' | 'eliminar', value: boolean) => {
    const rol = roles.find(r => r.id === rolId);
    if (!rol) return;

    const nuevosPermisos = {
      ...rol.permisos,
      [modulo]: { ...rol.permisos[modulo], [tipo]: value },
    };

    updateRol(rolId, { permisos: nuevosPermisos });
    toast.success('Permiso actualizado');
  };

  const handleFormPermisoChange = (modulo: string, tipo: 'ver' | 'crear' | 'editar' | 'eliminar', value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [modulo]: { ...prev.permisos[modulo], [tipo]: value }
      }
    }));
  };

  const filteredRoles = roles.filter(rol => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      rol.nombre.toLowerCase().includes(query) ||
      rol.descripcion.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <RolHeader onOpenDialog={() => handleOpenDialog()} />

      <div className="p-8 space-y-12">
        <div className="space-y-6">
           <RolTable 
            roles={paginatedRoles}
            users={users}
            searchQuery={searchQuery}
            onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
            onViewDetail={(r) => { setSelectedRol(r); setIsDetailDialogOpen(true); }}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteClick}
            onStatusChange={(id, status) => updateRol(id, { estado: status })}
          />

          {filteredRoles.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRoles.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          )}
        </div>

        <RolMatrizPermisos 
          roles={roles}
          onPermisoChange={handleMatrizPermisoChange}
        />
      </div>

      <RolFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingRol={editingRol}
        formData={formData}
        onFieldChange={(name, val) => setFormData(p => ({ ...p, [name]: val }))}
        onPermisoChange={handleFormPermisoChange}
        onSave={handleSave}
      />

      <RolDetailDialog 
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        rol={selectedRol}
        users={users}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-gray-100 rounded-3xl shadow-2xl p-0 overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
             </div>
             <div>
                <AlertDialogTitle className="text-xl font-bold text-gray-900 border-0">Confirmar Eliminación</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-400">Esta acción no se puede deshacer de ninguna forma.</AlertDialogDescription>
             </div>
          </div>
          <div className="p-8">
             <p className="text-gray-600 text-sm leading-relaxed">
               ¿Está absolutamente seguro de que desea eliminar este rol? Los usuarios que no tengan un rol asignado después de esta acción podrían perder el acceso al sistema.
             </p>
          </div>
          <AlertDialogFooter className="px-8 pb-8 pt-2 gap-3">
            <AlertDialogCancel className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 flex-1 h-11 font-semibold">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl h-11 font-bold border-0 bg-rose-600 text-white flex-1 shadow-lg shadow-rose-200"
            >
              Sí, Eliminar Rol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
