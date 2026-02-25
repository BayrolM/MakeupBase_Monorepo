import sql from "../config/db.js";

export const listar = async (req, res) => {
  try {
    const result = await sql`SELECT * FROM marcas ORDER BY id_marca ASC`;
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener marcas." });
  }
};

export const obtener = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`SELECT * FROM marcas WHERE id_marca = ${id}`;
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Marca no encontrada." });
    }
    return res.json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener la marca." });
  }
};

export const crear = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ ok: false, message: "El nombre es obligatorio." });
    }
    const result = await sql`
      INSERT INTO marcas (nombre, descripcion, estado)
      VALUES (${nombre}, ${descripcion || ""}, true)
      RETURNING *
    `;
    return res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al crear la marca." });
  }
};

export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;
    
    const result = await sql`
      UPDATE marcas
      SET 
        nombre = ${nombre},
        descripcion = ${descripcion},
        estado = ${estado !== undefined ? estado : true}
      WHERE id_marca = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Marca no encontrada." });
    }
    
    return res.json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al actualizar la marca." });
  }
};

export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      UPDATE marcas SET estado = false WHERE id_marca = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Marca no encontrada." });
    }
    return res.json({ ok: true, message: "Marca desactivada." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al desactivar la marca." });
  }
};
