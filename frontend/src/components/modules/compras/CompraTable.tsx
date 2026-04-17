import { 
  Search, 
  Hash as HashIcon, 
  Building2, 
  Calendar, 
  DollarSign, 
  Eye, 
  ShoppingBag 
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { formatCurrency } from "../../../utils/compraUtils";

interface CompraTableProps {
  compras: any[];
  proveedores: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewDetail: (compra: any) => void;
}

export function CompraTable({
  compras,
  proveedores,
  searchQuery,
  onSearchChange,
  onViewDetail,
}: CompraTableProps) {
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
              placeholder="Buscar por ID o proveedor..."
            />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pl-6">
              <div className="flex items-center gap-1.5">
                <HashIcon className="w-3.5 h-3.5" /> ID
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Proveedor
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Fecha
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Total
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pr-6 text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {compras.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-20 bg-white">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      {searchQuery
                        ? `No se encontraron resultados para "${searchQuery}"`
                        : "No hay compras registradas"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery
                        ? "Intenta con otros términos de búsqueda"
                        : "Las compras aparecerán aquí"}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            compras.map((compra) => {
              const proveedor = proveedores.find(p => p.id === compra.proveedorId);
              return (
                <TableRow 
                  key={compra.id} 
                  className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent bg-white group"
                >
                  <TableCell className="py-2.5 pl-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#c47b96] transition-colors"></div>
                      <span className="font-mono text-[11px] font-semibold text-gray-500">
                        #{compra.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-800 font-semibold text-sm">
                      {proveedor?.nombre || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-center">
                    <span className="text-gray-500 font-mono text-xs">
                      {new Date(compra.fecha).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    <span className="text-gray-900 font-bold text-base bg-gradient-to-r from-[#2e1020] to-[#4a2035] bg-clip-text text-transparent">
                      {formatCurrency(compra.total)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetail(compra)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
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
  );
}
