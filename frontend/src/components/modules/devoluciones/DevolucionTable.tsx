import { Search, Hash, User, Calendar, FileText, Eye, X, Edit, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { getEstadoColor, formatCurrency, canChangeEstado, canAnularDevolucion } from '../../../utils/devolucionUtils';

interface DevolucionTableProps {
  devoluciones: any[];
  clientes: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewDetail: (dev: any) => void;
  onViewPdf: (dev: any) => void;
  onAnular: (dev: any) => void;
  onChangeEstado: (dev: any) => void;
  filteredCount: number;
}

export function DevolucionTable({
  devoluciones,
  clientes,
  searchQuery,
  onSearchChange,
  onViewDetail,
  onViewPdf,
  onAnular,
  onChangeEstado,
  filteredCount
}: DevolucionTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-gray-100 bg-white space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-10 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
              placeholder="Buscar por ID, cliente, estado, motivo o fecha..."
            />
          </div>
        </div>
        <div>
          <p className="text-gray-400 font-medium" style={{ fontSize: "13px" }}>
            Mostrando {filteredCount} {filteredCount === 1 ? 'resultado' : 'resultados'}
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pl-6">
              <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> ID</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Cliente</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Fecha</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              Motivo
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              Total
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              Estado
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3 pr-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {devoluciones.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-20 bg-white">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                    <Package className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay devoluciones registradas'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Las devoluciones aparecerán aquí'}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            devoluciones.map((dev) => {
              const cliente = clientes.find(c => c.id === dev.clienteId);
              const statusInfo = getEstadoColor(dev.estado);
              
              return (
                <TableRow key={dev.id} className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group bg-white">
                  <TableCell className="py-3 pl-6">
                    <div className="flex flex-col">
                      <span className="font-mono text-[12px] font-bold text-gray-700 group-hover:text-[#c47b96]">DEV-{dev.id}</span>
                      {dev.ventaId && (
                        <span className="font-mono text-[10px] text-gray-400">Venta #{dev.ventaId}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-gray-800 font-semibold text-sm">{(dev as any).clienteNombre || cliente?.nombre || "N/A"}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-gray-500 text-xs">{dev.fecha}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-gray-500 text-sm truncate max-w-[150px] block" title={dev.motivo}>{dev.motivo}</span>
                  </TableCell>
                  <TableCell className="py-3 font-mono text-sm font-bold text-gray-800">
                    {formatCurrency(dev.totalDevuelto)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                        {canChangeEstado(dev.estado) && (
                          <button
                            onClick={() => onChangeEstado(dev)}
                            className="h-6 w-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-[#fff0f5] hover:text-[#c47b96] transition-colors"
                            title="Cambiar estado"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {dev.motivoDecision && (
                        <span className="text-[10px] text-gray-400 italic max-w-[150px] truncate" title={dev.motivoDecision}>
                          Motivo: {dev.motivoDecision}
                        </span>
                      )}
                      {dev.motivoAnulacion && (
                        <span className="text-[10px] text-rose-400 italic max-w-[150px] truncate" title={dev.motivoAnulacion}>
                          Anulación: {dev.motivoAnulacion}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onViewPdf(dev)} title="Descargar Comprobante" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button onClick={() => onViewDetail(dev)} title="Ver Detalles" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-indigo-50 hover:text-indigo-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      {canAnularDevolucion(dev.estado) && (
                        <button onClick={() => onAnular(dev)} title="Anular Devolución" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-rose-50 hover:text-rose-600">
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
