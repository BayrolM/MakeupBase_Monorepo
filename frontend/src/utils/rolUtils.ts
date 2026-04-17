/**
 * Utilidades para el módulo de Roles y Permisos
 */

export const MODULOS = [
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'productos', label: 'Productos' },
  { key: 'ventas', label: 'Ventas' },
  { key: 'compras', label: 'Compras' },
  { key: 'pedidos', label: 'Pedidos' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'proveedores', label: 'Proveedores' },
  { key: 'devoluciones', label: 'Devoluciones' },
  { key: 'configuracion', label: 'Configuración' },
];

export const INITIAL_PERMISOS = {
  usuarios: { ver: false, crear: false, editar: false, eliminar: false },
  productos: { ver: false, crear: false, editar: false, eliminar: false },
  ventas: { ver: false, crear: false, editar: false, eliminar: false },
  compras: { ver: false, crear: false, editar: false, eliminar: false },
  pedidos: { ver: false, crear: false, editar: false, eliminar: false },
  clientes: { ver: false, crear: false, editar: false, eliminar: false },
  proveedores: { ver: false, crear: false, editar: false, eliminar: false },
  devoluciones: { ver: false, crear: false, editar: false, eliminar: false },
  configuracion: { ver: false, crear: false, editar: false, eliminar: false },
};

export const getPermisoIcon = (tipo: string) => {
  switch (tipo) {
    case 'ver': return '👁️';
    case 'crear': return '➕';
    case 'editar': return '✏️';
    case 'eliminar': return '🗑️';
    default: return '';
  }
};
