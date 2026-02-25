import sql from "../config/db.js";

export const listar = async (req, res) => {
  try {
    const result = await sql`
      SELECT c.*, p.nombre as nombre_proveedor, u.nombre as nombre_usuario
      FROM compras c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      LEFT JOIN usuarios u ON c.id_usuario_empleado = u.id_usuario
      ORDER BY c.fecha_registro DESC
    `;
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener compras." });
  }
};

export const obtener = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await sql`
      SELECT c.*, p.nombre as nombre_proveedor, u.nombre as nombre_usuario
      FROM compras c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      LEFT JOIN usuarios u ON c.id_usuario_empleado = u.id_usuario
      WHERE c.id_compra = ${id}
    `;
    
    if (compra.length === 0) {
      return res.status(404).json({ ok: false, message: "Compra no encontrada." });
    }
    
    const detalles = await sql`
      SELECT dc.*, pr.nombre as nombre_producto
      FROM detalle_compra dc
      LEFT JOIN productos pr ON dc.id_producto = pr.id_producto
      WHERE dc.id_compra = ${id}
    `;
    
    return res.json({
      ...compra[0],
      detalles
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener la compra." });
  }
};

export const crear = async (req, res) => {
  try {
    const { id_proveedor, items } = req.body;
    const id_usuario = req.user.id_usuario;

    if (!id_proveedor || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: "Faltan datos requeridos (proveedor e ítems)." });
    }

    // Calcular totales
    let subtotalTotal = 0;
    items.forEach(item => {
      subtotalTotal += item.cantidad * item.precio_unitario;
    });
    const iva = subtotalTotal * 0.19; // Ejemplo 19% IVA
    const total = subtotalTotal + iva;

    // Ejecutar transacción
    const resultado = await sql.begin(async (sql) => {
      // 1. Insertar la compra
      const [compra] = await sql`
        INSERT INTO compras (id_proveedor, id_usuario_empleado, fecha_compra, subtotal, iva, total)
        VALUES (${id_proveedor}, ${id_usuario}, NOW(), ${subtotalTotal}, ${iva}, ${total})
        RETURNING *
      `;

      // 2. Insertar los detalles y actualizar stock
      for (const item of items) {
        const subtotalItem = item.cantidad * item.precio_unitario;
        await sql`
          INSERT INTO detalle_compra (id_compra, id_producto, cantidad, precio_unitario, subtotal)
          VALUES (${compra.id_compra}, ${item.id_producto}, ${item.cantidad}, ${item.precio_unitario}, ${subtotalItem})
        `;

        // 3. Actualizar el stock del producto
        await sql`
          UPDATE productos 
          SET stock = stock + ${item.cantidad} 
          WHERE id_producto = ${item.id_producto}
        `;
      }

      return compra;
    });

    return res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al registrar la compra." });
  }
};
