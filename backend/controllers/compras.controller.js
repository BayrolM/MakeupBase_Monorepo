import sql from "../config/db.js";
import { CONFIG } from "../config/constants.js";

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
    const iva = subtotalTotal * CONFIG.IVA; 
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
        await sql`
          INSERT INTO detalle_compra (id_compra, id_producto, cantidad, precio_unitario)
          VALUES (${compra.id_compra}, ${item.id_producto}, ${item.cantidad}, ${item.precio_unitario})
        `;

        // 3. Actualizar el stock del producto
        await sql`
          UPDATE productos 
          SET stock_actual = stock_actual + ${item.cantidad} 
          WHERE id_producto = ${item.id_producto}
        `;
      }

      return compra;
    });

    return res.status(201).json(resultado);
  } catch (error) {
    console.error('❌ ERROR en crear compra:', error);
    console.error('📋 Stack:', error.stack);
    return res.status(500).json({ ok: false, message: error.message || "Error al registrar la compra." });
  }
};

export const anular = async (req, res) => {
  try {
    const { id } = req.params;

    await sql.begin(async (sql) => {
      // 1. Verificar existencia y estado
      const [compra] = await sql`
        SELECT * FROM compras WHERE id_compra = ${id}
      `;

      if (!compra) {
        throw new Error("Compra no encontrada.");
      }

      if (compra.estado === false) {
        throw new Error("La compra ya se encuentra anulada.");
      }

      // 2. Obtener los detalles de la compra para revertir el stock
      const detalles = await sql`
        SELECT id_producto, cantidad FROM detalle_compra WHERE id_compra = ${id}
      `;

      // 3. Revertir el stock restando lo que se había sumado
      for (const item of detalles) {
        await sql`
          UPDATE productos 
          SET stock_actual = stock_actual - ${item.cantidad} 
          WHERE id_producto = ${item.id_producto}
        `;
      }

      // 4. Actualizar el estado a anulada (false)
      await sql`
        UPDATE compras SET estado = false WHERE id_compra = ${id}
      `;
    });

    return res.json({ ok: true, message: "Compra anulada correctamente." });
  } catch (error) {
    console.error(error);
    const msg = error.message === "Compra no encontrada." || error.message === "La compra ya se encuentra anulada."
      ? error.message 
      : "Error al anular la compra.";
    return res.status(msg === "Error al anular la compra." ? 500 : 400).json({ ok: false, message: msg });
  }
};
