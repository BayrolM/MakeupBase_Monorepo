import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Package,
  Layers,
  Tag,
  DollarSign,
  Archive,
  Activity,
  Hash,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { StatusSwitch } from "../../StatusSwitch";
import { Producto, Categoria } from "../../../lib/store";
import { getStockStatus, formatCurrency } from "../../../utils/productUtils";
import { productService } from "../../../services/productService";
import { toast } from "sonner";

interface ProductTableProps {
  productos: Producto[];
  categorias: Categoria[];
  isAdmin: boolean;
  searchQuery: string;
  onViewDetail: (product: Producto) => void;
  onEdit: (product: Producto) => void;
  onDelete: (product: Producto) => void;
  refreshProducts: () => Promise<void>;
}

export function ProductTable({
  productos,
  categorias,
  isAdmin,
  searchQuery,
  onViewDetail,
  onEdit,
  onDelete,
  refreshProducts,
}: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
          <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              ID
            </div>
          </TableHead>
          <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-gray-400" />
              Producto
            </div>
          </TableHead>
          <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
            <div className="flex items-center gap-1.5">
              <FoldersPlaceholder className="w-3.5 h-3.5 text-gray-400" />
              Categoría
            </div>
          </TableHead>
          <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              Marca
            </div>
          </TableHead>
          <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-gray-400" />
              Precio
            </div>
          </TableHead>
          <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
            <div className="flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-gray-400" />
              Stock
            </div>
          </TableHead>
          <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider py-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-gray-400" />
              Estado
            </div>
          </TableHead>
          <TableHead className="text-gray-600 font-semibold text-xs uppercase tracking-wider text-right py-3">
            Acciones
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {productos.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                  <Package className="w-10 h-10 text-[#c47b96]" />
                </div>
                <div>
                  <p className="text-gray-700 font-semibold text-lg">
                    {searchQuery
                      ? `No se encontraron resultados para "${searchQuery}"`
                      : "No hay productos registrados"}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchQuery
                      ? "Intenta con otros términos de búsqueda"
                      : "Los productos aparecerán aquí"}
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          productos.map((product) => {
            const stockStatus = getStockStatus(product);
            return (
              <TableRow
                key={product.id}
                className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
              >
                <TableCell className="py-2.5">
                  <button
                    onClick={() => onViewDetail(product)}
                    className="font-mono text-[11px] font-semibold text-gray-500 hover:text-[#c47b96] transition-all duration-200 flex items-center gap-2 group/btn"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/btn:bg-[#c47b96] transition-colors"></div>
                    <span className="group-hover/btn:underline">
                      {product.id.slice(0, 8)}
                    </span>
                  </button>
                </TableCell>
                <TableCell className="py-2.5">
                  <span className="text-gray-800 font-semibold text-sm">
                    {product.nombre}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#c47b96]/5 text-gray-600 text-xs text-center justify-center min-w-[100px]">
                    <Layers className="w-3 h-3" />
                    {categorias.find((c) => c.id === product.categoriaId)
                      ?.nombre || "Sin cat."}
                  </span>
                </TableCell>
                <TableCell className="py-2.5">
                  <span className="text-gray-600 text-sm">{product.marca}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-gray-900 font-bold text-sm">
                    {formatCurrency(product.precioVenta)}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span
                      className={`font-semibold text-sm ${stockStatus?.color || "text-gray-800"}`}
                    >
                      {product.stock} und.
                    </span>
                    {stockStatus && (
                      <span
                        className={`text-[10px] ${stockStatus.color} font-medium`}
                      >
                        {stockStatus.label}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <StatusSwitch
                    status={product.estado}
                    onChange={async (newStatus: "activo" | "inactivo") => {
                      if (!isAdmin) return;
                      try {
                        await productService.update(Number(product.id), {
                          estado: newStatus === "activo",
                        });
                        await refreshProducts();
                      } catch (error: any) {
                        toast.error(error.message || "Error al cambiar estado");
                      }
                    }}
                    disabled={!isAdmin}
                  />
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetail(product)}
                      title="Ver detalles"
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      disabled={!isAdmin}
                      title={!isAdmin ? "Acceso denegado" : "Editar producto"}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                        isAdmin
                          ? "text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      disabled={!isAdmin}
                      title={!isAdmin ? "Acceso denegado" : "Eliminar producto"}
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
  );
}

function FoldersPlaceholder(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
