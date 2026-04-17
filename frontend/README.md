# 💝 GLAMOUR ML - Frontend

¡Bienvenido al repositorio del frontend de **GLAMOUR ML**! Esta es una aplicación moderna y elegante diseñada para la gestión integral de productos y compras en una tienda de maquillaje y cuidado personal (Makeup Base), ofreciendo tanto un panel de administración avanzado como una experiencia de cliente fluida y atractiva.

## 🚀 Características Principales

- **Diseño Premium y Responsivo:** Interfaz gráfica estilizada con colores y estilos "Luxury" orientada a cosméticos y belleza, asegurando una experiencia visual agradable en cualquier dispositivo.
- **Doble Interfaz (Admin / Cliente):**
  - **Panel de Administración:** Dashboards interactivos, gestión de usuarios, catálogo, inventario, ventas, devoluciones y reportes completos.
  - **Vista de Cliente:** Navegación por catálogo de productos de maquillaje, gestión de favoritos, carrito de compras y seguimiento de pedidos.
- **Componentes Modulares:** Arquitectura basada en módulos de React altamente reutilizables y limpios para mantener el código base ordenado.
- **Integración con Cloudinary:** Carga y gestión optimizada de imágenes de productos en la nube.
- **Experiencia de Usuario Interactiva:** Feedback de acciones del usuario mediante notificaciones integradas (Sonner), validación avanzada de formularios y modales enriquecidos.

## 🛠️ Tecnologías y Herramientas

Este proyecto está construido con un stack moderno y escalable:

- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/) + SWC para compilación ultrarrápida.
- **Estilos y UI:**
  - [Tailwind CSS](https://tailwindcss.com/) para diseño utilitario responsivo.
  - _Radix UI_ para componentes base accesibles y sin estilo.
  - _Lucide React_ para íconos ligeros y consistentes.
- **Gestión de Estado y Formularios:**
  - [Zustand](https://github.com/pmndrs/zustand) (Implementado vía custom hooks en `src/lib/store.ts`).
  - _React Hook Form_ para la validación y gestión de los formularios.
- **Peticiones HTTP:** _Axios_
- **Visualización de Datos:** _Recharts_ para los gráficos del dashboard administrativo.
- **Otros:** Integración con Cloudinary, generación de PDFs con `jspdf`.

## 📂 Estructura del Proyecto

```text
frontend/
├── public/                 # Archivos estáticos accesibles públicamente
└── src/
    ├── components/         # Componentes organizados y reutilizables de UI
    │   ├── auth/           # Componentes de registro y autenticación
    │   ├── client/         # Interfaces dedicadas a la vista del cliente
    │   ├── modules/        # Secciones completas del panel administrativo (Productos, Categorías, Usuarios, etc.)
    │   └── ui/             # Componentes base basados en Radix UI (Input, Dialog, Table, etc.)
    ├── hooks/              # Hooks personalizados de React (Ej: usePagination)
    ├── lib/                # Configuración de librerías y gestión del estado global (Zustand store)
    ├── services/           # Lógica de abstracción para el consumo de APIs backend con Axios
    ├── styles/             # Archivos CSS globales y variables compartidas (`globals.css`)
    ├── utils/              # Funciones auxiliares genéricas y validaciones
    ├── App.tsx             # Componente raíz y enrutador principal
    └── main.tsx            # Punto de entrada de la aplicación en React
```

## ⚙️ Requisitos Previos

Asegúrate de tener instalados:

- **Node.js** (versión 18.x o superior recomendada)
- **npm** (gestor de paquetes)

Para aprovechar al máximo las funcionalidades, asegúrate de tener configurado tu archivo de variables de entorno `.env` en la raíz de `frontend/` con las credenciales necesarias (Ej: Claves de API del Backend, Cloudinary, etc.).

## 🏃 Instalación y Ejecución

Sigue estos pasos para arrancar el entorno de desarrollo en tu máquina local:

1. **Instalar dependencias:**

   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

   El servidor generalmente se iniciará en `http://localhost:5173/`. La terminal te indicará la ruta exacta.

3. _(Opcional)_ **Compilar para producción:**
   ```bash
   npm run build
   ```
   Esto generará una carpeta `dist` con los archivos optimizados listos para su despliegue en servicios como Vercel, Netlify o un servidor estático.

## 🤝 Contribución

Si deseas contribuir, sigue las convenciones de código existentes en el proyecto.
Prioriza el uso de variables globales definidas en `src/styles/globals.css` (como colores, fondos y bordes) en lugar de valores hexadecimales aislados, para mantener la homogeneidad visual de la marca a largo plazo.

---

_Hecho para GLAMOUR ML - Plataforma innovadora de maquillaje y cuidado personal._
