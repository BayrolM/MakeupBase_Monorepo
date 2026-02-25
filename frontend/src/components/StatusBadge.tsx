import { Status, OrderStatus } from '../lib/store';

interface StatusBadgeProps {
  status: Status | OrderStatus | 'pendiente' | 'confirmada' | 'anulada' | 'aprobada' | 'rechazada' | 'en_revision';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'activo':
      case 'confirmada':
      case 'aprobada':
      case 'entregado':
        return { bg: '#3FC27A', text: '#0B0B0B', label: status === 'activo' ? 'Activo' : status === 'confirmada' ? 'Confirmada' : status === 'aprobada' ? 'Aprobada' : 'Entregado' };
      case 'inactivo':
        return { bg: '#BFA1A6', text: '#0B0B0B', label: 'Inactivo' };
      case 'pendiente':
      case 'creado':
        return { bg: '#FFB86B', text: '#0B0B0B', label: status === 'pendiente' ? 'Pendiente' : 'Creado' };
      case 'anulado':
      case 'anulada':
      case 'rechazada':
        return { bg: '#FF6B6B', text: '#F3EAEA', label: status === 'anulada' ? 'Anulada' : status === 'rechazada' ? 'Rechazada' : 'Anulado' };
      case 'en_proceso':
        return { bg: '#E7BFC5', text: '#0B0B0B', label: 'En Proceso' };
      case 'en_revision':
        return { bg: '#4A90E2', text: '#F3EAEA', label: 'En Revisión' };
      case 'despachado':
        return { bg: '#C87A88', text: '#F3EAEA', label: 'Despachado' };
      default:
        return { bg: '#BFA1A6', text: '#0B0B0B', label: status };
    }
  };

  const config = getStatusConfig();
  const height = size === 'sm' ? '24px' : '32px';
  const fontSize = size === 'sm' ? '12px' : '13px';
  const padding = size === 'sm' ? '0 10px' : '0 14px';

  return (
    <span
      className="inline-flex items-center justify-center rounded-full"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        height,
        padding,
        fontSize,
        fontWeight: 500,
      }}
    >
      {config.label}
    </span>
  );
}