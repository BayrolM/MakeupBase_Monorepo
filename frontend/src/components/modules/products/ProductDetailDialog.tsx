import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import {
  X,
  Package,
  Layers,
  Tag,
  DollarSign,
  Boxes,
  Activity,
  Calendar,
  Info,
} from "lucide-react";
import { Producto, Categoria } from "../../../lib/store";
import { formatCurrency, getStockStatus } from "../../../utils/productUtils";

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Producto | null;
  categorias: Categoria[];
}

export function ProductDetailDialog({
  open,
  onOpenChange,
  product,
  categorias,
}: ProductDetailDialogProps) {
  if (!product) return null;

  const stockStatus = getStockStatus(product);
  const categoria = categorias.find((c) => c.id === product.categoriaId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden bg-white border-0 shadow-2xl max-w-2xl rounded-2xl">
        {/* Encabezado estandarizado (sin vinotinto) */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md border border-gray-100 overflow-hidden shrink-0">
              {product.imagenUrl ? (
                <img
                  src={product.imagenUrl}
                  alt={product.nombre}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-xl">
                  <Package className="w-8 h-8 text-gray-200" />
                </div>
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight">
                {product.nombre}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  ID: {product.id.slice(0, 8)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                  product.estado === 'activo'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}>
                  {product.estado}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pb-8 px-8 pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  Información General
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                      <Layers className="w-5 h-5 text-[#c47b96]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Categoría</p>
                      <p className="text-sm font-semibold text-gray-700">{categoria?.nombre || 'Sin categoría'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                      <Tag className="w-5 h-5 text-[#c47b96]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Marca</p>
                      <p className="text-sm font-semibold text-gray-700">{product.marca || 'Genérica'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Precios
                </h3>
                <div className="p-4 rounded-2xl bg-[#c47b96]/5 border border-[#c47b96]/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Precio Venta</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(product.precioVenta)}</span>
                  </div>
                  <div className="h-px bg-[#c47b96]/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Precio Compra</span>
                    <span className="text-sm font-semibold text-gray-600">{formatCurrency(product.precioCompra)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Boxes className="w-3.5 h-3.5" />
                  Inventario
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Stock Actual</p>
                    <p className={`text-xl font-bold ${stockStatus?.color || 'text-gray-900'}`}>{product.stock}</p>
                    <p className="text-[10px] font-medium text-gray-500">unidades</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mínimo</p>
                    <p className="text-xl font-bold text-gray-700">{product.stockMinimo}</p>
                    <p className="text-[10px] font-medium text-gray-500">alerta</p>
                  </div>
                </div>
                {stockStatus && (
                  <div className={`flex items-center gap-2 p-2.5 rounded-xl border border-current/20 ${stockStatus.bgColor} ${stockStatus.color}`}>
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold">{stockStatus.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  Descripción
                </h3>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 min-h-[100px]">
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    {product.descripcion || '"Sin descripción disponible para este producto."'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-3 h-12 text-sm font-bold luxury-button-modal rounded-xl"
          >
            Cerrar Detalle
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
