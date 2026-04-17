import { 
  Search, 
  Hash, 
  ClipboardList, 
  User, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Package, 
  ShoppingBag, 
  FileText, 
  Eye, 
  X 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../ui/table";
import { formatCurrency, getStatusColor } from "../../../utils/ventaUtils";

interface VentaTableProps {
  ventas: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDownloadPDF: (venta: any) => void;
  onViewDetail: (venta: any) => void;
  onAnnulClick: (ventaId: string) => void;
}

export function VentaTable({
  ventas,
  searchQuery,
  onSearchChange,
  onDownloadPDF,
  onViewDetail,
  onAnnulClick,
}: VentaTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
      {/* Barra de búsqueda */}
      <div className="p-4 border-b border-gray-100 bg-white space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
              placeholder="Buscar por ID de venta, nombre de cliente o estado (activo/anulada)..."
            />
          </div>
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
                <ClipboardList className="w-3.5 h-3.5" />
                ID Pedido
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Cliente
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Fecha
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Total
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Método Pago
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Estado
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3 pr-4">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {ventas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      {searchQuery
                        ? `No se encontraron resultados para "${searchQuery}"`
                        : "No hay ventas registradas"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery
                        ? "Intenta con otros términos de búsqueda"
                        : "Las ventas aparecerán aquí"}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            ventas.map((venta) => {
              const isAnulada = venta.estado === "anulada";
              const statusColor = getStatusColor(venta.estado);
              return (
                <TableRow
                  key={venta.id}
                  className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                >
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#c47b96] transition-colors"></div>
                      <span className="font-mono text-[11px] font-semibold text-gray-500">
                        {venta.id.slice(0, 8)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-500 text-sm font-mono">
                      {venta.pedidoId ? (
                        `#${venta.pedidoId}`
                      ) : (
                        <span className="text-gray-400 italic">
                          Venta Directa
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 font-semibold text-sm">
                        {venta.clienteNombre || "Sin Nombre"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-500 text-sm font-mono">
                      {venta.fecha}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-900 font-bold text-base bg-gradient-to-r from-[#2e1020] to-[#4a2035] bg-clip-text text-transparent">
                      {formatCurrency(venta.total)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
                      <CreditCard className="w-3 h-3" />
                      {venta.metodoPago}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${statusColor.bg} ${statusColor.text}`}
                    >
                      {statusColor.icon}
                      {statusColor.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onDownloadPDF(venta)}
                        title="Descargar PDF"
                        className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onViewDetail(venta)}
                        title="Ver detalle"
                        className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!isAnulada && (
                        <button
                          onClick={() => onAnnulClick(venta.id)}
                          title="Anular venta"
                          className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
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
