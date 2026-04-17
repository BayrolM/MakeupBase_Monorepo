import { Plus, Users } from "lucide-react";

interface ClientHeaderProps {
  onOpenDialog: () => void;
}

export function ClientHeader({ onOpenDialog }: ClientHeaderProps) {
  return (
    <div className="px-8 pt-8 pb-5">
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <div className="relative px-6 py-8 luxury-header-gradient">
          <div className="relative flex flex-wrap gap-6 justify-between items-center z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight luxury-text-cream">
                    Clientes
                  </h1>
                  <p className="text-sm mt-0.5 luxury-text-cream">
                    Gestión de clientes de Glamour ML
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenDialog}
              className="luxury-button-premium"
            >
              <Plus className="w-5 h-5" />
              Nuevo Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
