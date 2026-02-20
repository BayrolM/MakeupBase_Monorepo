# 🚀 GUÍA DE IMPLEMENTACIÓN - CONECTAR FRONTEND Y BACKEND

Esta guía proporciona código específico y paso a paso para conectar el frontend con el backend.

---

## 📋 PREREQUISITOS

### 1. Instalar Dependencias Faltantes

#### Frontend

```bash
cd frontend
npm install axios @tanstack/react-query
```

#### Backend

```bash
cd backend
npm install
```

### 2. Crear Archivo .env en Backend

```bash
# backend/.env
DATABASE_URL=postgresql://usuario:password@host:puerto/database
PORT=3000
JWT_SECRET=tu_secreto_jwt_super_seguro_cambiar_en_produccion
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Crear Archivo .env en Frontend

```bash
# frontend/.env
VITE_API_URL=http://localhost:3000/api
```

---

## 🔧 PASO 1: CONFIGURAR CLIENTE HTTP

### Crear `frontend/src/lib/api.ts`

```typescript
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      toast.error("Sesión expirada", {
        description: "Por favor, inicia sesión nuevamente",
      });
      // Redirigir a login
      window.location.href = "/";
    }

    // Manejar errores de autorización
    if (error.response?.status === 403) {
      toast.error("Acceso denegado", {
        description: "No tienes permisos para realizar esta acción",
      });
    }

    // Manejar errores del servidor
    if (error.response?.status === 500) {
      toast.error("Error del servidor", {
        description: "Ocurrió un error inesperado. Intenta nuevamente.",
      });
    }

    return Promise.reject(error);
  },
);

export default api;
```

---

## 🔐 PASO 2: CREAR SERVICIO DE AUTENTICACIÓN

### Crear `frontend/src/services/authService.ts`

```typescript
import api from "../lib/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  password: string;
  tipo_documento?: string;
  documento?: string;
  direccion?: string;
  ciudad?: string;
  id_rol?: number;
}

export interface UserProfile {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  id_rol: number;
}

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await api.post("/auth/login", credentials);
      const { token } = response.data;

      if (token) {
        localStorage.setItem("authToken", token);
        return token;
      }

      throw new Error("No se recibió token del servidor");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al iniciar sesión";
      throw new Error(message);
    }
  },

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterData): Promise<any> {
    try {
      const response = await api.post("/auth/register", {
        ...userData,
        id_rol: userData.id_rol || 2, // 2 = cliente por defecto
      });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al registrar usuario";
      throw new Error(message);
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al obtener perfil";
      throw new Error(message);
    }
  },

  /**
   * Actualizar perfil
   */
  async updateProfile(data: Partial<UserProfile>): Promise<void> {
    try {
      await api.put("/users/profile", data);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al actualizar perfil";
      throw new Error(message);
    }
  },

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem("authToken");
  },

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  },
};
```

---

## 🛍️ PASO 3: CREAR SERVICIO DE PRODUCTOS

### Crear `frontend/src/services/productService.ts`

```typescript
import api from "../lib/api";

export interface Product {
  id_producto: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  id_marca: number;
  id_categoria: number;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  imagen_url?: string;
  estado: boolean;
}

export interface ProductFilters {
  q?: string;
  marca?: string;
  categoria?: string;
  minPrice?: number;
  maxPrice?: number;
  estado?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  ok: boolean;
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export const productService = {
  /**
   * Listar productos con filtros
   */
  async getAll(filters?: ProductFilters): Promise<ProductsResponse> {
    try {
      const response = await api.get("/products", { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener productos",
      );
    }
  },

  /**
   * Obtener producto por ID
   */
  async getById(id: number): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener producto",
      );
    }
  },

  /**
   * Crear nuevo producto
   */
  async create(product: Omit<Product, "id_producto">): Promise<Product> {
    try {
      const response = await api.post("/products", product);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al crear producto",
      );
    }
  },

  /**
   * Actualizar producto
   */
  async update(id: number, product: Partial<Product>): Promise<void> {
    try {
      await api.put(`/products/${id}`, product);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar producto",
      );
    }
  },

  /**
   * Eliminar producto (soft delete)
   */
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar producto",
      );
    }
  },

  /**
   * Obtener productos destacados
   */
  async getFeatured(limit: number = 10): Promise<Product[]> {
    try {
      const response = await api.get("/products/featured", {
        params: { limit },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al obtener productos destacados",
      );
    }
  },
};
```

---

## 🛒 PASO 4: CREAR SERVICIO DE CARRITO

### Crear `frontend/src/services/cartService.ts`

```typescript
import api from "../lib/api";

export interface CartItem {
  id_detalle_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  nombre?: string;
  sku?: string;
}

export interface Cart {
  id_pedido: number;
  items: CartItem[];
  total: number;
}

export const cartService = {
  /**
   * Obtener carrito actual
   */
  async getCart(): Promise<Cart> {
    try {
      const response = await api.get("/cart");
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener carrito",
      );
    }
  },

  /**
   * Agregar item al carrito
   */
  async addItem(id_producto: number, cantidad: number): Promise<Cart> {
    try {
      const response = await api.post("/cart", { id_producto, cantidad });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al agregar al carrito",
      );
    }
  },

  /**
   * Actualizar cantidad de item
   */
  async updateItem(id: number, cantidad: number): Promise<Cart> {
    try {
      const response = await api.put(`/cart/${id}`, { cantidad });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar carrito",
      );
    }
  },

  /**
   * Eliminar item del carrito
   */
  async removeItem(id: number): Promise<Cart> {
    try {
      const response = await api.delete(`/cart/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar del carrito",
      );
    }
  },
};
```

---

## 📦 PASO 5: CREAR SERVICIO DE ÓRDENES

### Crear `frontend/src/services/orderService.ts`

```typescript
import api from "../lib/api";

export interface Order {
  id_pedido: number;
  id_usuario: number;
  fecha_pedido: string;
  direccion: string;
  ciudad: string;
  total: number;
  estado: string;
  id_venta?: number;
  metodo_pago?: string;
  nombre_usuario?: string;
  email_usuario?: string;
  items?: any[];
}

export interface CreateOrderData {
  direccion: string;
  ciudad: string;
  metodo_pago: string;
  items: Array<{
    id_producto: number;
    cantidad: number;
  }>;
}

export const orderService = {
  /**
   * Crear nueva orden
   */
  async create(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await api.post("/orders", orderData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al crear orden");
    }
  },

  /**
   * Obtener todas las órdenes
   */
  async getAll(estado?: string): Promise<Order[]> {
    try {
      const response = await api.get("/orders", { params: { estado } });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener órdenes",
      );
    }
  },

  /**
   * Obtener detalle de orden
   */
  async getById(id: number): Promise<Order> {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener orden",
      );
    }
  },
};
```

---

## 🔄 PASO 6: ACTUALIZAR App.tsx

### Modificar `frontend/src/App.tsx`

```typescript
import { useState, useEffect } from "react";
import { authService } from "./services/authService";
import { toast } from "sonner";
// ... otros imports

function AppContent() {
  const { userType, setCurrentUser } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [currentRoute, setCurrentRoute] = useState<Route>(
    userType === "admin" ? "dashboard" : "inicio"
  );

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();

          // Transformar perfil del backend al formato del frontend
          const user = {
            id: profile.id_usuario.toString(),
            nombre: profile.nombres,
            apellido: profile.apellidos,
            email: profile.email,
            telefono: profile.telefono,
            direccion: profile.direccion || '',
            ciudad: profile.ciudad || '',
            rol: profile.id_rol === 1 ? 'admin' as const : 'cliente' as const,
            estado: 'activo' as const,
            tipoDocumento: 'CC' as const,
            numeroDocumento: '',
            passwordHash: '',
            fechaCreacion: new Date().toISOString(),
          };

          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error al verificar autenticación:', error);
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Función de login actualizada
  const handleLogin = async (email: string, password: string) => {
    try {
      // Llamar al backend
      await authService.login({ email, password });

      // Obtener perfil del usuario
      const profile = await authService.getProfile();

      // Transformar al formato del frontend
      const user = {
        id: profile.id_usuario.toString(),
        nombre: profile.nombres,
        apellido: profile.apellidos,
        email: profile.email,
        telefono: profile.telefono,
        direccion: profile.direccion || '',
        ciudad: profile.ciudad || '',
        rol: profile.id_rol === 1 ? 'admin' as const : 'cliente' as const,
        estado: 'activo' as const,
        tipoDocumento: 'CC' as const,
        numeroDocumento: '',
        passwordHash: '',
        fechaCreacion: new Date().toISOString(),
      };

      setCurrentUser(user);
      setIsAuthenticated(true);

      // Establecer ruta inicial según rol
      if (user.rol === 'cliente') {
        setCurrentRoute('inicio');
      } else {
        setCurrentRoute('dashboard');
      }

      toast.success('¡Bienvenido!', {
        description: `Has iniciado sesión como ${user.nombre}`,
      });

      return true;
    } catch (error: any) {
      toast.error('Error al iniciar sesión', {
        description: error.message || 'Credenciales incorrectas',
      });
      return false;
    }
  };

  // Función de registro actualizada
  const handleRegister = async (data: {
    nombre: string;
    email: string;
    telefono: string;
    password: string;
    rol: UserRole;
  }) => {
    try {
      await authService.register({
        nombres: data.nombre,
        apellidos: '', // Agregar campo en el formulario
        email: data.email,
        telefono: data.telefono,
        password: data.password,
        id_rol: data.rol === 'admin' ? 1 : 2,
      });

      toast.success('¡Registro exitoso!', {
        description: 'Ahora puedes iniciar sesión',
      });

      // Redirigir a login
      setAuthPage('login');
    } catch (error: any) {
      toast.error('Error al registrar', {
        description: error.message,
      });
    }
  };

  // Función de logout actualizada
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthPage('login');
    setCurrentRoute('dashboard');

    toast.info('Sesión cerrada', {
      description: 'Has cerrado sesión correctamente',
    });
  };

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  // ... resto del código
}
```

---

## 🎨 PASO 7: ACTUALIZAR ProductsModule

### Modificar `frontend/src/components/modules/ProductsModule.tsx`

```typescript
import { useState, useEffect } from "react";
import { productService, Product } from "../../services/productService";
import { toast } from "sonner";

export function ProductsModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Cargar productos
  useEffect(() => {
    loadProducts();
  }, [page, searchQuery]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getAll({
        q: searchQuery,
        page,
        limit: 10,
      });

      setProducts(response.data);
      setTotal(response.total);
    } catch (error: any) {
      toast.error("Error al cargar productos", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (productData: Omit<Product, "id_producto">) => {
    try {
      await productService.create(productData);
      toast.success("Producto creado exitosamente");
      loadProducts(); // Recargar lista
    } catch (error: any) {
      toast.error("Error al crear producto", {
        description: error.message,
      });
    }
  };

  const handleUpdate = async (id: number, productData: Partial<Product>) => {
    try {
      await productService.update(id, productData);
      toast.success("Producto actualizado exitosamente");
      loadProducts(); // Recargar lista
    } catch (error: any) {
      toast.error("Error al actualizar producto", {
        description: error.message,
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productService.delete(id);
      toast.success("Producto eliminado exitosamente");
      loadProducts(); // Recargar lista
    } catch (error: any) {
      toast.error("Error al eliminar producto", {
        description: error.message,
      });
    }
  };

  // ... resto del componente con UI
}
```

---

## 🔧 PASO 8: CORREGIR ERRORES EN BACKEND

### 1. Agregar Protección a Rutas de Productos

```javascript
// backend/routes/productos.routes.js
import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  featured,
} from "../controllers/productos.controller.js";

const router = Router();

router.get("/", listar); // Público
router.get("/featured", featured); // Público
router.get("/:id", obtener); // Público
router.post("/", authRequired, crear); // ✅ Protegido
router.put("/:id", authRequired, actualizar); // ✅ Protegido
router.delete("/:id", authRequired, eliminar); // ✅ Protegido

export default router;
```

### 2. Configurar CORS Correctamente

```javascript
// backend/index.js
import cors from "cors";

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

### 3. Estandarizar Respuestas

```javascript
// backend/controllers/productos.controller.js
export const listar = async (req, res) => {
  try {
    const filters = {
      /* ... */
    };
    const result = await productosService.listarProductos(filters);

    // ✅ Formato estandarizado
    return res.json({
      ok: true,
      data: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (err) {
    console.error("❌ Error en listar:", err);

    // ✅ Formato estandarizado de error
    return res.status(500).json({
      ok: false,
      message: "Error al obtener productos",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
```

---

## 🧪 PASO 9: PROBAR LA INTEGRACIÓN

### 1. Iniciar Backend

```bash
cd backend
npm run dev
```

Deberías ver:

```
Servidor corriendo en el puerto 3000
```

### 2. Iniciar Frontend

```bash
cd frontend
npm run dev
```

Deberías ver:

```
Local: http://localhost:5173
```

### 3. Probar Login

1. Abrir `http://localhost:5173`
2. Intentar login con:
   - Email: `admin@glamour.com`
   - Password: (la que esté en tu BD)

3. Verificar en Network tab del navegador:
   - Request a `http://localhost:3000/api/auth/login`
   - Response con token JWT
   - Request a `http://localhost:3000/api/users/profile`

### 4. Probar Productos

1. Navegar a módulo de productos
2. Verificar que se cargan desde la API
3. Intentar crear un producto
4. Verificar en Network tab las peticiones

---

## 📊 PASO 10: USAR REACT QUERY (OPCIONAL PERO RECOMENDADO)

### Instalar React Query

```bash
cd frontend
npm install @tanstack/react-query
```

### Configurar en main.tsx

```typescript
// frontend/src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

### Crear Hook Personalizado

```typescript
// frontend/src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, ProductFilters } from "../services/productService";
import { toast } from "sonner";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getAll(filters),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto creado exitosamente");
    },
    onError: (error: any) => {
      toast.error("Error al crear producto", {
        description: error.message,
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto actualizado exitosamente");
    },
    onError: (error: any) => {
      toast.error("Error al actualizar producto", {
        description: error.message,
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto eliminado exitosamente");
    },
    onError: (error: any) => {
      toast.error("Error al eliminar producto", {
        description: error.message,
      });
    },
  });
}
```

### Usar en Componente

```typescript
// frontend/src/components/modules/ProductsModule.tsx
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts';

export function ProductsModule() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Usar React Query
  const { data, isLoading, error } = useProducts({
    q: searchQuery,
    page,
    limit: 10
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleCreate = (productData: any) => {
    createProduct.mutate(productData);
  };

  const handleUpdate = (id: number, productData: any) => {
    updateProduct.mutate({ id, data: productData });
  };

  const handleDelete = (id: number) => {
    deleteProduct.mutate(id);
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Renderizar productos */}
      {data?.data.map(product => (
        <div key={product.id_producto}>
          {product.nombre}
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend

- [ ] Crear archivo `.env` con variables de entorno
- [ ] Configurar CORS correctamente
- [ ] Agregar `authRequired` a rutas protegidas
- [ ] Estandarizar formato de respuestas
- [ ] Probar endpoints con Postman/Insomnia

### Frontend

- [ ] Instalar `axios` y `@tanstack/react-query`
- [ ] Crear `lib/api.ts`
- [ ] Crear `services/authService.ts`
- [ ] Crear `services/productService.ts`
- [ ] Crear `services/cartService.ts`
- [ ] Crear `services/orderService.ts`
- [ ] Actualizar `App.tsx` con login real
- [ ] Actualizar módulos para usar servicios
- [ ] Crear hooks personalizados con React Query
- [ ] Probar flujo completo de autenticación
- [ ] Probar CRUD de productos

### Testing

- [ ] Login exitoso
- [ ] Login con credenciales incorrectas
- [ ] Obtener perfil de usuario
- [ ] Listar productos
- [ ] Crear producto
- [ ] Actualizar producto
- [ ] Eliminar producto
- [ ] Agregar al carrito
- [ ] Crear orden
- [ ] Logout

---

## 🚀 PRÓXIMOS PASOS

Una vez completada esta guía, tendrás:

- ✅ Frontend conectado al backend
- ✅ Autenticación funcionando con JWT
- ✅ CRUD de productos funcionando
- ✅ Carrito de compras funcionando
- ✅ Sistema de órdenes funcionando

Después puedes continuar con:

1. Crear endpoints faltantes (categorías, proveedores, etc.)
2. Implementar subida de imágenes
3. Agregar validación con Zod
4. Implementar tests
5. Optimizar rendimiento
6. Preparar para producción

---

**¡Éxito con la implementación!** 🎉
