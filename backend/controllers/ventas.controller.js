import sql from "../config/db.js";
import * as ventasService from "../services/ventas.service.js";

export const listar = async (req, res) => {
  try {
    const { q, id_cliente, fecha_inicio, fecha_fin, page = 1, limit = 10 } = req.query;

    const result = await ventasService.listarVentas({
      q,
      id_cliente,
      fecha_inicio,
      fecha_fin,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener ventas." });
  }
};

export const crear = async (req, res) => {
  try {
    const { id_usuario_cliente, id_pedido, metodo_pago, productos, subtotal, iva, total } = req.body;
    const id_usuario_empleado = req.user?.id_usuario;

    console.log("📥 Nueva Venta - Body clienteID:", id_usuario_cliente);
    console.log("👤 Empleado ID:", id_usuario_empleado);

    if (!id_usuario_empleado) {
        return res.status(401).json({ ok: false, message: "No se pudo identificar al empleado. Reintente iniciar sesión." });
    }

    if (!id_usuario_cliente) {
        return res.status(400).json({ ok: false, message: "Debe seleccionar un cliente válido." });
    }

    // Usar transacción para asegurar que todo se guarde bien
    const [venta] = await sql.begin(async (sql) => {
      // 0. Validar stock antes de empezar (ya debería estar reservado por el pedido)
      for (const prod of productos) {
        const [p] = await sql`SELECT stock_actual, nombre FROM productos WHERE id_producto = ${Number(prod.productoId)}`;
        if (!p) {
          throw new Error(`Producto ID ${prod.productoId} no encontrado`);
        }
      }

      // 1. Insertar la venta
      const [nuevaVenta] = await sql`
        INSERT INTO ventas (
          id_usuario_cliente, id_usuario_empleado, id_pedido, 
          metodo_pago, subtotal, iva, total, estado, fecha_venta
        ) VALUES (
          ${id_usuario_cliente}, ${id_usuario_empleado}, ${id_pedido || null}, 
          ${metodo_pago}, ${subtotal}, ${iva}, ${total}, true, NOW()
        ) RETURNING *
      `;

      // 2. Insertar detalles y reducir stock si es venta directa
      for (const prod of productos) {
        await sql`
          INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
          VALUES (${nuevaVenta.id_venta}, ${Number(prod.productoId)}, ${prod.cantidad}, ${prod.precioUnitario}, ${prod.cantidad * prod.precioUnitario})
        `;

        // Si es venta directa (sin pedido), debemos restar el stock aquí
        if (!id_pedido) {
          const [p] = await sql`SELECT stock_actual, nombre FROM productos WHERE id_producto = ${Number(prod.productoId)}`;
          if (p.stock_actual < prod.cantidad) {
            throw new Error(`Stock insuficiente para el producto "${p.nombre}" (Disponible: ${p.stock_actual})`);
          }

          console.log(`💰 Reduciendo stock (Venta Directa) para Producto ID ${prod.productoId}: ${p.stock_actual} -> ${p.stock_actual - prod.cantidad}`);
          await sql`UPDATE productos SET stock_actual = stock_actual - ${prod.cantidad} WHERE id_producto = ${Number(prod.productoId)}`;
        }
      }

      return [nuevaVenta];
    });

    return res.status(201).json(venta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: error.message || "Error al crear la venta." });
  }
};

export const anular = async (req, res) => {
  try {
    const { id } = req.params;

    await sql.begin(async (sql) => {
      // 1. Obtener detalles para devolver stock
      const detalles = await sql`
        SELECT id_producto, cantidad FROM detalle_ventas WHERE id_venta = ${id}
      `;

      for (const det of detalles) {
        await sql`
          UPDATE productos 
          SET stock_actual = stock_actual + ${det.cantidad}
          WHERE id_producto = ${det.id_producto}
        `;
      }

      // 2. Cambiar estado
      await sql`
        UPDATE ventas SET estado = false WHERE id_venta = ${id}
      `;
    });

    return res.json({ ok: true, message: "Venta anulada y stock devuelto." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al anular la venta." });
  }
};
