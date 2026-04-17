import { Search, X, Hash, FolderTree, Archive, Layers, Eye, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { StatusSwitch } from "../../StatusSwitch";
import { Categoria, Producto } from "../../../lib/store";
import { getCategoryProductCount } from "../../../utils/categoryUtils";

interface CategoryTableProps {
  categorias: Categoria[];
  productos: Producto[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  isAdmin: boolean;
  onViewDetail: (categoria: Categoria) => void;
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
  onStatusChange: (id: string, newStatus: "activo" | "inactivo") => void;
}

export function CategoryTable({
  categorias,
  productos,
  searchQuery,
  setSearchQuery,
  setCurrentPage,
  isAdmin,
  onViewDetail,
  onEdit,
  onDelete,
  onStatusChange,
}: CategoryTableProps) {
  return (
    <div className="px-8 pb-8">
      <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
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
              placeholder="Buscar categorías por nombre o descripción..."
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

        {/* Tabla */}
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
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
                <TableCell colSpan={5} className="text-center py-20">
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
                const productCount = getCategoryProductCount(categoria.id, productos);
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
                      <p className="text-gray-800 font-semibold text-sm">
                        {categoria.nombre}
                      </p>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className="text-gray-500 text-sm line-clamp-1 max-w-xs">
                        {categoria.descripcion || (
                          <span className="text-gray-400 italic">Sin descripción</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <StatusSwitch
                        status={categoria.estado}
                        onChange={(newStatus) => onStatusChange(categoria.id, newStatus)}
                        disabled={!isAdmin}
                      />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewDetail(categoria)}
                          title="Ver detalles"
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(categoria)}
                          disabled={!isAdmin}
                          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                            isAdmin
                              ? "text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(categoria)}
                          disabled={!isAdmin}
                          title={
                            !isAdmin
                              ? "Acceso denegado"
                              : hasProducts
                              ? `Tiene ${productCount} producto(s) asociado(s)`
                              : "Eliminar categoría"
                          }
                          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                            isAdmin
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
    </div>
  );
}
