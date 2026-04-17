import { Search, Users, Hash, User, Mail, Phone, Shield, Activity, Eye, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { StatusSwitch } from '../../StatusSwitch';
import { getRolLabel, getRolBadgeStyles } from '../../../utils/usuarioUtils';

interface UsuarioTableProps {
  users: any[];
  pedidos: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewDetail: (user: any) => void;
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
  onStatusChange: (user: any, newStatus: 'activo' | 'inactivo') => void;
  isAdmin: boolean;
}

export function UsuarioTable({
  users,
  pedidos,
  searchQuery,
  onSearchChange,
  onViewDetail,
  onEdit,
  onDelete,
  onStatusChange,
  isAdmin
}: UsuarioTableProps) {
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
              placeholder="Buscar por nombre, email o documento..."
            />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pl-6">
              <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> ID</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Nombre</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Documento</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Rol</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Estado</div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider text-right py-3 pr-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-20 bg-white">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                    <Users className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay usuarios registrados'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Los usuarios aparecerán aquí'}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const rolBadge = getRolBadgeStyles(user.rol);
              const pedidosActivos = pedidos.filter(p =>
                p.clienteId === user.id &&
                !['entregado', 'cancelado'].includes(p.estado)
              );
              const tieneActivos = pedidosActivos.length > 0;

              return (
                <TableRow key={user.id} className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group bg-white">
                  <TableCell className="py-2.5 pl-6">
                    <span className="font-mono text-[11px] font-semibold text-gray-400 group-hover:text-[#c47b96]">#{user.id}</span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-800 font-semibold text-sm">{user.nombres} {user.apellidos}</span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-500 text-xs font-mono">{user.tipoDocumento} {user.numeroDocumento}</span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-gray-600 text-sm">{user.email}</span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${rolBadge.bg} ${rolBadge.text}`}>
                      {getRolLabel(user.rol)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div title={tieneActivos ? `Tiene ${pedidosActivos.length} pedido(s) activo(s)` : undefined}>
                      <StatusSwitch
                        status={user.estado}
                        onChange={(newStatus) => onStatusChange(user, newStatus)}
                        disabled={tieneActivos}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onViewDetail(user)} title="Ver detalles" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-indigo-50 hover:text-indigo-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button onClick={() => onEdit(user)} title="Editar" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => onDelete(user)} title="Eliminar" className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer text-gray-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
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
