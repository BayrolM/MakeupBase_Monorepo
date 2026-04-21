import { X, Eye, Download } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription
} from "../../ui/dialog";
import { Button } from "../../ui/button";

interface PedidoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
}

export function PedidoPreviewDialog({
  open,
  onOpenChange,
  imageUrl,
}: PedidoPreviewDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-[900px] sm:max-w-[900px] w-[95vw] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 12,
                background: "linear-gradient(135deg,#c47b96,#e092b2)",
                boxShadow: "0 2px 8px rgba(196,123,150,0.3)"
              }}
            >
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Comprobante de Pago
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Previsualización del archivo adjunto
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={imageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#c47b96] bg-[#fff0f5] hover:bg-[#fce8f0] transition-all text-xs font-bold"
              title="Abrir en nueva pestaña"
            >
              <Download className="w-4 h-4" />
              Descargar Original
            </a>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Imagen */}
        <div className="p-8 bg-gray-50/50 flex items-center justify-center min-h-[400px] max-h-[75vh] overflow-hidden">
          <div className="relative group">
            <img 
              src={imageUrl} 
              alt="Comprobante de pago" 
              className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-xl border border-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Error+al+cargar+imagen";
              }}
            />
            <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] pointer-events-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-4 bg-white border-t border-gray-100">
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-10 h-11 text-sm font-bold text-white transition-all shadow-md hover:shadow-lg active:scale-95 border-0"
            style={{ background: "#c47b96" }}
          >
            Cerrar Vista
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
