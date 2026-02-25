import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useState } from 'react';

interface CompraStatusSwitchProps {
  status: 'pendiente' | 'confirmada' | 'anulada';
  onChange: (newStatus: 'pendiente' | 'confirmada' | 'anulada') => void;
  disabled?: boolean;
}

export function CompraStatusSwitch({ status, onChange, disabled = false }: CompraStatusSwitchProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'pendiente' | 'confirmada' | 'anulada' | null>(null);

  const handleStatusChange = (newStatus: string) => {
    const typedStatus = newStatus as 'pendiente' | 'confirmada' | 'anulada';
    
    // Si el estado actual es diferente al nuevo, mostrar confirmación
    if (typedStatus !== status) {
      setPendingStatus(typedStatus);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirm = () => {
    if (pendingStatus) {
      onChange(pendingStatus);
      setShowConfirmDialog(false);
      setPendingStatus(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingStatus(null);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmada':
        return 'Confirmada';
      case 'anulada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'text-[#FFA500]';
      case 'confirmada':
        return 'text-[#3FC27A]';
      case 'anulada':
        return 'text-[#FF6B6B]';
      default:
        return 'text-foreground-secondary';
    }
  };

  return (
    <>
      <Select value={status} onValueChange={handleStatusChange} disabled={disabled}>
        <SelectTrigger 
          className={`w-[140px] h-8 border-border bg-input-background ${getStatusColor(status)}`}
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem 
            value="pendiente" 
            className="text-[#FFA500] hover:text-[#FFA500] focus:text-[#FFA500]"
            style={{ fontSize: '13px' }}
          >
            Pendiente
          </SelectItem>
          <SelectItem 
            value="confirmada" 
            className="text-[#3FC27A] hover:text-[#3FC27A] focus:text-[#3FC27A]"
            style={{ fontSize: '13px' }}
          >
            Confirmada
          </SelectItem>
          <SelectItem 
            value="anulada" 
            className="text-[#FF6B6B] hover:text-[#FF6B6B] focus:text-[#FF6B6B]"
            style={{ fontSize: '13px' }}
          >
            Cancelada
          </SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Confirmar Cambio de Estado
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground-secondary">
              ¿Estás seguro de que deseas cambiar el estado de <span className={getStatusColor(status)}>{getStatusLabel(status)}</span> a <span className={pendingStatus ? getStatusColor(pendingStatus) : ''}>{pendingStatus ? getStatusLabel(pendingStatus) : ''}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancel}
              className="border-border text-foreground hover:bg-surface"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
