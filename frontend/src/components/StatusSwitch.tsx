import { Status } from '../lib/store';

interface StatusSwitchProps {
  status: Status;
  onChange: (newStatus: Status) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export function StatusSwitch({ status, onChange, disabled = false, showLabel = true }: StatusSwitchProps) {
  const isActive = status === 'activo';
  
  const handleToggle = () => {
    if (!disabled) {
      onChange(isActive ? 'inactivo' : 'activo');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={disabled}
        type="button"
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-all duration-300 ease-in-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
          ${isActive ? 'bg-[#3FC27A]' : 'bg-[#FF6B6B]'}
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isActive ? 'focus:ring-[#3FC27A]' : 'focus:ring-[#FF6B6B]'}
        `}
        role="switch"
        aria-checked={isActive}
        aria-label={isActive ? 'Estado activo' : 'Estado inactivo'}
        title={isActive ? 'Activo - Click para desactivar' : 'Inactivo - Click para activar'}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full 
            bg-white shadow-lg
            transition-transform duration-300 ease-in-out
            ${isActive ? 'translate-x-6' : 'translate-x-0.5'}
          `}
        />
      </button>
      {showLabel && (
        <span 
          className={`
            select-none transition-colors duration-200
            ${isActive ? 'text-success' : 'text-danger'}
          `}
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          {isActive ? 'Activo' : 'Inactivo'}
        </span>
      )}
    </div>
  );
}
