import { 
  Search, 
  X, 
  Eye, 
  Pencil, 
  Trash2, 
  Building2, 
  Mail, 
  Phone, 
  FileText 
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { StatusSwitch } from "../../StatusSwitch";
import { formatNIT } from "../../../utils/proveedorUtils";

interface ProveedorTableProps {
  proveedores: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewDetail: (proveedor: any) => void;
  onEdit: (proveedor: any) => void;
  onDelete: (proveedor: any) => void;
  onStatusChange: (proveedor: any, newStatus: "activo" | "inactivo") => void;
  isAdmin?: boolean;
}

export function ProveedorTable({
  proveedores,
  searchQuery,
  onSearchChange,
  onViewDetail,
  onEdit,
  onDelete,
  onStatusChange,
  isAdmin = false,
}: ProveedorTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-gray-100 bg-white space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-10 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
              placeholder="Buscar por nombre o NIT..."
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pl-6 whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Proveedor
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> NIT
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Teléfono
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 whitespace-nowrap text-center">
              Estado
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pr-6 text-right whitespace-nowrap">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proveedores.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-20 bg-white">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      {searchQuery
                        ? `No se encontraron resultados para "${searchQuery}"`
                        : "No hay proveedores registrados"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery
                        ? "Intenta con otros términos de búsqueda"
                        : "Los proveedores aparecerán aquí"}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            proveedores.map((proveedor) => (
              <TableRow 
                key={proveedor.id} 
                className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group bg-white"
              >
                <TableCell className="py-4 pl-6">
                  <span className="text-gray-800 font-bold text-sm block group-hover:text-[#c47b96] transition-colors">
                    {proveedor.nombre}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-gray-600 font-mono text-xs">{formatNIT(proveedor.nit)}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-gray-500 text-xs">{proveedor.email || "N/A"}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-gray-500 text-xs">{proveedor.telefono || "N/A"}</span>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="flex justify-center">
                    <StatusSwitch 
                      status={proveedor.estado} 
                      onChange={(newStatus) => onStatusChange(proveedor, newStatus)} 
                    />
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right pr-6">
                  <div className="flex items-center justify-end gap-1.5 opacity-100 transition-opacity">
                    <button
                      onClick={() => onViewDetail(proveedor)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit(proveedor)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
                          title="Editar proveedor"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(proveedor)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
                          title="Eliminar proveedor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
