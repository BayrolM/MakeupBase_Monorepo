import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';

export type UserRole = 'admin' | 'vendedor' | 'cliente';
export type OrderStatus = 'pendiente' | 'preparado' | 'procesando' | 'enviado' | 'entregado' | 'cancelado' | 'carrito';
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
  nombres: string;
  apellidos: string;
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
  id_rol?: number; // Numeric ID of the role
  rolAsignadoId?: string; // ID del rol personalizado asignado
  estado: Status;
  fechaCreacion: string;
  foto_perfil?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  documento: string;
  numeroDocumento: string;
  estado: Status;
  totalCompras: number;
  fechaRegistro: string;
  tipoDocumento?: TipoDocumento;
  direccion?: string;
  ciudad?: string;
  pais?: string;
}

export interface Proveedor {
  id: string;
  tipo_proveedor: string;
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

export interface Marca {
  id: string;
  nombre: string;
  descripcion: string;
  estado: Status;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  marcaId?: string;
  marca: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  imagenUrl?: string;
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
  pago_confirmado: boolean;
  comprobante_url?: string;
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
  marcas: Marca[];
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
  setVentas: (ventas: Venta[]) => void;
  setPedidos: (pedidos: Pedido[]) => void;
  setDevoluciones: (devoluciones: Devolucion[]) => void;
  setMarcas: (marcas: Marca[]) => void;
}

const StoreContext = createContext<(StoreState & StoreActions) | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'admin' | 'cliente'>('cliente');
  const [favoritos, setFavoritos] = useState<string[]>(() => {
    const saved = localStorage.getItem('gml_favoritos');
    return saved ? JSON.parse(saved) : [];
  });
  const [carrito, setCarrito] = useState<{ productoId: string; cantidad: number }[]>(() => {
    const saved = localStorage.getItem('gml_carrito');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistir favoritos
  useEffect(() => {
    localStorage.setItem('gml_favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  // Persistir carrito
  useEffect(() => {
    localStorage.setItem('gml_carrito', JSON.stringify(carrito));
  }, [carrito]);

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  const value: StoreState & StoreActions = useMemo(() => ({
    users,
    clientes,
    proveedores,
    categorias,
    marcas,
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
          // La lógica de actualización de stock se maneja en el backend al cambiar el estado a 'entregado'
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
        if (user.rol === "cliente") {
          setUserType("cliente");
        } else {
          setUserType("admin");
        }
      } else {
        setUserType("cliente");
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
      const producto = productos.find(p => p.id === productoId);
      if (!producto) return;

      setCarrito(prev => {
        const existingItem = prev.find(item => item.productoId === productoId);
        if (existingItem) {
          const newQuantity = existingItem.cantidad + cantidad;
          if (newQuantity > producto.stock) {
            return prev.map(item => 
              item.productoId === productoId 
                ? { ...item, cantidad: producto.stock }
                : item
            );
          }
          return prev.map(item => 
            item.productoId === productoId 
              ? { ...item, cantidad: newQuantity }
              : item
          );
        }
        
        const initialQuantity = Math.min(cantidad, producto.stock);
        return [...prev, { productoId, cantidad: initialQuantity }];
      });
    },
    
    removeFromCarrito: (productoId) => {
      setCarrito(prev => prev.filter(item => item.productoId !== productoId));
    },
    
    updateCarritoQuantity: (productoId, cantidad) => {
      const producto = productos.find(p => p.id === productoId);
      if (!producto) return;

      setCarrito(prev => {
        if (cantidad <= 0) {
          return prev.filter(item => item.productoId !== productoId);
        }
        
        const validatedQuantity = Math.min(cantidad, producto.stock);
        return prev.map(item =>
          item.productoId === productoId ? { ...item, cantidad: validatedQuantity } : item
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
    setVentas: (newVentas: Venta[]) => setVentas(newVentas),
    setPedidos: (newPedidos: Pedido[]) => setPedidos(newPedidos),
    setDevoluciones: (newDevoluciones: Devolucion[]) => setDevoluciones(newDevoluciones),
    setMarcas: (newMarcas: Marca[]) => setMarcas(newMarcas),
  }), [
    users, clientes, proveedores, categorias, marcas, productos, compras,
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