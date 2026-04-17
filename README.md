# 💝 GLAMOUR ML - Makeup Base System

¡Bienvenido al monorepositorio de **GLAMOUR ML**! Este es el código fuente completo (Frontend + Backend) para una plataforma integral de gestión y ventas orientada a tiendas de maquillaje y cuidado personal.

El proyecto permite gestionar un catálogo de productos, controlar el inventario, realizar ventas y ofrecer una experiencia de cliente fluida y elegante (con estética *Luxury*). 

## 🏗️ Arquitectura del Proyecto

El proyecto está diseñado como un **Monorepo** que contiene dos directorios principales:

### 1. `frontend/` (Cliente Web Múltiple)
Aplicación moderna construida con **React + Vite** y estilizada de forma premium con **Tailwind CSS**.
Ofrece dos roles principales de cara al usuario:
- **Panel de Administración:** Dashboards, gestión gráfica de inventario, ABM (Alta, Baja, Modificación) de productos y categorías, reportes de ventas y gestión de roles.
- **Vista de Cliente:** Catálogo para comprar productos, gestión de carrito, favoritos y visualización del historial de pedidos.

*Para más detalles sobre tecnologías, scripts e instalación, visita el [README del Frontend](./frontend/README.md).*

### 2. `backend/` (API REST)
Servidor robusto y escalable construido en **Node.js** con el framework **Express**.
Características principales:
- **Base de Datos:** Utiliza PostgreSQL (a través del paquete `postgres`).
- **Autenticación y Seguridad:** Encriptación de contraseñas con `bcryptjs` y protección de rutas mediante JSON Web Tokens (`jsonwebtoken`).
- **Gestión de Archivos:** Integración con `multer` para la subida de datos.

## 🚀 Requisitos Previos

Para ejecutar este proyecto en tu entorno local, asegúrate de tener:
- [Node.js](https://nodejs.org/) (v18.x o superior)
- [PostgreSQL](https://www.postgresql.org/) (con una base de datos configurada para el proyecto)
- **npm** (gestor de dependencias)

## 🛠️ Configuración y Ejecución Temprana

El proyecto requiere que arranques ambos entornos de forma independiente.

### Paso 1: Levantar el Backend
1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura tus variables de entorno (Crea un archivo `.env` tomando como base la configuración requerida para Postgres y JWT).
4. Inicia el servidor (Modo desarrollo):
   ```bash
   npm run dev
   ```
   *El servidor de Node.js empezará a escuchar las peticiones de red local.*

### Paso 2: Levantar el Frontend
1. Abre otra terminal y navega al frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el cliente de React (Modo desarrollo):
   ```bash
   npm run dev
   ```
4. Ingresa a la URL local (usualmente `http://localhost:5173/`) indicada en tu terminal.

## 🤝 Roadmap y Contribución

- **Consistencia Visual:** Cualquier cambio en el frontend debe respetar la gama de colores rosado suave y "Luxury Pink" guardada en `frontend/src/styles/globals.css`.
- **Integridad de API:** Los modelos de backend deben replicarse correctamente en los tipos de TypeScript empleados en el frontend dentro del gestor global (`src/lib/store.ts`).

---
*Diseñado y desarrollado con dedicación para dar la mejor experiencia visual corporativa.*
