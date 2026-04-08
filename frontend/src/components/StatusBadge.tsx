import { Status, OrderStatus } from '../lib/store';

interface StatusBadgeProps {
  status: Status | OrderStatus | 'pendiente' | 'confirmada' | 'anulada' | 'anulado' | 'aprobada' | 'rechazada' | 'en_revision' | 'creado' | 'preparado' | 'procesando' | 'en_proceso' | 'despachado' | 'cancelado' | 'enviado';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'activo':
      case 'confirmada':
      case 'aprobada':
      case 'entregado':
        return { bg: '#f0fdf4', text: '#16a34a', border: '1px solid #bbf7d0', label: status === 'activo' ? 'Activo' : status === 'confirmada' ? 'Confirmada' : status === 'aprobada' ? 'Aprobada' : 'Entregado' };
      
      case 'inactivo':
        return { bg: '#f1f5f9', text: '#64748b', border: '1px solid #e2e8f0', label: 'Inactivo' };
      
      case 'pendiente':
      case 'creado':
        return { bg: '#fff7ed', text: '#ea580c', border: '1px solid #fed7aa', label: status === 'pendiente' ? 'Pendiente' : 'Creado' };
      
      case 'anulado':
      case 'anulada':
      case 'rechazada':
      case 'cancelado':
        return { bg: '#fef2f2', text: '#dc2626', border: '1px solid #fecaca', label: (status === 'anulada' || status === 'anulado' || status === 'cancelado') ? 'Cancelado' : 'Rechazada' };
      
      case 'en_proceso':
      case 'preparado':
      case 'procesando':
        return { bg: '#f3e8ff', text: '#9333ea', border: '1px solid #e9d5ff', label: 'En Proceso' };
      
      case 'en_revision':
        return { bg: '#e0f2fe', text: '#0284c7', border: '1px solid #bae6fd', label: 'En Revisión' };
      
      case 'despachado':
      case 'enviado':
        return { bg: '#eff6ff', text: '#2563eb', border: '1px solid #bfdbfe', label: 'En Camino' };
      
      default:
        return { bg: '#f1f5f9', text: '#64748b', border: '1px solid #e2e8f0', label: String(status) };
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
        border: config.border,
        height,
        padding,
        fontSize,
        fontWeight: 600,
      }}
    >
      {config.label}
    </span>
  );
}