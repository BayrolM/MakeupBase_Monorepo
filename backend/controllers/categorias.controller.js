import sql from "../config/db.js";

export const listar = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = q 
      ? sql`WHERE nombre ILIKE ${'%' + q + '%'} OR descripcion ILIKE ${'%' + q + '%'}`
      : sql``;

    const totalResult = await sql`SELECT COUNT(1) as total FROM categorias ${whereClause}`;
    const total = parseInt(totalResult[0].total, 10);

    const categorias = await sql`
      SELECT * FROM categorias 
      ${whereClause}
      ORDER BY id_categoria ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return res.json({
      ok: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      data: categorias
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener categorías." });
  }
};

export const obtener = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`SELECT * FROM categorias WHERE id_categoria = ${id}`;
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Categoría no encontrada." });
    }
    return res.json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener la categoría." });
  }
};

export const crear = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ ok: false, message: "El nombre es obligatorio." });
    }
    const result = await sql`
      INSERT INTO categorias (nombre, descripcion, estado)
      VALUES (${nombre}, ${descripcion || ""}, true)
      RETURNING *
    `;
    return res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al crear la categoría." });
  }
};

export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;
    
    // Construir objeto de actualización parcial
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (estado !== undefined) updateData.estado = estado;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ ok: false, message: "No hay campos para actualizar." });
    }

    const result = await sql`
      UPDATE categorias
      SET ${sql(updateData)}
      WHERE id_categoria = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Categoría no encontrada." });
    }
    
    return res.json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al actualizar la categoría." });
  }
};

export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Intentamos eliminar físicamente el registro
    const result = await sql`
      DELETE FROM categorias WHERE id_categoria = ${id} RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Categoría no encontrada." });
    }
    
    return res.json({ ok: true, message: "Categoría eliminada permanentemente." });
  } catch (error) {
    console.error(error);
    
    // Si el error es por restricción de llave foránea (productos asociados)
    if (error.code === '23503') {
      return res.status(400).json({ 
        ok: false, 
        message: "No se puede eliminar la categoría porque tiene productos asociados. Prueba a desactivarla mejor." 
      });
    }
    
    return res.status(500).json({ ok: false, message: "Error al eliminar la categoría de la base de datos." });
  }
};
