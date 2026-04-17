import { 
  Search, 
  Hash, 
  User as UserIcon, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  ShoppingBag, 
  FileText, 
  Eye, 
  Edit, 
  Activity, 
  CheckCircle2 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../ui/table";
import { formatCurrency, getStatusColor } from "../../../utils/pedidoUtils";

interface PedidoTableProps {
  pedidos: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewDetail: (pedido: any) => void;
  onViewPDF: (pedido: any) => void;
  onEdit: (pedido: any) => void;
  onStatusClick: (pedido: any) => void;
  onConfirmPayment: (pedido: any) => void;
  onViewComprobante: (url: string) => void;
}

export function PedidoTable({
  pedidos,
  searchQuery,
  onSearchChange,
  onViewDetail,
  onViewPDF,
  onEdit,
  onStatusClick,
  onConfirmPayment,
  onViewComprobante,
}: PedidoTableProps) {
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
              placeholder="Buscar por ID de pedido, cliente o estado (pendiente, enviado, etc)..."
            />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pl-6">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> ID
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" /> Cliente
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Fecha
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Total
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Estado
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Pago
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3 pr-6">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {pedidos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      {searchQuery
                        ? `No se encontraron resultados para "${searchQuery}"`
                        : "No hay pedidos registrados"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery
                        ? "Intenta con otros términos de búsqueda"
                        : "Los pedidos aparecerán aquí"}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            pedidos.map((pedido) => {
              const statusColor = getStatusColor(pedido.estado);
              return (
                <TableRow 
                  key={pedido.id} 
                  className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                >
                  <TableCell className="py-2.5 pl-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#c47b96] transition-colors"></div>
                      <span className="font-mono text-[11px] font-semibold text-gray-500">
                        {pedido.id.slice(0, 8)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-800 font-semibold text-sm">{pedido.clienteNombre}</span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-500 text-sm font-mono">{pedido.fecha}</span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-900 font-bold text-base bg-gradient-to-r from-[#2e1020] to-[#4a2035] bg-clip-text text-transparent">
                      {formatCurrency(pedido.total)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <button
                      onClick={() => onStatusClick(pedido)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${statusColor.bg} ${statusColor.text}`}
                    >
                      {statusColor.icon}
                      {statusColor.label}
                    </button>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onConfirmPayment(pedido)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          pedido.pago_confirmado 
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {pedido.pago_confirmado ? <CheckCircle2 className="w-3 h-3" /> : null}
                        {pedido.pago_confirmado ? "Confirmado" : "Pendiente"}
                      </button>
                      {pedido.comprobante_url && (
                        <button
                          onClick={() => onViewComprobante(pedido.comprobante_url)}
                          title="Ver Comprobante"
                          className="p-1 rounded-lg bg-pink-50 text-[#c47b96] hover:bg-pink-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5 transition-opacity">
                      <button
                        onClick={() => onViewPDF(pedido)}
                        title="Documento PDF"
                        className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onViewDetail(pedido)}
                        title="Ver Detalles"
                        className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {["pendiente", "procesando", "preparado"].includes(pedido.estado) && (
                        <button
                          onClick={() => onEdit(pedido)}
                          title="Editar Pedido"
                          className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Edit className="w-4 h-4" />
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
