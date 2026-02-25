import sql from "../config/db.js";

/**
 * Listar todos los roles con filtros opcionales
 */
export const listarRoles = async (req, res) => {
  try {
    const { q, estado } = req.query;

    let query = sql`SELECT * FROM roles WHERE 1=1`;

    // Filtro de búsqueda por nombre o descripción
    if (q) {
      query = sql`
        SELECT * FROM roles 
        WHERE (nombre ILIKE ${"%" + q + "%"} OR descripcion ILIKE ${
        "%" + q + "%"
      })
      `;
    }

    // Filtro por estado
    if (estado !== undefined) {
      const estadoBool = estado === "true" || estado === "1";
      if (q) {
        query = sql`
          SELECT * FROM roles 
          WHERE (nombre ILIKE ${"%" + q + "%"} OR descripcion ILIKE ${
          "%" + q + "%"
        })
            AND estado = ${estadoBool}
        `;
      } else {
        query = sql`SELECT * FROM roles WHERE estado = ${estadoBool}`;
      }
    }

    const roles = await query;

    return res.json({
      ok: true,
      total: roles.length,
      data: roles,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener roles",
    });
  }
};

/**
 * Obtener detalle de un rol específico
 */
export const obtenerRol = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await sql`
      SELECT * FROM roles WHERE id_rol = ${id}
    `;

    if (rol.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Rol no encontrado",
      });
    }

    // Obtener cantidad de usuarios con este rol
    const usuarios = await sql`
      SELECT COUNT(*) as total FROM usuarios WHERE id_rol = ${id}
    `;

    return res.json({
      ok: true,
      data: {
        ...rol[0],
        total_usuarios: parseInt(usuarios[0].total),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener el rol",
    });
  }
};

/**
 * Crear un nuevo rol
 */
export const crearRol = async (req, res) => {
  try {
    const { nombre, descripcion, estado = true } = req.body;

    if (!nombre) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del rol es requerido",
      });
    }

    // Verificar si ya existe un rol con ese nombre
    const existe = await sql`
      SELECT * FROM roles WHERE nombre ILIKE ${nombre}
    `;

    if (existe.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Ya existe un rol con ese nombre",
      });
    }

    const nuevoRol = await sql`
      INSERT INTO roles (nombre, descripcion, estado)
      VALUES (${nombre}, ${descripcion || null}, ${estado})
      RETURNING *
    `;

    return res.status(201).json({
      ok: true,
      message: "Rol creado exitosamente",
      data: nuevoRol[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al crear el rol",
    });
  }
};

/**
 * Actualizar un rol existente
 */
export const actualizarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;

    // Verificar que el rol existe
    const rolExiste = await sql`
      SELECT * FROM roles WHERE id_rol = ${id}
    `;

    if (rolExiste.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Rol no encontrado",
      });
    }

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (nombre && nombre !== rolExiste[0].nombre) {
      const nombreExiste = await sql`
        SELECT * FROM roles WHERE nombre ILIKE ${nombre} AND id_rol != ${id}
      `;

      if (nombreExiste.length > 0) {
        return res.status(400).json({
          ok: false,
          message: "Ya existe otro rol con ese nombre",
        });
      }
    }

    const rolActualizado = await sql`
      UPDATE roles
      SET 
        nombre = ${nombre || rolExiste[0].nombre},
        descripcion = ${
          descripcion !== undefined ? descripcion : rolExiste[0].descripcion
        },
        estado = ${estado !== undefined ? estado : rolExiste[0].estado}
      WHERE id_rol = ${id}
      RETURNING *
    `;

    return res.json({
      ok: true,
      message: "Rol actualizado exitosamente",
      data: rolActualizado[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar el rol",
    });
  }
};
