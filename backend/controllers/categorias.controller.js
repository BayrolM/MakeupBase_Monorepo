import sql from "../config/db.js";

export const listar = async (req, res) => {
  try {
    const result = await sql`SELECT * FROM categorias ORDER BY id_categoria ASC`;
    return res.json(result);
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
    
    const result = await sql`
      UPDATE categorias
      SET 
        nombre = ${nombre},
        descripcion = ${descripcion},
        estado = ${estado !== undefined ? estado : true}
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
    // En lugar de eliminar, cambiamos el estado
    const result = await sql`
      UPDATE categorias SET estado = false WHERE id_categoria = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Categoría no encontrada." });
    }
    return res.json({ ok: true, message: "Categoría desactivada." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al desactivar la categoría." });
  }
};
