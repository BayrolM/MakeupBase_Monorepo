import { useState, useEffect } from 'react';
import { useStore, Categoria } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { StatusBadge } from '../StatusBadge';
import { StatusSwitch } from '../StatusSwitch';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Eye, Pencil, Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { categoryService } from '../../services/categoryService';

export function CategoriasModule() {
  const { categorias, productos, setCategorias, currentUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  const isAdmin = currentUser?.rol === 'admin';

  useEffect(() => {
    refreshCategorias();
  }, []);

  const refreshCategorias = async () => {
    try {
      const response = await categoryService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery
      });
      
      setTotalItems(response.total || 0);
      const mapped = (response.data || []).map((cat: any) => ({
        id: cat.id_categoria.toString(),
        nombre: cat.nombre,
        descripcion: cat.descripcion || '',
        estado: cat.estado ? 'activo' as const : 'inactivo' as const,
      }));
      setCategorias(mapped);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar categorías');
    }
  };

  useEffect(() => {
    refreshCategorias();
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleOpenDialog = (categoria?: Categoria) => {
    if (!isAdmin) {
      toast.error('Acceso denegado');
      return;
    }

    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        estado: categoria.estado,
      });
    } else {
      setEditingCategoria(null);
      setFormData({
        nombre: '',
        descripcion: '',
        estado: 'activo',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        estado: formData.estado === 'activo',
      };

      if (editingCategoria) {
        await categoryService.update(Number(editingCategoria.id), payload);
        toast.success('Categoría actualizada');
      } else {
        await categoryService.create(payload);
        toast.success('Categoría creada');
      }
      
      await refreshCategorias();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategoria) return;
    try {
      await categoryService.delete(Number(selectedCategoria.id));
      await refreshCategorias();
      toast.success('Categoría eliminada');
      setIsDeleteDialogOpen(false);
      setSelectedCategoria(null);
    } catch (error: any) {
      toast.error(error.message);
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
        title="Categorías"
        subtitle="Gestión de categorías de productos"
        actionButton={{
          label: 'Nueva Categoría',
          icon: Plus,
          onClick: () => handleOpenDialog(),
          disabled: !isAdmin,
        }}
      />

      <div className="p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-10 pr-10 bg-input-background border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Buscar categorías..."
              />
              {searchQuery && (
                <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <p className="text-foreground-secondary">
                      {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay categorías'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                categorias.map((categoria) => (
                  <TableRow key={categoria.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{categoria.nombre}</TableCell>
                    <TableCell className="text-foreground-secondary">{categoria.descripcion || 'Sin descripción'}</TableCell>
                    <TableCell>
                      <StatusSwitch 
                        status={categoria.estado} 
                        onChange={(newStatus) => {
                          if (!isAdmin) return;
                          categoryService.update(Number(categoria.id), { estado: newStatus === 'activo' }).then(refreshCategorias);
                        }}
                        disabled={!isAdmin}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedCategoria(categoria); setIsDetailDialogOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={!isAdmin} onClick={() => handleOpenDialog(categoria)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={!isAdmin} className="text-danger" onClick={() => { setSelectedCategoria(categoria); setIsDeleteDialogOpen(true); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex justify-between items-center">
              <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
                Mostrando {categorias.length} de {totalItems} categorías
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>{editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
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
          <DialogHeader><DialogTitle>Detalles de Categoría</DialogTitle></DialogHeader>
          {selectedCategoria && (
            <div className="space-y-4 py-4">
              <p><strong>Nombre:</strong> {selectedCategoria.nombre}</p>
              <p><strong>Descripción:</strong> {selectedCategoria.descripcion || 'Sin descripción'}</p>
              <p><strong>Estado:</strong> <StatusBadge status={selectedCategoria.estado} /></p>
              <p><strong>Productos:</strong> {productos.filter(p => p.categoriaId === selectedCategoria.id).length} unidades disponibles en esta categoría.</p>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsDetailDialogOpen(false)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Eliminar Categoría</DialogTitle></DialogHeader>
          <p className="py-4 text-center">¿Seguro que deseas eliminar <strong>{selectedCategoria?.nombre}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-danger text-foreground" onClick={handleConfirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}