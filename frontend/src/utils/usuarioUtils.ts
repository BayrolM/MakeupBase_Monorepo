/**
 * Utilidades para el módulo de Usuarios
 * Proporciona etiquetas y estilos consistentes con el diseño Luxury Pink.
 */

export const getRolLabel = (rol: string) => {
  const map: Record<string, string> = {
    admin: 'Administrador',
    vendedor: 'Vendedor',
    cliente: 'Cliente',
    bodeguero: 'Bodeguero'
  };
  return map[rol] || rol;
};

export const getTipoDocumentoLabel = (tipo: string) => {
  const map: Record<string, string> = {
    CC: 'Cédula de Ciudadanía',
    TI: 'Tarjeta de Identidad',
    CE: 'Cédula de Extranjería',
    PAS: 'Pasaporte',
    NIT: 'NIT',
    OTRO: 'Otro'
  };
  return map[tipo] || tipo;
};

export const getRolBadgeStyles = (rol: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    admin: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
    vendedor: { bg: 'bg-sky-50', text: 'text-sky-700' },
    cliente: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    bodeguero: { bg: 'bg-amber-50', text: 'text-amber-700' },
  };
  return map[rol] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

export const validateField = (name: string, value: string, editingUser?: any) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  switch (name) {
    case 'nombres':
    case 'apellidos': {
      const label = name === 'nombres' ? 'El nombre' : 'El apellido';
      if (!value.trim()) return `${label} es obligatorio`;
      if (value.trim().length > 80) return `${label} no puede superar 80 caracteres`;
      return '';
    }
    case 'numeroDocumento':
      if (!value.trim()) return 'El documento es obligatorio';
      if (value.trim().length > 10) return 'Máximo 10 caracteres';
      return '';
    case 'email':
      if (!value.trim()) return 'El email es obligatorio';
      if (!emailRegex.test(value.trim())) return 'Formato de email inválido';
      if (value.trim().length > 100) return 'Máximo 100 caracteres';
      return '';
    case 'passwordHash':
      if (!editingUser) {
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 8) return 'Mínimo 8 caracteres';
      }
      return '';
    case 'telefono':
      if (!value.trim()) return 'El teléfono es obligatorio';
      if (value.trim().length > 20) return 'Máximo 20 caracteres';
      return '';
    case 'direccion':
      if (value.trim() && value.trim().length < 3) return 'Mínimo 3 caracteres';
      if (value.trim().length > 30) return 'Máximo 30 caracteres';
      return '';
    case 'ciudad':
      if (value.trim().length > 50) return 'Máximo 50 caracteres';
      return '';
    default:
      return '';
  }
};
