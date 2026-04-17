import { useState, useEffect } from "react";
import { useStore, Categoria } from "../../lib/store";
import { toast } from "sonner";
import { categoryService } from "../../services/categoryService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../Pagination";

// Sub-componentes
import { CategoryHeader } from "./categorias/CategoryHeader";
import { CategoryTable } from "./categorias/CategoryTable";
import { CategoryFormDialog } from "./categorias/CategoryFormDialog";
import { CategoryDetailDialog } from "./categorias/CategoryDetailDialog";
import { CategoryDeleteDialog } from "./categorias/CategoryDeleteDialog";

// Utils
import {
  validateCategoryNombre,
  getCategoryProductCount,
} from "../../utils/categoryUtils";

export function CategoriasModule() {
  const { categorias, productos, setCategorias, currentUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null,
  );
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // Hook unificado de paginación
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    handleLimitChange,
  } = usePagination({ totalItems });

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "activo" as "activo" | "inactivo",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isAdmin = currentUser?.rol === "admin";

  const refreshCategorias = async () => {
    try {
      const response = await categoryService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery,
      });

      setTotalItems(response.total || 0);
      const mapped = (response.data || []).map((cat: any) => ({
        id: cat.id_categoria.toString(),
        nombre: cat.nombre,
        descripcion: cat.descripcion || "",
        estado: cat.estado ? ("activo" as const) : ("inactivo" as const),
      }));
      setCategorias(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar categorías");
    }
  };

  useEffect(() => {
    refreshCategorias();
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleOpenDialog = (categoria?: Categoria) => {
    if (!isAdmin) {
      toast.error("Acceso denegado");
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
        nombre: "",
        descripcion: "",
        estado: "activo",
      });
    }
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const nombreErr = validateCategoryNombre(
      formData.nombre,
      categorias,
      editingCategoria?.id,
    );
    if (nombreErr) {
      setFieldErrors({ nombre: nombreErr });
      toast.error(nombreErr);
      return;
    }
    setFieldErrors({});

    setIsSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        estado: formData.estado === "activo",
      };

      if (editingCategoria) {
        await categoryService.update(Number(editingCategoria.id), payload);
        toast.success("Categoría actualizada");
      } else {
        await categoryService.create(payload);
        toast.success("Categoría creada");
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

    const productCount = getCategoryProductCount(
      selectedCategoria.id,
      productos,
    );
    if (productCount > 0) {
      toast.error("No se puede eliminar esta categoría", {
        description: `Tiene ${productCount} producto(s) asociado(s). Reasigna o elimina los productos primero.`,
      });
      return;
    }

    setIsSaving(true);
    try {
      await categoryService.delete(Number(selectedCategoria.id));
      await refreshCategorias();
      toast.success("Categoría eliminada");
      setIsDeleteDialogOpen(false);
      setSelectedCategoria(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <CategoryHeader
        isAdmin={isAdmin}
        onOpenDialog={() => handleOpenDialog()}
      />

      <CategoryTable
        categorias={categorias}
        productos={productos}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setCurrentPage={setCurrentPage}
        isAdmin={isAdmin}
        onViewDetail={(cat) => {
          setSelectedCategoria(cat);
          setIsDetailDialogOpen(true);
        }}
        onEdit={handleOpenDialog}
        onDelete={(cat) => {
          setSelectedCategoria(cat);
          setIsDeleteDialogOpen(true);
        }}
        onStatusChange={(id, newStatus) => {
          if (!isAdmin) return;
          categoryService
            .update(Number(id), { estado: newStatus === "activo" })
            .then(refreshCategorias);
        }}
      />

      <CategoryFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingCategoria={editingCategoria}
        formData={formData}
        setFormData={setFormData}
        fieldErrors={fieldErrors}
        isSaving={isSaving}
        onSave={handleSave}
        validateNombre={(val) =>
          validateCategoryNombre(val, categorias, editingCategoria?.id)
        }
      />

      <CategoryDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        category={selectedCategoria}
      />

      <CategoryDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={selectedCategoria}
        isSaving={isSaving}
        onConfirm={handleConfirmDelete}
      />

      {categorias.length > 0 && (
        <div className="px-8 pb-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleLimitChange}
          />
        </div>
      )}
    </div>
  );
}
