import jwt from 'jsonwebtoken';

// Middleware para verificar autenticación y autorización.
// Ademas de verificar el token, extrae el id_usuario y el rol del token y los asigna a req.user
export const authRequired = (req, res, next) => {
  console.log('🔐 === Middleware authRequired ===');

  try {
    // Verificar que existe el header Authorization
    if (!req.headers.authorization) {
      console.log('❌ No hay header Authorization');
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Extraer el token del header Authorization
    const authHeader = req.headers.authorization;
    console.log(
      '📋 Authorization Header:',
      authHeader.substring(0, 50) + '...'
    );

    // Verificar formato Bearer TOKEN
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('❌ Formato de Authorization incorrecto');
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    // Extraer el token
    const token = parts[1];

    if (!token) {
      console.log('❌ Token vacío');
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('✅ Token decodificado exitosamente');
    console.log('👤 Usuario decodificado:', JSON.stringify(decoded, null, 2));
    console.log('🔑 id_usuario:', decoded.id_usuario);
    console.log('🔑 rol:', decoded.rol, '(tipo:', typeof decoded.rol, ')');

    // Asignar el id_usuario y el rol al objeto req.user
    req.user = decoded;

    // Continuar con la siguiente función
    next();
  } catch (error) {
    console.error('💥 Error en authRequired:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expirado' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Token no válido' });
    }

    return res.status(403).json({ message: 'Error de autenticación' });
  }
};
