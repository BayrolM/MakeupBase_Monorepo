import sql from '../config/db.js';

/**
 * Crear una nueva orden desde el carrito
 */
export const crearOrden = async (id_usuario, datosEnvio) => {
  const { direccion, ciudad, metodo_pago } = datosEnvio;

  // Obtener el carrito actual
  const carrito = await sql`
    SELECT * FROM pedidos 
    WHERE id_usuario = ${id_usuario} AND estado = 'carrito'
    LIMIT 1
  `;

  if (carrito.length === 0) {
    throw new Error('No hay items en el carrito');
  }

  const id_pedido = carrito[0].id_pedido;

  // Obtener items del carrito
  const items = await sql`
    SELECT dp.*, p.stock_actual
    FROM detalle_pedido dp
    INNER JOIN productos p ON dp.id_producto = p.id_producto
    WHERE dp.id_pedido = ${id_pedido}
  `;

  if (items.length === 0) {
    throw new Error('El carrito está vacío');
  }

  // Verificar stock de todos los productos
  for (const item of items) {
    if (item.stock_actual < item.cantidad) {
      throw new Error(
        `Stock insuficiente para el producto ID ${item.id_producto}`
      );
    }
  }

  // Calcular total
  const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  // Actualizar el pedido de 'carrito' a 'pendiente'
  await sql`
    UPDATE pedidos 
    SET estado = 'pendiente',
        direccion = ${direccion},
        ciudad = ${ciudad},
        total = ${total},
        fecha_pedido = NOW()
    WHERE id_pedido = ${id_pedido}
  `;

  // Crear registro de venta
  const venta = await sql`
    INSERT INTO ventas (id_pedido, id_cliente, fecha_venta, metodo_pago, total, estado)
    VALUES (${id_pedido}, ${id_usuario}, NOW(), ${metodo_pago}, ${total}, true)
    RETURNING *
  `;

  // Copiar items del pedido a detalle_ventas
  for (const item of items) {
    await sql`
      INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario)
      VALUES (${venta[0].id_venta}, ${item.id_producto}, ${item.cantidad}, ${item.precio_unitario})
    `;

    // Reducir stock
    await sql`
      UPDATE productos 
      SET stock_actual = stock_actual - ${item.cantidad}
      WHERE id_producto = ${item.id_producto}
    `;
  }

  return {
    id_pedido,
    id_venta: venta[0].id_venta,
    total,
    estado: 'pendiente',
  };
};

/**
 * ✅ MODIFICADO: Obtener historial de órdenes del usuario
 * Si es admin (rol = 1), obtiene TODAS las órdenes
 * Si es usuario normal, solo sus órdenes
 */
export const obtenerOrdenes = async (id_usuario, rol = null, estado = null) => {
  console.log(`📦 obtenerOrdenes - Usuario: ${id_usuario}, Rol: ${rol}`);

  let ordenes;

  // Construir el fragmento de la condición de estado
  const estadoFilter = estado ? sql`AND p.estado = ${estado}` : sql``;

  // Si es admin (rol === 1), obtener TODAS las ordenes
  if (rol === 1) {
    console.log('👑 Admin detectado - Obteniendo TODAS las órdenes');
    ordenes = await sql`
      SELECT
        p.id_pedido,
        p.id_usuario,
        p.fecha_pedido,
        p.direccion,
        p.ciudad,
        p.total,
        p.estado,
        v.id_venta,
        v.metodo_pago,
        CONCAT(u.nombres, ' ', u.apellidos) as nombre_usuario,
        u.email as email_usuario
      FROM pedidos p
      LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE p.estado != 'carrito'
      ${estadoFilter}
      ORDER BY p.id_pedido ASC
    `;
  } else {
    // Usuario normal solo ve sus propias órdenes
    console.log(
      `👤 Usuario normal - Obteniendo órdenes de usuario ${id_usuario}`
    );
    ordenes = await sql`
      SELECT
        p.id_pedido,
        p.id_usuario,
        p.fecha_pedido,
        p.direccion,
        p.ciudad,
        p.total,
        p.estado,
        v.id_venta,
        v.metodo_pago,
        CONCAT(u.nombres, ' ', u.apellidos) as nombre_usuario
      FROM pedidos p
      LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE p.id_usuario = ${id_usuario}
        AND p.estado != 'carrito'
      ORDER BY p.id_pedido ASC
    `;
  }

  console.log(`✅ Encontradas ${ordenes.length} órdenes`);
  return ordenes;
};

/**
 * Obtener detalle de una orden especifica
 * Si es admin, puede ver cualquier orden
 * Si es usuario normal, solo puede ver sus propias ordenes
 */
export const obtenerDetalleOrden = async (
  id_usuario,
  id_pedido,
  rol = null
) => {
  console.log(
    `📝 obtenerDetalleOrden - Usuario: ${id_usuario}, Pedido: ${id_pedido}, Rol: ${rol}`
  );

  let orden;

  // Si es admin, puede ver cualquier orden
  if (rol === 1) {
    console.log('👑 Admin - Buscando orden sin restricción de usuario');
    orden = await sql`
      SELECT 
        p.id_pedido,
        p.id_usuario,
        p.fecha_pedido,
        p.direccion,
        p.ciudad,
        p.total,
        p.estado,
        v.id_venta,
        v.metodo_pago,
        CONCAT(u.nombres, ' ', u.apellidos) as nombre_usuario,
        u.email as email_usuario
      FROM pedidos p
      LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE p.id_pedido = ${id_pedido}
    `;
  } else {
    // Usuario normal solo puede ver sus propias órdenes
    console.log('👤 Usuario normal - Verificando que la orden le pertenece');
    orden = await sql`
      SELECT 
        p.id_pedido,
        p.id_usuario,
        p.fecha_pedido,
        p.direccion,
        p.ciudad,
        p.total,
        p.estado,
        v.id_venta,
        v.metodo_pago
      FROM pedidos p
      LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
      WHERE p.id_pedido = ${id_pedido} 
        AND p.id_usuario = ${id_usuario}
    `;
  }

  if (orden.length === 0) {
    throw new Error('Orden no encontrada');
  }

  // Obtener items de la orden
  const items = await sql`
    SELECT 
      dp.id_detalle_pedido,
      dp.id_producto,
      dp.cantidad,
      dp.precio_unitario,
      dp.subtotal,
      p.nombre,
      p.sku
    FROM detalle_pedido dp
    INNER JOIN productos p ON dp.id_producto = p.id_producto
    WHERE dp.id_pedido = ${id_pedido}
  `;

  console.log(`✅ Orden encontrada con ${items.length} items`);

  return {
    ...orden[0],
    items,
  };
};
