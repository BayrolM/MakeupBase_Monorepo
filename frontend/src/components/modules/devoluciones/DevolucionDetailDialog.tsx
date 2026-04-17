import { X, Package, User, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { getEstadoColor, formatCurrency } from '../../../utils/devolucionUtils';

interface DevolucionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devolucion: any;
  clientes: any[];
  productos: any[];
}

export function DevolucionDetailDialog({
  open,
  onOpenChange,
  devolucion,
  clientes,
  productos
}: DevolucionDetailDialogProps) {
  if (!devolucion) return null;

  const cliente = clientes.find(c => c.id === devolucion.clienteId);
  const statusInfo = getEstadoColor(devolucion.estado);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-0">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0" 
              style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#2e1020,#4a2035)", boxShadow: "0 4px 12px rgba(46,16,32,0.2)" }}>
              <Package className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">Consulta de Devolución</DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-0.5">#{devolucion.id.slice(0, 8)}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registrada por Cliente</p>
                   <p className="text-sm font-bold text-gray-900">{cliente?.nombre || "N/A"}</p>
                </div>
             </div>
             <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Fecha de Gestión</p>
                   <p className="text-sm font-bold text-gray-900">{devolucion.fecha}</p>
                </div>
             </div>
             <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3 col-span-2">
                <Info className="w-5 h-5 text-gray-400" />
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Estado y Razón</p>
                   <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusInfo.bg} ${statusInfo.text}`}>
                         {statusInfo.label}
                      </span>
                      <p className="text-sm font-bold text-gray-900">{devolucion.motivo}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-2 px-1">
                <span className="w-1 h-5 bg-[#c47b96] rounded-full" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Productos Afectados</h3>
             </div>
             <div className="bg-white border border-gray-100 rounded-22l overflow-hidden shadow-inner border-2 border-gray-50">
                <Table>
                   <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-100 hover:bg-gray-50">
                         <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-6 py-3">Nombre</TableHead>
                         <TableHead className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest py-3">Cantidad</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {devolucion.productos.map((item: any, idx: number) => {
                         const producto = productos.find(p => p.id === item.productoId);
                         return (
                            <TableRow key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                               <TableCell className="pl-6 py-3">
                                  <p className="text-sm font-bold text-gray-800">{producto?.nombre || "Producto desconocido"}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {item.productoId.slice(0, 8)}</p>
                               </TableCell>
                               <TableCell className="text-center py-3">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#fff0f5] text-sm font-bold text-[#c47b96]">{item.cantidad}</span>
                               </TableCell>
                            </TableRow>
                         );
                      })}
                   </TableBody>
                </Table>
             </div>
          </div>

          <div className="bg-[#2e1020] rounded-2xl p-6 shadow-xl flex justify-between items-center relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Total Crédito/Devuelto</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-white text-3xl font-black">{formatCurrency(devolucion.totalDevuelto)}</p>
                </div>
             </div>
             <div className="relative z-10">
                <CheckCircle2 className="w-12 h-12 text-emerald-400/80" strokeWidth={1.5} />
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
          </div>

          {(devolucion.motivoDecision || devolucion.motivoAnulacion) && (
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
               <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Seguimiento de Auditoría</p>
               <p className="text-sm font-medium text-gray-600 italic">
                  "{devolucion.motivoDecision || devolucion.motivoAnulacion}"
               </p>
            </div>
          )}
        </div>

        <DialogFooter className="px-8 pb-8 pt-4 border-t border-gray-100 bg-white sticky bottom-0 z-10">
          <Button onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-11 font-bold border-0 bg-gray-900 text-white shadow-lg shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95 leading-none">
             Cerrar Consulta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
