import { X, Eye, Download } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle 
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
      <DialogContent className="bg-white border border-gray-100 max-w-3xl rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-[#c47b96] bg-[#fff0f5] flex-shrink-0"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Comprobante de Pago
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                Previsualización del archivo adjunto
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={imageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full text-gray-400 hover:text-[#c47b96] hover:bg-gray-100 transition-colors"
              title="Abrir en nueva pestaña"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Imagen */}
        <div className="p-6 bg-gray-50 flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-hidden">
          <img 
            src={imageUrl} 
            alt="Comprobante de pago" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-md border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Error+al+cargar+imagen";
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-4 bg-white border-t border-gray-100">
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-10 h-11 text-sm font-bold bg-[#c47b96] text-white hover:opacity-90 border-0"
          >
            Cerrar Vista
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
