import sql from "../config/db.js";

export const listar = async (req, res) => {
  try {
    const result = await sql`SELECT * FROM proveedores ORDER BY id_proveedor ASC`;
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener proveedores." });
  }
};

export const obtener = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`SELECT * FROM proveedores WHERE id_proveedor = ${id}`;
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Proveedor no encontrado." });
    }
    return res.json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener el proveedor." });
  }
};

export const crear = async (req, res) => {
  try {
    const { nombre, email, telefono, documento_nit, tipo_proveedor, direccion } = req.body;
    if (!nombre || !email || !telefono || !documento_nit || !tipo_proveedor || !direccion) {
      return res.status(400).json({ ok: false, message: "Todos los campos son obligatorios." });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ ok: false, message: "Formato de correo inválido." });
    }

    const result = await sql`
      INSERT INTO proveedores (nombre, email, telefono, documento_nit, tipo_proveedor, direccion, estado)
      VALUES (${nombre}, ${email}, ${telefono}, ${documento_nit}, ${tipo_proveedor}, ${direccion}, true)
      RETURNING *
    `;
    return res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al crear el proveedor." });
  }
};

export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, documento_nit, tipo_proveedor, direccion, estado } = req.body;
    
    if (!nombre || !email || !telefono || !documento_nit || !tipo_proveedor || !direccion) {
      return res.status(400).json({ ok: false, message: "Todos los campos son obligatorios." });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ ok: false, message: "Formato de correo inválido." });
    }

    const result = await sql`
      UPDATE proveedores
      SET 
        nombre = ${nombre},
        email = ${email},
        telefono = ${telefono},
        documento_nit = ${documento_nit},
        tipo_proveedor = ${tipo_proveedor},
        direccion = ${direccion},
        estado = ${estado !== undefined ? estado : true}
      WHERE id_proveedor = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Proveedor no encontrado." });
    }
    
    return res.json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al actualizar el proveedor." });
  }
};

export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    // Hard delete as requested previously, or soft delete? The prompt mentions:
    // "Validar si tiene registros asociados (si aplica)" and "Proveedor eliminado correctamente"
    // In a previous task (470ea249), they asked "Permanently Deleting Supplier Records"
    // Let's implement hard delete with a check for associated orders if possible.
    // However, the database might throw a foreign key error if we just delete. Let's catch it.
    try {
      const result = await sql`DELETE FROM proveedores WHERE id_proveedor = ${id} RETURNING *`;
      if (result.length === 0) {
        return res.status(404).json({ ok: false, message: "Proveedor no encontrado." });
      }
      return res.json({ ok: true, message: "Proveedor eliminado correctamente." });
    } catch (dbError) {
      if (dbError.code === '23503') { // Foreign key constraint violation in PostgreSQL
        return res.status(400).json({ ok: false, message: "Error al eliminar: El proveedor tiene registros asociados." });
      }
      throw dbError;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al desactivar el proveedor." });
  }
};
