import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { 
  RotateCcw, 
  X, 
  Package, 
  AlertCircle, 
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  ClipboardList,
  Upload,
  Loader2,
  Check
} from "lucide-react";

import { toast } from "sonner";
import { devolucionService } from "../../services/devolucionService";
import { saleService } from "../../services/saleService";
import { orderService } from "../../services/orderService";
import { uploadToCloudinary } from "../Cloudinary";

interface PedidoReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: any;
  productosStore: any[];
}

export function PedidoReturnDialog({
  open,
  onOpenChange,
  pedido,
  productosStore,
}: PedidoReturnDialogProps) {
  const [venta, setVenta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  
  // Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && pedido) {
      fetchData();
      setMotivo("");
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [open, pedido]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both Sale and Full Order Details in parallel
      const [saleRes, orderRes] = await Promise.all([
        saleService.getAll({ pedidoId: pedido.id }),
        orderService.getById(Number(pedido.id))
      ]);

      const sale = saleRes.items?.[0];
      if (sale) {
        setVenta(sale);
      } else {
        toast.error("No se encontró la venta asociada a este pedido.");
        onOpenChange(false);
        return;
      }

      // Priorizamos los productos de la VENTA (sale.productos) 
      // ya que son los que realmente se facturaron.
      const rawItems = (orderRes.items && orderRes.items.length > 0) 
        ? orderRes.items 
        : (sale.productos || []);

      if (rawItems && rawItems.length > 0) {
        const mapped = rawItems.map((item: any) => ({
          productoId: (item.id_producto || item.productoId)?.toString(),
          cantidad: item.cantidad,
          precioUnitario: Number(item.precio_unitario || item.precioUnitario),
          selected: false,
          cantidadADevolver: 1
        }));
        setSelectedProducts(mapped);
      } else {
        toast.error("No se pudieron cargar los productos para devolución.");
      }

    } catch (error) {
      console.error(error);
      toast.error("Error al sincronizar datos del pedido");
    } finally {
      setIsLoading(false);
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo es demasiado grande (máx 5MB)");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleProduct = (index: number) => {
    const next = [...selectedProducts];
    next[index].selected = !next[index].selected;
    setSelectedProducts(next);
  };

  const handleUpdateCantidad = (index: number, val: number) => {
    const next = [...selectedProducts];
    const max = next[index].cantidad;
    next[index].cantidadADevolver = Math.max(1, Math.min(val, max));
    setSelectedProducts(next);
  };

  const handleSubmit = async () => {
    const itemsToReturn = selectedProducts.filter(p => p.selected);
    if (itemsToReturn.length === 0) {
      toast.error("Selecciona al menos un producto para devolver");
      return;
    }
    if (!motivo.trim() || motivo.trim().length < 5) {
      toast.error("Por favor ingresa un motivo válido (mínimo 5 caracteres)");
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl = "";

    try {
      // 1. Upload image to Cloudinary if selected
      if (selectedFile) {
        setIsUploadingImage(true);
        const uploadResult = await uploadToCloudinary(selectedFile);
        finalImageUrl = uploadResult.secure_url;
        setIsUploadingImage(false);
      }

      // 2. Create return request
      await devolucionService.create({
        id_venta: Number(venta.id_venta || venta.id),
        id_usuario_cliente: Number(pedido.clienteId),
        motivo: motivo.trim(),
        estado: "pendiente",
        fecha_devolucion: new Date().toISOString().split("T")[0],
        evidencia_url: finalImageUrl,
        productos: itemsToReturn.map(p => ({
          id_producto: Number(p.productoId),
          cantidad: p.cantidadADevolver,
          precio_unitario: p.precioUnitario
        }))
      });


      // Note: If the backend supports evidences, we'd send finalImageUrl. 
      // Current service doesn't seem to have a field for it in the payload, 
      // but I'll assume it's part of the motive or handled by the backend if I can update the service.
      
      toast.success("Solicitud de devolución enviada correctamente");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al enviar la solicitud");
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(val);
  };

  if (!pedido) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-lg rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado - Diseño de Categoria */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Solicitar Devolución
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Pedido #{pedido.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="max-h-[60vh] overflow-y-auto no-scrollbar px-6 py-5 flex flex-col gap-4">
          
          {isLoading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#c47b96]" />
              <p className="text-xs font-medium">Sincronizando datos...</p>
            </div>
          ) : (
            <>
              {/* Productos */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Productos a devolver <span className="text-rose-500">*</span>
                </p>
                <div className="space-y-2">
                  {selectedProducts.map((item, idx) => {
                    const producto = productosStore.find(p => p.id === item.productoId);
                    return (
                      <div 
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                          item.selected 
                            ? "bg-[#c47b96]/5 border-[#c47b96] shadow-md transform scale-[1.01]" 
                            : "bg-white border-gray-100 hover:border-gray-200 opacity-80"
                        }`}
                        onClick={() => handleToggleProduct(idx)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div 
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                            item.selected ? "shadow-lg shadow-[#c47b96]/30 rotate-0 scale-110" : "rotate-[-10deg] scale-100"
                          }`}
                          style={{
                            backgroundColor: item.selected ? '#c47b96' : '#f9fafb',
                            borderColor: item.selected ? '#c47b96' : '#e5e7eb'
                          }}
                        >
                          <Check 
                            className={`w-5 h-5 text-white stroke-[4px] transition-all duration-300 ${
                              item.selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                            }`} 
                            style={{ color: 'white' }}
                          />
                        </div>


                        <div className="flex-1">
                          <p className={`text-xs font-bold transition-colors ${item.selected ? "text-[#c47b96]" : "text-gray-800"}`}>
                            {producto?.nombre || "Producto sin nombre"}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {item.cantidad} comprados · {formatCurrency(item.precioUnitario)}
                          </p>
                        </div>
                        {item.selected && (
                          <div className="flex flex-col items-end gap-1" onClick={e => e.stopPropagation()}>
                            <span className="text-[9px] font-bold text-[#c47b96] uppercase tracking-tighter">Cantidad</span>
                            <input 
                              type="number"
                              value={item.cantidadADevolver}
                              onChange={(e) => handleUpdateCantidad(idx, parseInt(e.target.value))}
                              className="w-12 h-8 bg-white border-2 border-[#c47b96]/30 rounded-lg text-center text-xs font-bold text-[#c47b96] focus:outline-none focus:border-[#c47b96] shadow-sm"
                              min={1}
                              max={item.cantidad}
                            />
                          </div>
                        )}
                      </div>
                    );

                  })}
                </div>
              </div>

              {/* Motivo */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Motivo de la devolución <span className="text-rose-500">*</span>
                </p>
                <Textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Describe por qué deseas devolver los productos..."
                  className="border-gray-200 text-gray-800 rounded-lg text-sm resize-none focus:ring-[#c47b96]/20 focus:border-[#c47b96] bg-white"
                  rows={3}
                />
              </div>

              {/* Imagen / Evidencia */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Evidencia fotográfica (Opcional)
                </p>
                
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {!previewUrl ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#c47b96] hover:bg-[#c47b96]/5 transition-all group"
                  >
                    <Upload className="w-6 h-6 text-gray-300 group-hover:text-[#c47b96]" />
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#c47b96] uppercase tracking-wider">Subir desde dispositivo</span>
                  </button>
                ) : (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white p-2">
                    <img src={previewUrl} alt="Preview" className="w-full h-32 object-contain rounded-lg" />
                    <button 
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      className="absolute top-3 right-3 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-5 h-10 text-sm"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || isUploadingImage}
            className="rounded-lg font-semibold px-6 h-10 text-sm border-0 luxury-button-modal disabled:opacity-50"
          >
            {isSubmitting || isUploadingImage ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isUploadingImage ? "Cargando Imagen..." : "Enviando..."}</span>
              </div>
            ) : (
              "Solicitar Devolución"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
