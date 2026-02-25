import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

// Types
export type UserRole = 'admin' | 'vendedor' | 'cliente';
export type OrderStatus = 'pendiente' | 'preparado' | 'entregado' | 'cancelado';
export type Status = 'activo' | 'inactivo';
export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'PAS' | 'NIT' | 'OTRO';

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  estado: Status;
  permisos: {
    [modulo: string]: {
      ver: boolean;
      crear: boolean;
      editar: boolean;
      eliminar: boolean;
    };
  };
}

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  fechaNacimiento?: string;
  email: string;
  passwordHash: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  rol: UserRole;
  rolAsignadoId?: string; // ID del rol personalizado asignado
  estado: Status;
  fechaCreacion: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
  estado: Status;
  totalCompras: number;
  fechaRegistro: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  nit: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: Status;
  fechaRegistro: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  estado: Status;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  marca: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  imagen?: string;
  estado: Status;
  fechaCreacion: string;
}

export interface Compra {
  id: string;
  proveedorId: string;
  fecha: string;
  productos: { productoId: string; cantidad: number; precioUnitario: number }[];
  total: number;
  estado: 'pendiente' | 'confirmada' | 'anulada';
  confirmada: boolean;
  observaciones?: string;
  motivoAnulacion?: string;
}

export interface Venta {
  id: string;
  clienteId: string;
  pedidoId?: string; // FK opcional a Pedido - puede ser NULL para ventas directas
  fecha: string;
  productos: { productoId: string; cantidad: number; precioUnitario: number }[];
  subtotal: number;
  iva: number;
  costoEnvio: number;
  total: number;
  estado: 'activo' | 'anulada';
  metodoPago: 'Efectivo' | 'Transferencia'; // Solo estos dos métodos permitidos
  motivoAnulacion?: string;
}

export interface Pedido {
  id: string;
  clienteId: string;
  fecha: string;
  productos: { productoId: string; cantidad: number; precioUnitario: number }[];
  subtotal: number;
  iva: number;
  costoEnvio: number;
  total: number;
  estado: OrderStatus; // pendiente, preparado, entregado, cancelado
  direccionEnvio: string;
  motivoAnulacion?: string;
}

export interface Devolucion {
  id: string;
  ventaId: string;
  clienteId: string;
  fecha: string;
  motivo: string;
  productos: { productoId: string; cantidad: number }[];
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada' | 'anulada';
  evidencias: string[];
  totalDevuelto: number;
  motivoDecision?: string;
  motivoAnulacion?: string;
  fechaAnulacion?: string;
}

interface StoreState {
  users: User[];
  clientes: Cliente[];
  proveedores: Proveedor[];
  categorias: Categoria[];
  productos: Producto[];
  compras: Compra[];
  ventas: Venta[];
  pedidos: Pedido[];
  devoluciones: Devolucion[];
  roles: Rol[];
  currentUser: User | null;
  userType: 'admin' | 'cliente';
  favoritos: string[];
  carrito: { productoId: string; cantidad: number }[];
}

interface StoreActions {
  // Users
  addUser: (user: Omit<User, 'id' | 'fechaCreacion'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Clientes
  addCliente: (cliente: Omit<Cliente, 'id' | 'fechaRegistro'>) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  
  // Proveedores
  addProveedor: (proveedor: Omit<Proveedor, 'id' | 'fechaRegistro'>) => void;
  updateProveedor: (id: string, proveedor: Partial<Proveedor>) => void;
  deleteProveedor: (id: string) => void;
  
  // Categorias
  addCategoria: (categoria: Omit<Categoria, 'id'>) => void;
  updateCategoria: (id: string, categoria: Partial<Categoria>) => void;
  deleteCategoria: (id: string) => void;
  
  // Productos
  addProducto: (producto: Omit<Producto, 'id' | 'fechaCreacion'>) => void;
  updateProducto: (id: string, producto: Partial<Producto>) => void;
  deleteProducto: (id: string) => void;
  updateStock: (productoId: string, cantidad: number) => void;
  
  // Compras
  addCompra: (compra: Omit<Compra, 'id'>) => void;
  updateCompra: (id: string, compra: Partial<Compra>) => void;
  confirmarCompra: (id: string) => void;
  
  // Ventas
  addVenta: (venta: Omit<Venta, 'id'>) => void;
  updateVenta: (id: string, venta: Partial<Venta>) => void;
  anularVenta: (id: string, motivo: string) => void;
  
  // Pedidos
  addPedido: (pedido: Omit<Pedido, 'id'>) => void;
  updatePedido: (id: string, pedido: Partial<Pedido>) => void;
  updatePedidoEstado: (id: string, estado: OrderStatus, motivo?: string) => void;
  
  // Devoluciones
  addDevolucion: (devolucion: Omit<Devolucion, 'id'>) => void;
  updateDevolucion: (id: string, devolucion: Partial<Devolucion>) => void;
  
  // Roles
  addRol: (rol: Omit<Rol, 'id'>) => void;
  updateRol: (id: string, rolData: Partial<Rol>) => void;
  deleteRol: (id: string) => void;
  
  // Auth
  setCurrentUser: (user: User | null) => void;
  setUserType: (type: 'admin' | 'cliente') => void;
  
  // Client Actions
  toggleFavorito: (productoId: string) => void;
  addToCarrito: (productoId: string, cantidad: number) => void;
  removeFromCarrito: (productoId: string) => void;
  updateCarritoQuantity: (productoId: string, cantidad: number) => void;
  clearCarrito: () => void;
  setProductos: (productos: Producto[]) => void;
  setCategorias: (categorias: Categoria[]) => void;
  setProveedores: (proveedores: Proveedor[]) => void;
  setCompras: (compras: Compra[]) => void;
  setUsers: (users: User[]) => void;
  setClientes: (clientes: Cliente[]) => void;
}

const StoreContext = createContext<(StoreState & StoreActions) | undefined>(undefined);

// Mock Data
const mockUsers: User[] = [
  {
    id: '1',
    nombre: 'Administrador General',
    apellido: 'Admin',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567890',
    fechaNacimiento: '1980-01-01',
    email: 'admin@glamour.com',
    passwordHash: 'hashed_password_admin',
    telefono: '3001234567',
    direccion: 'Calle 50 #45-30, Medellín',
    ciudad: 'Medellín',
    pais: 'Colombia',
    rol: 'admin',
    estado: 'activo',
    fechaCreacion: '2024-01-01',
  },
  {
    id: '2',
    nombre: 'Melissa López Patiño',
    apellido: 'López',
    tipoDocumento: 'CC',
    numeroDocumento: '0987654321',
    fechaNacimiento: '1985-05-15',
    email: 'melissa@glamourml.com',
    passwordHash: 'hashed_password_melissa',
    telefono: '3001234568',
    rol: 'admin',
    estado: 'activo',
    fechaCreacion: '2024-01-15',
  },
  {
    id: '3',
    nombre: 'Juan Vendedor',
    apellido: 'Vendedor',
    tipoDocumento: 'CC',
    numeroDocumento: '1122334455',
    fechaNacimiento: '1990-07-20',
    email: 'juan.vendedor@glamourml.com',
    passwordHash: 'hashed_password_juan',
    telefono: '3009876543',
    rol: 'vendedor',
    estado: 'activo',
    fechaCreacion: '2024-02-20',
  },
  {
    id: '4',
    nombre: 'María Vendedora',
    apellido: 'Vendedora',
    tipoDocumento: 'CC',
    numeroDocumento: '5544332211',
    fechaNacimiento: '1995-03-10',
    email: 'maria.vendedora@glamourml.com',
    passwordHash: 'hashed_password_maria',
    telefono: '3005554433',
    rol: 'vendedor',
    estado: 'activo',
    fechaCreacion: '2024-03-10',
  },
  {
    id: '5',
    nombre: 'Carlos Cliente',
    apellido: 'Cliente',
    tipoDocumento: 'CC',
    numeroDocumento: '6677889900',
    fechaNacimiento: '2000-04-05',
    email: 'carlos.cliente@mail.com',
    passwordHash: 'hashed_password_carlos',
    telefono: '3112223344',
    rol: 'cliente',
    estado: 'activo',
    fechaCreacion: '2024-04-05',
  },
  {
    id: '6',
    nombre: 'Laura Vendedora',
    apellido: 'Vendedora',
    tipoDocumento: 'CC',
    numeroDocumento: '0099887766',
    fechaNacimiento: '1988-01-30',
    email: 'laura.vendedora@glamourml.com',
    passwordHash: 'hashed_password_laura',
    telefono: '3158889999',
    rol: 'vendedor',
    estado: 'inactivo',
    fechaCreacion: '2024-01-30',
  },
];

const mockClientes: Cliente[] = [
  {
    id: 'c1',
    nombre: 'Andrea Gómez',
    email: 'andrea.gomez@mail.com',
    telefono: '3101234567',
    documento: '1234567890',
    estado: 'activo',
    totalCompras: 4,
    fechaRegistro: '2024-01-10',
  },
  {
    id: 'c2',
    nombre: 'Carlos Pérez',
    email: 'carlos.perez@mail.com',
    telefono: '3149876543',
    documento: '9876543210',
    estado: 'activo',
    totalCompras: 2,
    fechaRegistro: '2024-02-15',
  },
  {
    id: 'c3',
    nombre: 'Laura Martínez',
    email: 'laura.martinez@mail.com',
    telefono: '3005554433',
    documento: '5554443333',
    estado: 'inactivo',
    totalCompras: 1,
    fechaRegistro: '2024-03-20',
  },
  {
    id: 'c4',
    nombre: 'José Ramírez',
    email: 'jose.ramirez@mail.com',
    telefono: '3122223333',
    documento: '2223334444',
    estado: 'activo',
    totalCompras: 6,
    fechaRegistro: '2023-12-05',
  },
  {
    id: 'c5',
    nombre: 'Valentina Ruiz',
    email: 'valentina.ruiz@mail.com',
    telefono: '3154445566',
    documento: '4445556666',
    estado: 'activo',
    totalCompras: 3,
    fechaRegistro: '2024-01-25',
  },
];

const mockProveedores: Proveedor[] = [
  {
    id: 'p1',
    nombre: 'Cosmetix S.A.',
    nit: '900123456-1',
    email: 'contacto@cosmetix.co',
    telefono: '6041234567',
    direccion: 'Calle 50 #45-30, Medellín',
    estado: 'activo',
    fechaRegistro: '2023-01-10',
  },
  {
    id: 'p2',
    nombre: 'Belleza Proveedores',
    nit: '900987654-2',
    email: 'ventas@belleza.com',
    telefono: '6049876543',
    direccion: 'Carrera 70 #33-10, Medellín',
    estado: 'activo',
    fechaRegistro: '2023-02-15',
  },
  {
    id: 'p3',
    nombre: 'BulkCosmetics',
    nit: '901333222-3',
    email: 'orders@bulkcos.com',
    telefono: '6045556677',
    direccion: 'Avenida 80 #50-20, Bogotá',
    estado: 'activo',
    fechaRegistro: '2023-03-20',
  },
  {
    id: 'p4',
    nombre: 'Proveedores Global',
    nit: '902222111-4',
    email: 'admin@globalprov.com',
    telefono: '6042223344',
    direccion: 'Calle 10 #20-30, Cali',
    estado: 'inactivo',
    fechaRegistro: '2022-12-05',
  },
  {
    id: 'p5',
    nombre: 'Distribuciones X',
    nit: '903555444-5',
    email: 'contacto@distx.com',
    telefono: '6047778899',
    direccion: 'Carrera 43A #14-20, Medellín',
    estado: 'activo',
    fechaRegistro: '2023-05-10',
  },
];

const mockCategorias: Categoria[] = [
  { id: 'cat1', nombre: 'Maquillaje', descripcion: 'Productos de maquillaje', estado: 'activo' },
  { id: 'cat2', nombre: 'Cuidado de la Piel', descripcion: 'Productos para el cuidado facial y corporal', estado: 'activo' },
  { id: 'cat3', nombre: 'Fragancias', descripcion: 'Perfumes y colonias', estado: 'activo' },
  { id: 'cat4', nombre: 'Cabello', descripcion: 'Productos para el cuidado del cabello', estado: 'activo' },
  { id: 'cat5', nombre: 'Accesorios', descripcion: 'Brochas, esponjas y otros accesorios', estado: 'activo' },
];

const mockProductos: Producto[] = [
  {
    id: 'prod1',
    sku: 'GLM-001',
    nombre: 'Labial Mate Rosa',
    descripcion: 'Labial de larga duración color rosa intenso',
    categoriaId: 'cat1',
    marca: 'Maybelline',
    precioCompra: 15000,
    precioVenta: 35000,
    stock: 45,
    stockMinimo: 10,
    stockMaximo: 100,
    estado: 'activo',
    fechaCreacion: '2024-01-10',
  },
  {
    id: 'prod2',
    sku: 'GLM-002',
    nombre: 'Base Líquida Natural',
    descripcion: 'Base de maquillaje tono natural',
    categoriaId: 'cat1',
    marca: "L'Oréal",
    precioCompra: 25000,
    precioVenta: 55000,
    stock: 30,
    stockMinimo: 8,
    stockMaximo: 80,
    estado: 'activo',
    fechaCreacion: '2024-01-15',
  },
  {
    id: 'prod3',
    sku: 'GLM-003',
    nombre: 'Sérum Vitamina C',
    descripcion: 'Sérum facial antioxidante',
    categoriaId: 'cat2',
    marca: 'Natura',
    precioCompra: 35000,
    precioVenta: 75000,
    stock: 8,
    stockMinimo: 5,
    stockMaximo: 50,
    estado: 'activo',
    fechaCreacion: '2024-02-01',
  },
  {
    id: 'prod4',
    sku: 'GLM-004',
    nombre: 'Perfume Floral',
    descripcion: 'Fragancia floral 50ml',
    categoriaId: 'cat3',
    marca: 'Avon',
    precioCompra: 45000,
    precioVenta: 95000,
    stock: 20,
    stockMinimo: 5,
    stockMaximo: 60,
    estado: 'activo',
    fechaCreacion: '2024-02-10',
  },
  {
    id: 'prod5',
    sku: 'GLM-005',
    nombre: 'Shampoo Hidratante',
    descripcion: 'Shampoo para cabello seco 400ml',
    categoriaId: 'cat4',
    marca: 'Vogue',
    precioCompra: 18000,
    precioVenta: 42000,
    stock: 50,
    stockMinimo: 15,
    stockMaximo: 120,
    estado: 'activo',
    fechaCreacion: '2024-01-20',
  },
];

const mockCompras: Compra[] = [
  {
    id: 'comp1',
    proveedorId: 'p1',
    fecha: '2024-09-15',
    productos: [
      { productoId: 'prod1', cantidad: 50, precioUnitario: 15000 },
      { productoId: 'prod2', cantidad: 30, precioUnitario: 25000 },
    ],
    total: 1500000,
    estado: 'confirmada',
    confirmada: true,
  },
  {
    id: 'comp2',
    proveedorId: 'p2',
    fecha: '2024-09-20',
    productos: [
      { productoId: 'prod3', cantidad: 20, precioUnitario: 35000 },
    ],
    total: 700000,
    estado: 'confirmada',
    confirmada: true,
  },
  {
    id: 'comp3',
    proveedorId: 'p3',
    fecha: '2024-10-01',
    productos: [
      { productoId: 'prod4', cantidad: 25, precioUnitario: 45000 },
    ],
    total: 1125000,
    estado: 'pendiente',
    confirmada: false,
  },
  {
    id: 'comp4',
    proveedorId: 'p5',
    fecha: '2024-10-05',
    productos: [
      { productoId: 'prod5', cantidad: 60, precioUnitario: 18000 },
    ],
    total: 1080000,
    estado: 'confirmada',
    confirmada: true,
  },
  {
    id: 'comp5',
    proveedorId: 'p1',
    fecha: '2024-10-08',
    productos: [
      { productoId: 'prod1', cantidad: 40, precioUnitario: 15000 },
      { productoId: 'prod3', cantidad: 15, precioUnitario: 35000 },
    ],
    total: 1125000,
    estado: 'pendiente',
    confirmada: false,
  },
];

const mockVentas: Venta[] = [
  {
    id: 'v1',
    clienteId: 'c1',
    pedidoId: 'ped1', // Venta que proviene del pedido ped1
    fecha: '2024-10-01',
    productos: [
      { productoId: 'prod1', cantidad: 1, precioUnitario: 35000 },
    ],
    subtotal: 35000,
    iva: 6650,
    costoEnvio: 10000,
    total: 51650,
    estado: 'activo',
    metodoPago: 'Transferencia',
  },
  {
    id: 'v2',
    clienteId: 'c2',
    // pedidoId no definido - Venta directa
    fecha: '2024-09-28',
    productos: [
      { productoId: 'prod2', cantidad: 1, precioUnitario: 55000 },
    ],
    subtotal: 55000,
    iva: 10450,
    costoEnvio: 10000,
    total: 75450,
    estado: 'activo',
    metodoPago: 'Efectivo',
  },
  {
    id: 'v3',
    clienteId: 'c4',
    pedidoId: 'ped3', // Venta que proviene del pedido ped3
    fecha: '2024-10-07',
    productos: [
      { productoId: 'prod2', cantidad: 2, precioUnitario: 55000 },
    ],
    subtotal: 110000,
    iva: 20900,
    costoEnvio: 10000,
    total: 140900,
    estado: 'activo',
    metodoPago: 'Transferencia',
  },
  {
    id: 'v4',
    clienteId: 'c5',
    // pedidoId no definido - Venta directa
    fecha: '2024-10-05',
    productos: [
      { productoId: 'prod1', cantidad: 3, precioUnitario: 35000 },
    ],
    subtotal: 105000,
    iva: 19950,
    costoEnvio: 10000,
    total: 134950,
    estado: 'activo',
    metodoPago: 'Efectivo',
  },
  {
    id: 'v5',
    clienteId: 'c1',
    // pedidoId no definido - Venta directa
    fecha: '2024-10-08',
    productos: [
      { productoId: 'prod2', cantidad: 1, precioUnitario: 55000 },
      { productoId: 'prod3', cantidad: 1, precioUnitario: 75000 },
    ],
    subtotal: 130000,
    iva: 24700,
    costoEnvio: 10000,
    total: 164700,
    estado: 'anulada',
    metodoPago: 'Efectivo',
    motivoAnulacion: 'Cliente solicitó cancelación por cambio de producto',
  },
];

const mockPedidos: Pedido[] = [
  {
    id: 'ped1',
    clienteId: 'c1',
    fecha: '2024-10-01',
    productos: [
      { productoId: 'prod1', cantidad: 1, precioUnitario: 35000 },
    ],
    subtotal: 35000,
    iva: 6650,
    costoEnvio: 12000,
    total: 53650,
    estado: 'entregado',
    direccionEnvio: 'Calle 50 #30-20, Medellín',
  },
  {
    id: 'ped2',
    clienteId: 'c2',
    fecha: '2024-10-05',
    productos: [
      { productoId: 'prod3', cantidad: 1, precioUnitario: 75000 },
    ],
    subtotal: 75000,
    iva: 14250,
    costoEnvio: 12000,
    total: 101250,
    estado: 'preparado',
    direccionEnvio: 'Carrera 70 #45-10, Medellín',
  },
  {
    id: 'ped3',
    clienteId: 'c4',
    fecha: '2024-10-07',
    productos: [
      { productoId: 'prod2', cantidad: 2, precioUnitario: 55000 },
    ],
    subtotal: 110000,
    iva: 20900,
    costoEnvio: 12000,
    total: 142900,
    estado: 'preparado',
    direccionEnvio: 'Avenida 80 #20-30, Envigado',
  },
  {
    id: 'ped4',
    clienteId: 'c5',
    fecha: '2024-10-09',
    productos: [
      { productoId: 'prod4', cantidad: 1, precioUnitario: 95000 },
    ],
    subtotal: 95000,
    iva: 18050,
    costoEnvio: 12000,
    total: 125050,
    estado: 'pendiente',
    direccionEnvio: 'Calle 10 Sur #25-15, Sabaneta',
  },
  {
    id: 'ped5',
    clienteId: 'c3',
    fecha: '2024-09-20',
    productos: [
      { productoId: 'prod5', cantidad: 1, precioUnitario: 42000 },
    ],
    subtotal: 42000,
    iva: 7980,
    costoEnvio: 12000,
    total: 61980,
    estado: 'cancelado',
    direccionEnvio: 'Carrera 43A #12-50, Bello',
    motivoAnulacion: 'Cliente solicitó cancelación',
  },
];

const mockDevoluciones: Devolucion[] = [
  {
    id: 'dev1',
    ventaId: 'v1',
    clienteId: 'c1',
    fecha: '2024-10-05',
    motivo: 'Producto defectuoso',
    productos: [{ productoId: 'prod1', cantidad: 1 }],
    estado: 'aprobada',
    evidencias: [],
    totalDevuelto: 35000,
  },
  {
    id: 'dev2',
    ventaId: 'v2',
    clienteId: 'c2',
    fecha: '2024-10-02',
    motivo: 'No cumplió expectativas',
    productos: [{ productoId: 'prod2', cantidad: 1 }],
    estado: 'pendiente',
    evidencias: [],
    totalDevuelto: 55000,
  },
  {
    id: 'dev3',
    ventaId: 'v3',
    clienteId: 'c4',
    fecha: '2024-10-08',
    motivo: 'Color incorrecto',
    productos: [{ productoId: 'prod4', cantidad: 1 }],
    estado: 'aprobada',
    evidencias: [],
    totalDevuelto: 95000,
  },
  {
    id: 'dev4',
    ventaId: 'v4',
    clienteId: 'c5',
    fecha: '2024-10-09',
    motivo: 'Alergia al producto',
    productos: [{ productoId: 'prod1', cantidad: 1 }],
    estado: 'pendiente',
    evidencias: [],
    totalDevuelto: 35000,
  },
  {
    id: 'dev5',
    ventaId: 'v5',
    clienteId: 'c1',
    fecha: '2024-10-10',
    motivo: 'Empaque dañado',
    productos: [{ productoId: 'prod3', cantidad: 1 }],
    estado: 'rechazada',
    evidencias: [],
    totalDevuelto: 0,
  },
];

const mockRoles: Rol[] = [
  {
    id: 'r1',
    nombre: 'Administrador',
    descripcion: 'Tiene acceso completo a todas las funciones del sistema',
    estado: 'activo',
    permisos: {
      usuarios: { ver: true, crear: true, editar: true, eliminar: true },
      productos: { ver: true, crear: true, editar: true, eliminar: true },
      ventas: { ver: true, crear: true, editar: true, eliminar: true },
      compras: { ver: true, crear: true, editar: true, eliminar: true },
      pedidos: { ver: true, crear: true, editar: true, eliminar: true },
      clientes: { ver: true, crear: true, editar: true, eliminar: true },
      proveedores: { ver: true, crear: true, editar: true, eliminar: true },
      devoluciones: { ver: true, crear: true, editar: true, eliminar: true },
      configuracion: { ver: true, crear: true, editar: true, eliminar: true },
    },
  },
  {
    id: 'r2',
    nombre: 'Vendedor',
    descripcion: 'Puede realizar ventas y gestionar pedidos',
    estado: 'activo',
    permisos: {
      usuarios: { ver: false, crear: false, editar: false, eliminar: false },
      productos: { ver: true, crear: false, editar: false, eliminar: false },
      ventas: { ver: true, crear: true, editar: true, eliminar: false },
      compras: { ver: false, crear: false, editar: false, eliminar: false },
      pedidos: { ver: true, crear: true, editar: true, eliminar: false },
      clientes: { ver: true, crear: true, editar: true, eliminar: false },
      proveedores: { ver: false, crear: false, editar: false, eliminar: false },
      devoluciones: { ver: true, crear: true, editar: false, eliminar: false },
      configuracion: { ver: false, crear: false, editar: false, eliminar: false },
    },
  },
  {
    id: 'r3',
    nombre: 'Cliente',
    descripcion: 'Usuario del sistema de comercio electrónico',
    estado: 'activo',
    permisos: {
      usuarios: { ver: false, crear: false, editar: false, eliminar: false },
      productos: { ver: true, crear: false, editar: false, eliminar: false },
      ventas: { ver: false, crear: false, editar: false, eliminar: false },
      compras: { ver: false, crear: false, editar: false, eliminar: false },
      pedidos: { ver: true, crear: true, editar: false, eliminar: false },
      clientes: { ver: false, crear: false, editar: false, eliminar: false },
      proveedores: { ver: false, crear: false, editar: false, eliminar: false },
      devoluciones: { ver: true, crear: true, editar: false, eliminar: false },
      configuracion: { ver: false, crear: false, editar: false, eliminar: false },
    },
  },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [ventas, setVentas] = useState<Venta[]>(mockVentas);
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidos);
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>(mockDevoluciones);
  const [roles, setRoles] = useState<Rol[]>(mockRoles);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'admin' | 'cliente'>('cliente');
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [carrito, setCarrito] = useState<{ productoId: string; cantidad: number }[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  const value: StoreState & StoreActions = useMemo(() => ({
    users,
    clientes,
    proveedores,
    categorias,
    productos,
    compras,
    ventas,
    pedidos,
    devoluciones,
    roles,
    currentUser,
    userType,
    favoritos,
    carrito,

    addUser: (user) => {
      const newUser = { ...user, id: generateId(), fechaCreacion: getCurrentDate() };
      setUsers(prev => [...prev, newUser]);
    },
    updateUser: (id, userData) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
    },
    deleteUser: (id) => {
      setUsers(prev => prev.filter(u => u.id !== id));
    },

    addCliente: (cliente) => {
      const newCliente = { ...cliente, id: generateId(), fechaRegistro: getCurrentDate(), totalCompras: 0 };
      setClientes(prev => [...prev, newCliente]);
    },
    updateCliente: (id, clienteData) => {
      setClientes(prev => prev.map(c => c.id === id ? { ...c, ...clienteData } : c));
    },
    deleteCliente: (id) => {
      setClientes(prev => prev.filter(c => c.id !== id));
    },

    addProveedor: (proveedor) => {
      const newProveedor = { ...proveedor, id: generateId(), fechaRegistro: getCurrentDate() };
      setProveedores(prev => [...prev, newProveedor]);
    },
    updateProveedor: (id, proveedorData) => {
      setProveedores(prev => prev.map(p => p.id === id ? { ...p, ...proveedorData } : p));
    },
    deleteProveedor: (id) => {
      setProveedores(prev => prev.filter(p => p.id !== id));
    },

    addCategoria: (categoria) => {
      const newCategoria = { ...categoria, id: generateId() };
      setCategorias(prev => [...prev, newCategoria]);
    },
    updateCategoria: (id, categoriaData) => {
      setCategorias(prev => prev.map(c => c.id === id ? { ...c, ...categoriaData } : c));
    },
    deleteCategoria: (id) => {
      setCategorias(prev => prev.filter(c => c.id !== id));
    },

    addProducto: (producto) => {
      const newProducto = { ...producto, id: generateId(), fechaCreacion: getCurrentDate() };
      setProductos(prev => [...prev, newProducto]);
    },
    updateProducto: (id, productoData) => {
      setProductos(prev => prev.map(p => p.id === id ? { ...p, ...productoData } : p));
    },
    deleteProducto: (id) => {
      setProductos(prev => prev.filter(p => p.id !== id));
    },
    updateStock: (productoId, cantidad) => {
      setProductos(prev => prev.map(p => 
        p.id === productoId ? { ...p, stock: p.stock + cantidad } : p
      ));
    },

    addCompra: (compra) => {
      const newCompra = { ...compra, id: generateId() };
      setCompras(prev => [...prev, newCompra]);
    },
    updateCompra: (id, compraData) => {
      setCompras(prev => prev.map(c => c.id === id ? { ...c, ...compraData } : c));
    },
    confirmarCompra: (id) => {
      setCompras(prevCompras => {
        const compra = prevCompras.find(c => c.id === id);
        if (compra && !compra.confirmada) {
          compra.productos.forEach(p => {
             // We can't easily call value.updateStock here without causing issues or using refs
             // But for now let's just update the stock directly in the productos state if needed
             // or handle it in a more robust way.
          });
          return prevCompras.map(c => 
            c.id === id ? { ...c, confirmada: true, estado: 'confirmada' as const } : c
          );
        }
        return prevCompras;
      });
    },

    addVenta: (venta) => {
      const newVenta = { ...venta, id: generateId() };
      setVentas(prev => [...prev, newVenta]);
      setClientes(prev => prev.map(c => 
        c.id === venta.clienteId ? { ...c, totalCompras: c.totalCompras + 1 } : c
      ));
    },
    updateVenta: (id, ventaData) => {
      setVentas(prev => prev.map(v => v.id === id ? { ...v, ...ventaData } : v));
    },
    anularVenta: (id, motivo) => {
      setVentas(prevVentas => {
        const venta = prevVentas.find(v => v.id === id);
        if (venta && venta.estado === 'activo') {
          return prevVentas.map(v => 
            v.id === id ? { ...v, estado: 'anulada' as const, motivoAnulacion: motivo } : v
          );
        }
        return prevVentas;
      });
    },

    addPedido: (pedido) => {
      const newPedido = { ...pedido, id: generateId() };
      setPedidos(prev => [...prev, newPedido]);
    },
    updatePedido: (id, pedidoData) => {
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, ...pedidoData } : p));
    },
    updatePedidoEstado: (id, estado, motivo) => {
      setPedidos(prev => prev.map(p => 
        p.id === id ? { ...p, estado, motivoAnulacion: motivo } : p
      ));
    },

    addDevolucion: (devolucion) => {
      const newDevolucion = { ...devolucion, id: generateId() };
      setDevoluciones(prev => [...prev, newDevolucion]);
    },
    updateDevolucion: (id, devolucionData) => {
      setDevoluciones(prev => prev.map(d => d.id === id ? { ...d, ...devolucionData } : d));
    },

    addRol: (rol) => {
      const newRol = { ...rol, id: generateId() };
      setRoles(prev => [...prev, newRol]);
    },
    updateRol: (id, rolData) => {
      setRoles(prev => prev.map(r => r.id === id ? { ...r, ...rolData } : r));
    },
    deleteRol: (id) => {
      setRoles(prev => prev.filter(r => r.id !== id));
    },

    setCurrentUser: (user: User | null) => {
      setCurrentUser(user);
      if (user) {
        if (user.rol === 'cliente') {
          setUserType('cliente');
        } else {
          setUserType('admin');
        }
      }
    },
    setUserType,
    
    toggleFavorito: (productoId) => {
      setFavoritos(prev => prev.includes(productoId) 
        ? prev.filter(id => id !== productoId)
        : [...prev, productoId]
      );
    },
    
    addToCarrito: (productoId, cantidad) => {
      setCarrito(prev => {
        const existingItem = prev.find(item => item.productoId === productoId);
        if (existingItem) {
          return prev.map(item => 
            item.productoId === productoId 
              ? { ...item, cantidad: item.cantidad + cantidad }
              : item
          );
        }
        return [...prev, { productoId, cantidad }];
      });
    },
    
    removeFromCarrito: (productoId) => {
      setCarrito(prev => prev.filter(item => item.productoId !== productoId));
    },
    
    updateCarritoQuantity: (productoId, cantidad) => {
      setCarrito(prev => {
        if (cantidad <= 0) {
          return prev.filter(item => item.productoId !== productoId);
        }
        return prev.map(item =>
          item.productoId === productoId ? { ...item, cantidad } : item
        );
      });
    },
    
    clearCarrito: () => {
      setCarrito([]);
    },
    setProductos: (newProductos: Producto[]) => setProductos(newProductos),
    setCategorias: (newCategorias: Categoria[]) => setCategorias(newCategorias),
    setProveedores: (newProveedores: Proveedor[]) => setProveedores(newProveedores),
    setCompras: (newCompras: Compra[]) => setCompras(newCompras),
    setUsers: (newUsers: User[]) => setUsers(newUsers),
    setClientes: (newClientes: Cliente[]) => setClientes(newClientes),
  }), [
    users, clientes, proveedores, categorias, productos, compras, 
    ventas, pedidos, devoluciones, roles, currentUser, userType, 
    favoritos, carrito
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}