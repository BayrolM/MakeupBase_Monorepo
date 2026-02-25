import { ShieldX } from 'lucide-react';
import { Button } from './ui/button';

interface AccessDeniedProps {
  onNavigateHome: () => void;
}

export function AccessDenied({ onNavigateHome }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-12 h-12 text-danger" />
        </div>
        
        <h1 className="text-foreground mb-3" style={{ fontSize: '28px', fontWeight: 600 }}>
          Acceso Denegado
        </h1>
        
        <p className="text-foreground-secondary mb-6" style={{ fontSize: '16px' }}>
          No tienes permisos para acceder a esta sección. Por favor, contacta al administrador si crees que esto es un error.
        </p>
        
        <Button
          onClick={onNavigateHome}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Volver al Inicio
        </Button>
        
        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
            <strong className="text-foreground">Nota:</strong> El acceso a las secciones del sistema está determinado por tu rol de usuario.
          </p>
        </div>
      </div>
    </div>
  );
}
