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
    const { nombre, email, telefono, documento_nit, tipo_proveedor } = req.body;
    if (!nombre) {
      return res.status(400).json({ ok: false, message: "El nombre es obligatorio." });
    }
    const result = await sql`
      INSERT INTO proveedores (nombre, email, telefono, documento_nit, tipo_proveedor, estado)
      VALUES (${nombre}, ${email || ""}, ${telefono || ""}, ${documento_nit || ""}, ${tipo_proveedor || "Persona Natural"}, true)
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
    const { nombre, email, telefono, documento_nit, tipo_proveedor, estado } = req.body;
    
    const result = await sql`
      UPDATE proveedores
      SET 
        nombre = ${nombre},
        email = ${email},
        telefono = ${telefono},
        documento_nit = ${documento_nit},
        tipo_proveedor = ${tipo_proveedor},
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
    const result = await sql`
      UPDATE proveedores SET estado = false WHERE id_proveedor = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Proveedor no encontrado." });
    }
    return res.json({ ok: true, message: "Proveedor desactivado." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al desactivar el proveedor." });
  }
};
