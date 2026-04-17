import { X, Search, Calendar, Package, Check, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { formatCurrency } from '../../../utils/devolucionUtils';

interface DevolucionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  ventaData: any;
  productosDevolver: any[];
  clientes: any[];
  productos: any[];
  successMessage: string;
  errorMessage: string;
  isSaving: boolean;
  onVentaIdChange: (id: string) => void;
  onFieldChange: (name: string, value: any) => void;
  onToggleProducto: (index: number) => void;
  onCantidadChange: (index: number, cantidad: number) => void;
  onSave: () => void;
  totalDevolucion: number;
}

export function DevolucionFormDialog({
  open,
  onOpenChange,
  formData,
  ventaData,
  productosDevolver,
  clientes,
  productos,
  successMessage,
  errorMessage,
  isSaving,
  onVentaIdChange,
  onFieldChange,
  onToggleProducto,
  onCantidadChange,
  onSave,
  totalDevolucion
}: DevolucionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-0">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0" 
              style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#c47b96,#e092b2)", boxShadow: "0 4px 12px rgba(196,123,150,0.3)" }}>
              <Package className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">Registrar Devolución</DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-0.5">Ingresa los detalles de la devolución</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-6">
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-500" />
              <p className="text-emerald-700 text-sm font-bold">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
              <X className="w-5 h-5 text-rose-500" />
              <p className="text-rose-700 text-sm font-bold">{errorMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold text-sm">ID de Compra <span className="text-rose-500">*</span></Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.ventaId}
                  onChange={(e) => onVentaIdChange(e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11 pl-10 focus:ring-[#c47b96]/20 focus:border-[#c47b96]"
                  placeholder="Ej: VENT-001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold text-sm">Fecha Devolución <span className="text-rose-500">*</span></Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.fechaDevolucion}
                  onChange={(e) => onFieldChange('fechaDevolucion', e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11 focus:ring-[#c47b96]/20 focus:border-[#c47b96]"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-bold text-sm">Motivo <span className="text-rose-500">*</span></Label>
            <Textarea
              value={formData.motivo}
              onChange={(e) => onFieldChange('motivo', e.target.value)}
              className="bg-gray-50 border-gray-200 text-gray-800 rounded-2xl min-h-[100px] focus:ring-[#c47b96]/20 focus:border-[#c47b96] py-3"
              placeholder="Describa el motivo de la devolución (mínimo 5 caracteres)..."
            />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">Mínimo: 5 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-bold text-sm">Estado Sugerido</Label>
            <Select value={formData.estado} onValueChange={(v) => onFieldChange('estado', v)}>
              <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 rounded-xl">
                <SelectItem value="Procesada">Procesada (Directo)</SelectItem>
                <SelectItem value="Pendiente">Pendiente de Revisión</SelectItem>
                <SelectItem value="Rechazada">Rechazada Inicial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {ventaData ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-[#fff0f5] p-5 rounded-2xl border border-[#fce8f0] space-y-3 shadow-inner">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-[#c47b96]" />
                  <p className="text-[#c47b96] text-xs font-bold uppercase tracking-widest">Resumen de la Venta</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">FECHA ORIGINAL</p>
                    <p className="text-sm font-bold text-[#2e1020]">{ventaData.fecha}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">CLIENTE</p>
                    <p className="text-sm font-bold text-[#2e1020]">{clientes.find(c => c.id === ventaData.clienteId)?.nombre || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-gray-700 font-bold text-sm px-1">Productos a Devolver:</p>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                  {ventaData.productos.map((item: any, index: number) => {
                    const producto = productos.find(p => p.id === item.productoId);
                    const isSelected = productosDevolver[index]?.selected || false;
                    
                    return (
                      <div key={index} className={`p-4 transition-colors ${isSelected ? 'bg-[#fff0f5]/50' : 'hover:bg-gray-50/50'}`}>
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleProducto(index)}
                            className="w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-[#c47b96] data-[state=checked]:border-[#c47b96]"
                          />
                          <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                            <div>
                               <p className="text-sm font-bold text-gray-800">{producto?.nombre || "Producto desconocido"}</p>
                               <p className="text-[10px] text-gray-400 font-bold">{formatCurrency(item.precioUnitario)} / cada uno</p>
                            </div>
                            <div className="text-center">
                               <p className="text-[10px] text-gray-400 font-bold uppercase">Comprado</p>
                               <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-sm font-bold text-gray-600 border border-gray-200">{item.cantidad}</span>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">A Devolver</p>
                               <Input
                                 type="number"
                                 value={productosDevolver[index]?.cantidadADevolver || 0}
                                 onChange={(e) => onCantidadChange(index, parseInt(e.target.value) || 0)}
                                 disabled={!isSelected}
                                 className="h-9 w-20 text-center bg-white border-gray-200 rounded-lg ml-auto font-bold"
                                 min={0}
                                 max={item.cantidad}
                               />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center px-6 py-4 bg-[#2e1020] rounded-2xl shadow-xl">
                 <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Total Estimado de Reembolso</p>
                 <p className="text-white text-2xl font-black">{formatCurrency(totalDevolucion)}</p>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto border border-gray-100">
                  <Search className="w-8 h-8 text-gray-300" />
               </div>
               <p className="text-gray-400 text-sm font-medium italic">Ingresa el ID de una compra para cargar los productos.</p>
            </div>
          )}
        </div>

        <DialogFooter className="px-8 pb-8 pt-6 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex gap-3 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-11 text-sm font-semibold flex-1 sm:flex-initial" disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isSaving || !ventaData} className="rounded-xl font-bold px-10 h-11 text-sm border-0 shadow-lg shadow-[#c47b96]/20 transition-all hover:scale-[1.02] active:scale-95 text-white flex-1 sm:ml-3" style={{ backgroundColor: "#c47b96" }}>
            {isSaving ? "Procesando..." : "Confirmar Devolución"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
