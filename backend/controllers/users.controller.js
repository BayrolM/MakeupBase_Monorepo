import sql from '../config/db.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
  try {
    // Seleccionar explícitamente los campos para seguridad y claridad.
    const result = await sql`
      SELECT 
        id_usuario,
        nombre as nombres,
        apellido as apellidos,
        email,
        telefono,
        direccion,
        ciudad,
        id_rol 
      FROM usuarios 
      WHERE id_usuario = ${req.user.id_usuario}
        `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: 'Perfil de usuario no encontrado' });
    }

    const user = result[0];

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener el perfil' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { nombres, apellidos, telefono, direccion, ciudad } = req.body;

    await sql`
            UPDATE usuarios
            SET nombre = ${nombres},
                apellido = ${apellidos},
                telefono = ${telefono},
                direccion = ${direccion},
                ciudad = ${ciudad}
            WHERE id_usuario = ${req.user.id_usuario}
        `;

    return res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Listar todos los usuarios (Admin)
 */
export const listarUsuarios = async (req, res) => {
  try {
    const { q, id_rol, estado, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    // Filtro de búsqueda por nombre, apellido, email o documento
    if (q) {
      whereConditions.push(sql`(
                u.nombre ILIKE ${'%' + q + '%'} OR 
                u.apellido ILIKE ${'%' + q + '%'} OR 
                u.email ILIKE ${'%' + q + '%'} OR 
                u.documento ILIKE ${'%' + q + '%'}
            )`);
    }

    // Filtro por rol
    if (id_rol && id_rol !== 'all') {
      whereConditions.push(sql`u.id_rol = ${parseInt(id_rol)}`);
    }

    // Filtro por estado
    if (estado !== undefined && estado !== '') {
      const estadoBool = estado === 'true' || estado === '1' || estado === true;
      whereConditions.push(sql`u.estado = ${estadoBool}`);
    }

    // Construir WHERE
    const whereClause = whereConditions.length > 0 
      ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}` 
      : sql``;

    // Consulta principal
    const usuarios = await sql`
      SELECT 
        u.id_usuario,
        u.id_rol,
        r.nombre as nombre_rol,
        u.tipo_documento,
        u.documento,
        u.nombre as nombres,
        u.apellido as apellidos,
        u.email,
        u.telefono,
        u.direccion,
        u.ciudad,
        u.estado
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      ${whereClause}
      ORDER BY u.id_usuario DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${offset}
    `;

    // Contar total
    const totalResult = await sql`
      SELECT COUNT(*) as total 
      FROM usuarios u
      ${whereClause}
    `;
    const total = parseInt(totalResult[0].total);

    return res.json({
      ok: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      data: usuarios,
    });
  } catch (error) {
    console.error('Error en listarUsuarios:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener usuarios',
    });
  }
};



/**
 * Crear un nuevo usuario (Admin)
 */
export const crearUsuario = async (req, res) => {
  try {
    const {
      id_rol,
      tipo_documento,
      documento,
      nombres,
      apellidos,
      email,
      telefono,
      direccion,
      ciudad,
      password_hash,
      estado = true
    } = req.body;

    // Validar campos requeridos
    if (!email || !nombres || !apellidos || !id_rol) {
      return res.status(400).json({
        ok: false,
        message: 'Faltan campos obligatorios (email, nombres, apellidos, rol)'
      });
    }

    // Verificar si el email ya existe
    const emailExiste = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
    if (emailExiste.length > 0) {
      return res.status(400).json({
        ok: false,
        message: 'El email ya está registrado'
      });
    }

    // Verificar si el documento ya existe (si se proporciona)
    if (documento) {
      const docExiste = await sql`SELECT * FROM usuarios WHERE documento = ${documento}`;
      if (docExiste.length > 0) {
        return res.status(400).json({
          ok: false,
          message: 'El documento ya está registrado'
        });
      }
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordToHash = password_hash || documento || '123456';
    const hashedPassword = await bcrypt.hash(passwordToHash, salt);

    const nuevoUsuario = await sql`
      INSERT INTO usuarios (
        id_rol, tipo_documento, documento, nombre, apellido,
        email, telefono, direccion, ciudad, password_hash, estado
      )
      VALUES (
        ${id_rol}, ${tipo_documento || 'CC'}, ${documento || ''}, 
        ${nombres}, ${apellidos}, ${email}, ${telefono || ''}, 
        ${direccion || ''}, ${ciudad || ''}, ${hashedPassword}, 
        ${estado}
      )
      RETURNING id_usuario, email, nombre as nombres, apellido as apellidos
    `;

    return res.status(201).json({
      ok: true,
      message: 'Usuario creado exitosamente',
      data: nuevoUsuario[0]
    });
  } catch (error) {
    console.error('Error en crearUsuario:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al crear el usuario'
    });
  }
};

/**
 * Obtener detalle de un usuario específico (Admin)
 */
export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await sql`
            SELECT 
                u.id_usuario,
                u.id_rol,
                r.nombre as nombre_rol,
                r.descripcion as descripcion_rol,
                u.tipo_documento,
                u.documento,
                u.nombre as nombres,
                u.apellido as apellidos,
                u.email,
                u.telefono,
                u.direccion,
                u.ciudad,
                u.estado
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ${id}
        `;

    if (usuario.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    return res.json({
      ok: true,
      data: usuario[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener el usuario',
    });
  }
};

/**
 * Actualizar información de un usuario (Admin)
 */
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_rol, nombres, apellidos, telefono, direccion, ciudad, estado } =
      req.body;

    // Verificar que el usuario existe
    const usuarioExiste = await sql`
            SELECT * FROM usuarios WHERE id_usuario = ${id}
        `;

    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    // Actualizar usuario
    const usuarioActualizado = await sql`
            UPDATE usuarios
            SET 
                id_rol = ${
                  id_rol !== undefined ? id_rol : usuarioExiste[0].id_rol
                },
                nombres = ${nombres || usuarioExiste[0].nombres},
                apellidos = ${apellidos || usuarioExiste[0].apellidos},
                telefono = ${
                  telefono !== undefined ? telefono : usuarioExiste[0].telefono
                },
                direccion = ${
                  direccion !== undefined
                    ? direccion
                    : usuarioExiste[0].direccion
                },
                ciudad = ${
                  ciudad !== undefined ? ciudad : usuarioExiste[0].ciudad
                },
                estado = ${
                  estado !== undefined ? estado : usuarioExiste[0].estado
                }
            WHERE id_usuario = ${id}
            RETURNING *
        `;

    return res.json({
      ok: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar el usuario',
    });
  }
};

/**
 * Desactivar un usuario (Admin)
 */
export const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuarioExiste = await sql`
            SELECT * FROM usuarios WHERE id_usuario = ${id}
        `;

    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    // Desactivar usuario
    await sql`
            UPDATE usuarios
            SET estado = false
            WHERE id_usuario = ${id}
        `;

    return res.json({
      ok: true,
      message: 'Usuario desactivado exitosamente',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: 'Error al desactivar el usuario',
    });
  }
};
