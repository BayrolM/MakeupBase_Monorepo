import { useState, useEffect } from "react";
import { useStore, Producto } from "../../lib/store";
import { Pagination } from "../Pagination";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { productService } from "../../services/productService";
import { usePagination } from "../../hooks/usePagination";

// Sub-componentes modulares
import { ProductHeader } from "./products/ProductHeader";
import { ProductTable } from "./products/ProductTable";
import { ProductFormDialog } from "./products/ProductFormDialog";
import { ProductDetailDialog } from "./products/ProductDetailDialog";
import { ProductDeleteDialog } from "./products/ProductDeleteDialog";

export function ProductsModule() {
  const { productos, categorias, marcas, setProductos, currentUser } = useStore();
  
  // Estados de Diálogos
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Estados de Selección
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  
  // Estados de Filtro
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // Centralizando lógica de paginación con el nuevo hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    handlePageChange,
    handleLimitChange,
  } = usePagination({ totalItems });

  const isAdmin = currentUser?.rol === "admin";

  const refreshProductsLocal = async () => {
    try {
      const resp = await productService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery,
      });

      setTotalItems(resp.total || 0);
      const mapped = resp.data.map((prod) => ({
        id: prod.id_producto.toString(),
        nombre: prod.nombre,
        descripcion: prod.descripcion || "",
        categoriaId: prod.id_categoria.toString(),
        marcaId: prod.id_marca?.toString() || "1",
        marca: (prod as any).nombre_marca || "Genérica",
        precioCompra: Number(prod.costo_promedio) || 0,
        precioVenta: Number(prod.precio_venta) || 0,
        stock: prod.stock_actual || 0,
        stockMinimo: prod.stock_min || 0,
        stockMaximo: prod.stock_max || 100,
        imagenUrl: prod.imagen_url || "",
        estado: prod.estado ? ("activo" as const) : ("inactivo" as const),
        fechaCreacion: new Date().toISOString(),
      }));
      setProductos(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar productos");
    }
  };

  useEffect(() => {
    refreshProductsLocal();
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleOpenForm = (product?: Producto) => {
    if (!isAdmin) {
      toast.error("Acceso denegado", {
        description: "Solo los administradores pueden gestionar productos.",
      });
      return;
    }
    setEditingProduct(product || null);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      await productService.delete(Number(selectedProduct.id));
      await refreshProductsLocal();
      toast.success("Producto eliminado correctamente");
      setIsDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el producto");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <ProductHeader 
        isAdmin={isAdmin} 
        onOpenDialog={() => handleOpenForm()} 
      />

      <div className="px-8 pb-8">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
                placeholder="Buscar por nombre, marca o categoría..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <ProductTable
            productos={productos}
            categorias={categorias}
            isAdmin={isAdmin}
            searchQuery={searchQuery}
            onViewDetail={(p) => {
              setSelectedProduct(p);
              setIsDetailOpen(true);
            }}
            onEdit={handleOpenForm}
            onDelete={(p) => {
              setSelectedProduct(p);
              setIsDeleteOpen(true);
            }}
            refreshProducts={refreshProductsLocal}
          />
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        )}
      </div>

      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingProduct={editingProduct}
        categorias={categorias}
        marcas={marcas}
        refreshProducts={refreshProductsLocal}
      />

      <ProductDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        product={selectedProduct}
        categorias={categorias}
      />

      <ProductDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        product={selectedProduct}
        onConfirm={handleConfirmDelete}
        isSaving={isSaving}
      />
    </div>
  );
}
