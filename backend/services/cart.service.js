import sql from "../config/db.js";

/**
 * Obtener el carrito del usuario
 */
export const obtenerCarrito = async (id_usuario) => {
  // Buscar o crear un pedido en estado 'carrito'
  let pedido = await sql`
    SELECT * FROM pedidos 
    WHERE id_usuario = ${id_usuario} AND estado = 'carrito'
    LIMIT 1
  `;

  if (pedido.length === 0) {
    // Crear un nuevo carrito
    pedido = await sql`
      INSERT INTO pedidos (id_usuario, fecha_pedido, direccion, ciudad, total, estado)
      VALUES (${id_usuario}, NOW(), '', '', 0, 'carrito')
      RETURNING *
    `;
  }

  const id_pedido = pedido[0].id_pedido;

  // Obtener items del carrito con información del producto
  const items = await sql`
    SELECT 
      dp.id_detalle_pedido,
      dp.id_producto,
      dp.cantidad,
      dp.precio_unitario,
      dp.subtotal,
      p.nombre,
      p.sku,
      p.stock_actual
    FROM detalle_pedido dp
    INNER JOIN productos p ON dp.id_producto = p.id_producto
    WHERE dp.id_pedido = ${id_pedido}
  `;

  const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  return {
    id_pedido,
    items,
    total,
  };
};

/**
 * Agregar producto al carrito
 */
export const agregarAlCarrito = async (id_usuario, id_producto, cantidad) => {
  // Obtener o crear carrito
  let pedido = await sql`
    SELECT * FROM pedidos 
    WHERE id_usuario = ${id_usuario} AND estado = 'carrito'
    LIMIT 1
  `;

  if (pedido.length === 0) {
    pedido = await sql`
      INSERT INTO pedidos (id_usuario, fecha_pedido, direccion, ciudad, total, estado)
      VALUES (${id_usuario}, NOW(), '', '', 0, 'carrito')
      RETURNING *
    `;
  }

  const id_pedido = pedido[0].id_pedido;

  // Obtener precio del producto
  const producto = await sql`
    SELECT precio_venta, stock_actual FROM productos WHERE id_producto = ${id_producto}
  `;

  if (producto.length === 0) {
    throw new Error("Producto no encontrado");
  }

  if (producto[0].stock_actual < cantidad) {
    throw new Error("Stock insuficiente");
  }

  const precio_unitario = producto[0].precio_venta;

  // Verificar si el producto ya está en el carrito
  const itemExistente = await sql`
    SELECT * FROM detalle_pedido 
    WHERE id_pedido = ${id_pedido} AND id_producto = ${id_producto}
  `;

  if (itemExistente.length > 0) {
    // Actualizar cantidad
    await sql`
      UPDATE detalle_pedido 
      SET cantidad = cantidad + ${cantidad}
      WHERE id_detalle_pedido = ${itemExistente[0].id_detalle_pedido}
    `;
  } else {
    // Insertar nuevo item
    await sql`
      INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
      VALUES (${id_pedido}, ${id_producto}, ${cantidad}, ${precio_unitario})
    `;
  }

  return await obtenerCarrito(id_usuario);
};

/**
 * Actualizar cantidad de un item del carrito
 */
export const actualizarItemCarrito = async (
  id_usuario,
  id_detalle_pedido,
  cantidad
) => {
  if (cantidad <= 0) {
    throw new Error("La cantidad debe ser mayor a 0");
  }

  // Verificar que el item pertenece al carrito del usuario
  const item = await sql`
    SELECT dp.*, p.stock_actual
    FROM detalle_pedido dp
    INNER JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
    INNER JOIN productos p ON dp.id_producto = p.id_producto
    WHERE dp.id_detalle_pedido = ${id_detalle_pedido} 
      AND ped.id_usuario = ${id_usuario}
      AND ped.estado = 'carrito'
  `;

  if (item.length === 0) {
    throw new Error("Item no encontrado en el carrito");
  }

  if (item[0].stock_actual < cantidad) {
    throw new Error("Stock insuficiente");
  }

  await sql`
    UPDATE detalle_pedido 
    SET cantidad = ${cantidad}
    WHERE id_detalle_pedido = ${id_detalle_pedido}
  `;

  return await obtenerCarrito(id_usuario);
};

/**
 * Eliminar item del carrito
 */
export const eliminarItemCarrito = async (id_usuario, id_detalle_pedido) => {
  // Verificar que el item pertenece al carrito del usuario
  const item = await sql`
    SELECT dp.*
    FROM detalle_pedido dp
    INNER JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
    WHERE dp.id_detalle_pedido = ${id_detalle_pedido} 
      AND ped.id_usuario = ${id_usuario}
      AND ped.estado = 'carrito'
  `;

  if (item.length === 0) {
    throw new Error("Item no encontrado en el carrito");
  }

  await sql`
    DELETE FROM detalle_pedido 
    WHERE id_detalle_pedido = ${id_detalle_pedido}
  `;

  return await obtenerCarrito(id_usuario);
};
