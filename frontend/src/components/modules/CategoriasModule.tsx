import { useState, useEffect } from "react";
import { useStore, Categoria } from "../../lib/store";
import { PageHeader } from "../PageHeader";
import { StatusSwitch } from "../StatusSwitch";
import { Pagination } from "../Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  X,
  Layers,
  Archive,
  Package,
  FolderTree,
  Hash,
  AlertCircle,
  Activity,
  Folders,
} from "lucide-react";
import { toast } from "sonner";
import { categoryService } from "../../services/categoryService";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "activo" as "activo" | "inactivo",
  });

  const isAdmin = currentUser?.rol === "admin";

  useEffect(() => {
    refreshCategorias();
  }, []);

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
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

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
    try {
      await categoryService.delete(Number(selectedCategoria.id));
      await refreshCategorias();
      toast.success("Categoría eliminada");
      setIsDeleteDialogOpen(false);
      setSelectedCategoria(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const getProductCount = (categoriaId: string) => {
    return productos.filter((p) => p.categoriaId === categoriaId).length;
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      {/* HEADER PREMIUM */}
      <div className="px-8 pt-8 pb-5">
        <div className="relative overflow-hidden rounded-2xl shadow-xl">
          <div
            className="relative px-6 py-8"
            style={{
              background: `
                radial-gradient(ellipse at 80% 8%, rgba(140,70,90,0.6) 0%, transparent 50%),
                radial-gradient(ellipse at 12% 65%, rgba(80,25,40,0.55) 0%, transparent 50%),
                radial-gradient(ellipse at 55% 92%, rgba(110,45,65,0.45) 0%, transparent 45%),
                linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)
              `,
            }}
          >
            <div className="relative flex flex-wrap gap-6 justify-between items-center z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <FolderTree className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: "#fffff2" }}
                    >
                      Categorías
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "#fffff2" }}>
                      Gestión de categorías de productos
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenDialog()}
                disabled={!isAdmin}
                style={{
                  backgroundColor: isAdmin ? "#7b1347ff" : "#d1d5db",
                  color: "#ffffff",
                  cursor: isAdmin ? "pointer" : "not-allowed",
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 transition-opacity duration-150"
              >
                <Plus className="w-4 h-4" />
                Nueva Categoría
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="px-8 pb-8">
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
                placeholder="Buscar categorías por nombre o descripción..."
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabla */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5" />
                    Nombre
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5" />
                    Descripción
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Productos
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Estado
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                        <FolderTree className="w-10 h-10 text-[#c47b96]" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold text-lg">
                          {searchQuery
                            ? `No se encontraron resultados para "${searchQuery}"`
                            : "No hay categorías registradas"}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchQuery
                            ? "Intenta con otros términos de búsqueda"
                            : "Las categorías aparecerán aquí"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categorias.map((categoria) => {
                  const productCount = getProductCount(categoria.id);
                  const hasProducts = productCount > 0;
                  return (
                    <TableRow
                      key={categoria.id}
                      className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                    >
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#c47b96] transition-colors"></div>
                          <span className="font-mono text-[11px] font-semibold text-gray-500">
                            {categoria.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c47b96] to-[#e092b2] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {categoria.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-gray-800 font-semibold text-sm">
                              {categoria.nombre}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-gray-500 text-sm line-clamp-1 max-w-xs">
                          {categoria.descripcion || (
                            <span className="text-gray-400 italic">
                              Sin descripción
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            hasProducts
                              ? "bg-[#c47b96]/10 text-[#c47b96]"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <Package className="w-3 h-3" />
                          {productCount}{" "}
                          {productCount === 1 ? "producto" : "productos"}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <StatusSwitch
                          status={categoria.estado}
                          onChange={(newStatus) => {
                            if (!isAdmin) return;
                            categoryService
                              .update(Number(categoria.id), {
                                estado: newStatus === "activo",
                              })
                              .then(refreshCategorias);
                          }}
                          disabled={!isAdmin}
                        />
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedCategoria(categoria);
                              setIsDetailDialogOpen(true);
                            }}
                            title="Ver detalles"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(categoria)}
                            disabled={!isAdmin}
                            title={
                              !isAdmin ? "Acceso denegado" : "Editar categoría"
                            }
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                              isAdmin
                                ? "text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCategoria(categoria);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={!isAdmin || hasProducts}
                            title={
                              !isAdmin
                                ? "Acceso denegado"
                                : hasProducts
                                  ? `No se puede eliminar: tiene ${productCount} producto(s) asociado(s)`
                                  : "Eliminar categoría"
                            }
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                              isAdmin && !hasProducts
                                ? "text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6">
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

      {/* ==================== DIALOG DE CREACIÓN/EDICIÓN ==================== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 max-w-2xl rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#c47b96] via-[#e092b2] to-[#c47b96]" />

          <div className="p-6">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] rounded-xl">
                  <Layers className="w-5 h-5 text-[#c47b96]" />
                </div>
                <div>
                  <DialogTitle className="text-[#2e1020] text-xl font-bold">
                    {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-sm mt-0.5">
                    {editingCategoria
                      ? "Modifica los datos de la categoría"
                      : "Completa el formulario para crear una nueva categoría"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <FolderTree className="w-3.5 h-3.5 text-[#c47b96]" />
                  Nombre <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                  placeholder="Ej: Maquillaje, Cuidado Facial, Labiales..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5 text-[#c47b96]" />
                  Descripción{" "}
                  <span className="text-gray-400 text-xs font-normal">
                    (Opcional)
                  </span>
                </Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Describe brevemente esta categoría..."
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="border-t border-gray-100 pt-4 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-6"
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-[#c47b96] to-[#e092b2] hover:shadow-lg hover:shadow-[#c47b96]/25 transition-all rounded-xl text-white font-semibold px-6"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </div>
                ) : editingCategoria ? (
                  "Actualizar Categoría"
                ) : (
                  "Crear Categoría"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG DE DETALLE ==================== */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent
          className="text-white border border-white/10 w-[95vw] sm:max-w-[600px] !max-w-[600px] p-0 overflow-hidden rounded-[2rem] shadow-2xl"
          style={{
            background:
              "linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)",
            backgroundColor: "#2e1020",
          }}
        >
          {/* Header Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#b06080] via-[#e0a0be] to-[#b06080]" />

          {selectedCategoria && (
            <div className="flex flex-col h-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c47b96] to-[#e092b2] flex items-center justify-center text-white font-black text-3xl shadow-xl border border-white/20">
                    {selectedCategoria.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black text-white leading-tight tracking-tight">
                      {selectedCategoria.nombre}
                    </DialogTitle>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">
                      GESTIÓN DE CATEGORÍA <span className="text-[#e092b2]">#{selectedCategoria.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="space-y-6">
                  {/* Category Description */}
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest flex items-center gap-2">
                       <Archive className="w-3 h-3" /> Descripción Editorial
                    </Label>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-white/70 text-sm leading-relaxed italic">
                        {selectedCategoria.descripcion || (
                          <span className="text-white/20 NOT-italic">Sin descripción detallada registrada para esta categoría comercial.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Impact Summary */}
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[9px] uppercase font-bold tracking-widest flex items-center gap-2">
                       <Activity className="w-3 h-3" /> Impacto en el Catálogo
                    </Label>
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-[#e092b2]/10 to-transparent border border-[#e092b2]/20 flex items-center justify-between">
                       <div>
                          <p className="text-[#e092b2]/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Productos Vinculados</p>
                          <p className="text-5xl font-black text-white tracking-tighter">
                             {productos.filter(p => p.categoriaId === selectedCategoria.id).length}
                          </p>
                       </div>
                       <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                          <Folders className="w-8 h-8 text-[#e092b2]/40" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-white/10 bg-black/10 flex justify-end">
                <Button
                  onClick={() => setIsDetailDialogOpen(false)}
                  variant="ghost"
                  className="px-8 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all font-bold uppercase text-[10px] tracking-widest"
                >
                  Regresar a Categorías
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG DE ELIMINACIÓN ==================== */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400" />

          <div className="p-6">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <DialogTitle className="text-[#2e1020] text-xl font-bold">
                    Eliminar Categoría
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-sm mt-0.5">
                    Esta acción no se puede deshacer
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-rose-400" />
              </div>
              <p className="text-gray-700 font-medium">
                ¿Estás seguro de eliminar la categoría{" "}
                <span className="font-bold text-[#c47b96]">
                  "{selectedCategoria?.nombre}"
                </span>
                ?
              </p>
              <p className="text-gray-400 text-xs mt-3">
                Esta acción eliminará permanentemente la categoría del sistema.
              </p>
            </div>

            <DialogFooter className="border-t border-gray-100 pt-4 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-lg hover:shadow-rose-500/25 transition-all rounded-xl text-white font-semibold flex-1"
              >
                Eliminar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
