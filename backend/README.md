# GlamourML API - Backend

API REST para el sistema de gestión de productos de belleza GlamourML.

## 🚀 Tecnologías

- **Node.js** + **Express.js** - Framework web
- **PostgreSQL** (Supabase) - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

## 📋 Características

- ✅ Autenticación con JWT
- ✅ Gestión de usuarios y perfiles
- ✅ CRUD completo de productos
- ✅ Sistema de carrito de compras
- ✅ Gestión de órdenes/pedidos
- ✅ Reportes y dashboard
- ✅ Filtros y búsqueda avanzada
- ✅ Paginación

## 🛠️ Instalación Local

1. Clonar el repositorio
```bash
git clone <tu-repo>
cd back02
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
Crear archivo `.env` con:
```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
JWT_SECRET=tu_secreto_super_seguro
```

4. Ejecutar el servidor
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación

- **API Documentation**: Ver `API_DOCUMENTATION.md`
- **Testing Guide**: Ver `POSTMAN_TESTING_GUIDE.md`

## 🌐 Deployment en Vercel

Ver `VERCEL_DEPLOYMENT_GUIDE.md` para instrucciones detalladas.

## 📁 Estructura del Proyecto

```
back02/
├── config/          # Configuración de BD
├── controllers/     # Controladores de rutas
├── middleware/      # Middlewares (auth, etc)
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── index.js         # Punto de entrada
└── package.json
```

## 🔐 Variables de Entorno Requeridas

- `DATABASE_URL` - URL de conexión a PostgreSQL
- `PORT` - Puerto del servidor (default: 3000)
- `JWT_SECRET` - Secreto para firmar tokens JWT

## 📝 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo con nodemon
- `npm start` - Ejecutar en modo producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC
