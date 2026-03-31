import jwt from 'jsonwebtoken';

export const adminRequired = (req, res, next) => {
  console.log('👑 === Middleware adminRequired ===');
  
  try {
    // 1. Primero verificar autenticación básica
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const authHeader = req.headers.authorization;
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 2. Asignar usuario a req.user
    req.user = decoded;
    
    // 3. Verificar que sea admin 
    if (req.user.rol !== 1) {
      console.log('❌ Usuario no es admin. Rol:', req.user.rol);
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren permisos de administrador' 
      });
    }
    
    console.log('✅ Usuario es admin:', req.user.email);
    next();
    
  } catch (error) {
    console.error('❌ Error en adminRequired:', error.message);
    return res.status(401).json({ message: 'Token inválido' });
  }
};