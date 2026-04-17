import { X, ShoppingBag, Plus, Trash2, Package, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { formatCurrency } from "../../../utils/compraUtils";

interface CompraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    proveedorId: string;
    observaciones: string;
    detalles: {
      productoId: string;
      cantidad: number;
      precioUnitario: number;
    }[];
  };
  setFormData: (data: any) => void;
  proveedores: any[];
  productos: any[];
  isSaving: boolean;
  onSave: () => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  tempQuantity: number;
  setTempQuantity: (q: number) => void;
  tempPrice: number;
  setTempPrice: (p: number) => void;
  addProductToDetalles: () => void;
  removeProductFromDetalles: (index: number) => void;
}

export function CompraFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  proveedores,
  productos,
  isSaving,
  onSave,
  selectedProductId,
  setSelectedProductId,
  tempQuantity,
  setTempQuantity,
  tempPrice,
  setTempPrice,
  addProductToDetalles,
  removeProductFromDetalles,
}: CompraFormDialogProps) {
  const totalPurchase = formData.detalles.reduce(
    (acc, curr) => acc + curr.cantidad * curr.precioUnitario,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 !w-[95vw] !max-w-[850px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 luxury-header-gradient">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md"
              style={{ width: 44, height: 44 }}
            >
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white leading-tight">
                Registrar Nueva Compra
              </DialogTitle>
              <p className="text-xs text-white/60 mt-0.5">
                Incrementa el stock con nuevas adquisiciones
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 grid grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Datos Generales y Añadir Producto */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#c47b96]" /> Información
                General
              </h3>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-gray-400">
                  Proveedor
                </Label>
                <Select
                  value={formData.proveedorId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, proveedorId: v })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-200 rounded-xl h-11">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-gray-400">
                  Observaciones
                </Label>
                <Input
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  className="bg-white border-gray-200 rounded-xl h-20"
                  placeholder="Ej: Factura #12345..."
                />
              </div>
            </div>

            <div className="space-y-4 bg-[#fff0f5]/20 p-6 rounded-2xl border border-[#fad6e3]/30">
              <h3 className="text-xs font-bold text-[#c47b96] uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4" /> Añadir Producto
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-gray-400">
                    Producto
                  </Label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger className="bg-white border-gray-200 rounded-xl h-11">
                      <SelectValue placeholder="Buscar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-gray-400">
                      Cantidad
                    </Label>
                    <Input
                      type="number"
                      value={tempQuantity}
                      onChange={(e) => setTempQuantity(Number(e.target.value))}
                      className="bg-white border-gray-200 rounded-xl h-11 text-center font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-gray-400">
                      Precio Unit.
                    </Label>
                    <Input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(Number(e.target.value))}
                      className="bg-white border-gray-200 rounded-xl h-11 font-bold"
                      placeholder="$ 0.00"
                    />
                  </div>
                </div>

                <Button
                  onClick={addProductToDetalles}
                  className="w-full bg-[#c47b96] hover:bg-[#b06a84] text-white rounded-xl h-11 font-bold shadow-lg shadow-pink-100 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Agregar a la lista
                </Button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tabla de Items y Totales */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]">
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Resumen de Items
                </span>
                <span className="px-3 py-1 bg-[#fff0f5] text-[#c47b96] rounded-lg text-xs font-black uppercase">
                  {formData.detalles.length} Productos
                </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[350px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-100 hover:bg-transparent">
                      <TableHead className="text-[10px] font-bold text-gray-400 uppercase py-3">
                        Producto
                      </TableHead>
                      <TableHead className="text-[10px] font-bold text-gray-400 uppercase py-3 text-center">
                        Cant.
                      </TableHead>
                      <TableHead className="text-[10px] font-bold text-gray-400 uppercase py-3 text-right">
                        Subtotal
                      </TableHead>
                      <TableHead className="text-[10px] font-bold text-gray-400 uppercase py-3 text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.detalles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-64 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-300">
                            <ShoppingBag className="w-12 h-12" />
                            <p className="text-sm font-medium">
                              La lista está vacía
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.detalles.map((d, i) => {
                        const prod = productos.find(
                          (p) => p.id === d.productoId,
                        );
                        return (
                          <TableRow
                            key={i}
                            className="border-b border-gray-50 group hover:bg-gray-50/50"
                          >
                            <TableCell className="py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800 line-clamp-1">
                                  {prod?.nombre}
                                </span>
                                <span className="text-[10px] font-semibold text-gray-400">
                                  {formatCurrency(d.precioUnitario)} p/u
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-black text-gray-700">
                              {d.cantidad}
                            </TableCell>
                            <TableCell className="text-right font-black text-[#c47b96]">
                              {formatCurrency(d.cantidad * d.precioUnitario)}
                            </TableCell>
                            <TableCell className="text-center">
                              <button
                                onClick={() => removeProductFromDetalles(i)}
                                className="p-1.5 rounded-lg text-gray-300 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-auto bg-gray-50 p-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Total de la Compra
                    </span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">
                      {formatCurrency(totalPurchase)}
                    </span>
                  </div>
                  <button
                    onClick={onSave}
                    disabled={isSaving || formData.detalles.length === 0}
                    className="h-12 px-8 rounded-xl font-bold bg-[#c47b96] text-white hover:bg-[#b06a84] shadow-lg shadow-pink-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSaving ? "Registrando..." : "Registrar Compra"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
