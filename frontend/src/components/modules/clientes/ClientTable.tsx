import { Search, X, Hash, User, Mail, Phone, MapPin, UserCheck, Eye, Pencil, Trash2, Building2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { StatusSwitch } from "../../StatusSwitch";
import { Cliente, Pedido, Venta } from "../../../lib/store";
import { checkClientActiveConstraints } from "../../../utils/clientUtils";
import { toast } from "sonner";

interface ClientTableProps {
  clientes: Cliente[];
  pedidos: Pedido[];
  ventas: Venta[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onViewDetail: (cliente: Cliente) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
  onStatusChange: (cliente: Cliente, newStatus: "activo" | "inactivo") => void;
}

export function ClientTable({
  clientes,
  pedidos,
  ventas,
  searchQuery,
  setSearchQuery,
  onViewDetail,
  onEdit,
  onDelete,
  onStatusChange,
}: ClientTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl">
      {/* Barra de búsqueda */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150"
            placeholder="Buscar clientes por nombre, email o documento..."
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
                <User className="w-3.5 h-3.5" />
                Cliente
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                Documento
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Teléfono
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Ciudad
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Estado
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {clientes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                    <User className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      No hay clientes que coincidan
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            clientes.map((cliente) => {
              const { hasConstraints, description } = checkClientActiveConstraints(cliente.id, pedidos, ventas);
              return (
                <TableRow
                  key={cliente.id}
                  className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group"
                >
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#c47b96] transition-colors"></div>
                      <span className="font-mono text-[11px] font-semibold text-gray-500">
                        {cliente.id.slice(0, 8)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <p className="text-gray-800 font-semibold text-sm">
                      {cliente.nombre}
                    </p>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-[10px] font-mono leading-none mb-1">
                        {cliente.tipoDocumento}
                      </span>
                      <span className="text-gray-800 text-sm font-medium">
                        {cliente.numeroDocumento}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-600 text-sm">{cliente.email}</span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-800 text-sm">{cliente.telefono}</span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600 text-sm">
                        {cliente.ciudad || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div title={hasConstraints ? `Tiene ${description} pendientes` : undefined}>
                      <StatusSwitch
                        status={cliente.estado}
                        onChange={(newStatus) => {
                          if (hasConstraints) {
                            toast.error("No se puede cambiar el estado", {
                              description: `Tiene ${description} pendientes.`,
                            });
                            return;
                          }
                          onStatusChange(cliente, newStatus);
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewDetail(cliente)}
                        title="Ver detalles"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(cliente)}
                        title="Editar cliente"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(cliente)}
                        title="Eliminar cliente"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
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
  );
}
