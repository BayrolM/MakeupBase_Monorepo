import sql from '../config/db.js';

/**
 * Crear una nueva orden desde el carrito
 */
export const crearOrden = async (id_usuario, datosEnvio) => {
  const { direccion, ciudad, metodo_pago, items: providedItems } = datosEnvio;

  // Si el frontend envía los items directamente (Flujo de Carrito Local)
  if (providedItems && Array.isArray(providedItems) && providedItems.length > 0) {
    console.log(`🛒 Creando orden desde Carrito Local para usuario ${id_usuario}. Items: ${providedItems.length}`);
    console.log('📦 Items recibidos:', JSON.stringify(providedItems));
    
    // El id_empleado es null cuando el cliente compra solo
    return await crearOrdenDirecta(id_usuario, null, { 
      direccion, 
      ciudad, 
      metodo_pago, 
      items: providedItems 
    });
  }

  // De lo contrario, buscar carrito guardado en BD (Flujo de Carrito en BD)
  console.log(`📂 Buscando Carrito en BD para usuario ${id_usuario}`);
  const carrito = await sql`
    SELECT * FROM pedidos 
    WHERE id_usuario_cliente = ${id_usuario} AND estado = 'carrito'
    LIMIT 1
  `;

  if (carrito.length === 0) {
    throw new Error('No hay items en el carrito (BD-FALLBACK)');
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

  // Usar transacción para asegurar que todo se guarde bien
  return await sql.begin(async (sql) => {
    // 1. Actualizar el pedido de 'carrito' a 'pendiente'
    await sql`
      UPDATE pedidos 
      SET estado = 'pendiente',
          direccion = ${direccion},
          ciudad = ${ciudad},
          total = ${total},
          fecha_pedido = NOW()
      WHERE id_pedido = ${id_pedido}
    `;

    // 2. Reducir stock (Reserva)
    for (const item of items) {
       console.log(`📦 Reservando stock para Pedido ID ${id_pedido}: Producto ${item.id_producto}, Cantidad: ${item.cantidad}`);
      await sql`
        UPDATE productos 
        SET stock_actual = stock_actual - ${item.cantidad}
        WHERE id_producto = ${item.id_producto}
      `;
    }

    return {
      id_pedido,
      total,
      estado: 'pendiente',
    };
  });
};

/**
 * Crear una nueva orden directamente desde el panel (sin pasar por carrito)
 */
export const crearOrdenDirecta = async (id_cliente, id_empleado, datosEnvio) => {
  const { direccion, ciudad, metodo_pago, items } = datosEnvio;

  if (!items || items.length === 0) {
    throw new Error('El pedido debe contener al menos un producto');
  }

  // Verificar stock y calcular subtotales de todos los productos
  let total = 0;
  const itemsValidados = [];
  
  for (const item of items) {
    const p = await sql`SELECT precio_venta, stock_actual FROM productos WHERE id_producto = ${item.id_producto}`;
    if (p.length === 0) throw new Error(`Producto ID ${item.id_producto} no encontrado`);
    
    if (p[0].stock_actual < item.cantidad) {
      throw new Error(`Stock insuficiente para el producto ID ${item.id_producto}`);
    }
    
    const subtotal = p[0].precio_venta * item.cantidad;
    total += subtotal;
    
    itemsValidados.push({
      ...item,
      precio_unitario: p[0].precio_venta,
      subtotal
    });
  }

  // Usar transacción para asegurar que todo se guarde bien
  return await sql.begin(async (sql) => {
    // 1. Crear el Pedido directamente en estado 'pendiente'
    const [pedido] = await sql`
      INSERT INTO pedidos (id_usuario_cliente, id_usuario_empleado, fecha_pedido, direccion, ciudad, subtotal, iva, total, metodo_pago, estado)
      VALUES (${id_cliente}, ${id_empleado}, NOW(), ${direccion}, ${ciudad}, ${total}, 0, ${total}, ${metodo_pago}, 'pendiente')
      RETURNING id_pedido
    `;
    const id_pedido = pedido.id_pedido;

    // 2. Insertar los detalles del pedido
    for (const item of itemsValidados) {
      await sql`
        INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (${id_pedido}, ${item.id_producto}, ${item.cantidad}, ${item.precio_unitario}, ${item.subtotal})
      `;
    }

    // 3. Reducir stock (Reserva)
    for (const item of itemsValidados) {
      console.log(`📦 Reservando stock para Pedido Directo ID ${id_pedido}: Producto ${item.id_producto}, Cantidad: ${item.cantidad}`);
      await sql`
        UPDATE productos 
        SET stock_actual = stock_actual - ${item.cantidad}
        WHERE id_producto = ${item.id_producto}
      `;
    }

    return {
      id_pedido,
      total,
      estado: 'pendiente',
    };
  });
};

/**
 * ✅ MODIFICADO: Obtener historial de órdenes del usuario
 * Si es admin (rol = 1), obtiene TODAS las órdenes
 * Si es usuario normal, solo sus órdenes
 */
export const obtenerOrdenes = async (id_usuario, rol = null, options = {}) => {
  const { 
    estado = null, 
    q = null, 
    page = 1, 
    limit = 10 
  } = options;
  
  const offset = (page - 1) * limit;

  console.log(`📦 obtenerOrdenes - Usuario: ${id_usuario}, Rol: ${rol}, Búsqueda: ${q}`);

  // Fragmentos SQL dinámicos
  const estadoFilter = estado ? sql`AND p.estado = ${estado}` : sql``;
  const searchFilter = q ? sql`AND (u.nombre ILIKE ${'%' + q + '%'} OR u.apellido ILIKE ${'%' + q + '%'} OR p.id_pedido::text ILIKE ${'%' + q + '%'})` : sql``;
  const userFilter = rol === 1 ? sql`WHERE p.estado != 'carrito'` : sql`WHERE p.id_usuario_cliente = ${id_usuario} AND p.estado != 'carrito'`;

  // 1. Contar total para paginación
  const countResult = await sql`
    SELECT COUNT(1) as total
    FROM pedidos p
    LEFT JOIN usuarios u ON p.id_usuario_cliente = u.id_usuario
    ${userFilter}
    ${estadoFilter}
    ${searchFilter}
  `;
  const total = parseInt(countResult[0].total, 10);

  // 2. Obtener los datos paginados
  const data = await sql`
    SELECT
      p.id_pedido,
      p.id_usuario_cliente,
      p.fecha_pedido,
      p.direccion,
      p.ciudad,
      p.total,
      p.estado,
      p.motivo_anulacion,
      p.pago_confirmado,
      p.comprobante_url,
      v.id_venta,
      v.metodo_pago,
      v.fecha_venta,
      CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, '')) as nombre_usuario,

      u.email as email_usuario
    FROM pedidos p
    LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
    LEFT JOIN usuarios u ON p.id_usuario_cliente = u.id_usuario
    ${userFilter}
    ${estadoFilter}
    ${searchFilter}
    ORDER BY p.id_pedido DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  console.log(`✅ Devolviendo página ${page} de órdenes (${data.length} de ${total})`);
  return { total, page, limit, data };
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
        p.id_usuario_cliente,
        p.fecha_pedido,
        p.direccion,
        p.ciudad,
        p.total,
        p.estado,
        p.motivo_anulacion,
        p.pago_confirmado,
        p.transportadora,
        p.numero_guia,
        p.tracking_link,
        p.fecha_envio,
        p.fecha_estimada,
        v.id_venta,
        v.metodo_pago,
        v.fecha_venta,
        CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, '')) as nombre_usuario,

        u.email as email_usuario
      FROM pedidos p
      LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
      LEFT JOIN usuarios u ON p.id_usuario_cliente = u.id_usuario
      WHERE p.id_pedido = ${id_pedido}
    `;
  } else {
    // Usuario normal solo puede ver sus propias órdenes
    console.log('👤 Usuario normal - Verificando que la orden le pertenece');
    orden = await sql`
      SELECT 
        p.id_pedido,
        p.id_usuario_cliente,
        p.fecha_pedido,
        p.direccion,
        p.ciudad,
        p.total,
        p.estado,
        p.transportadora,
        p.numero_guia,
        p.tracking_link,
        p.fecha_envio,
        p.fecha_estimada,
        v.id_venta,
        v.metodo_pago,
        v.fecha_venta
      FROM pedidos p

      LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
      WHERE p.id_pedido = ${id_pedido} 
        AND p.id_usuario_cliente = ${id_usuario}
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
      p.nombre
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

/**
 * Actualizar el estado de un pedido
 */
export const actualizarEstadoPedido = async (id_pedido, estado, motivo = null, shippingData = null) => {
  return await sql.begin(async (sql) => {
    // 1. Obtener datos del pedido
    const [pedido] = await sql`SELECT * FROM pedidos WHERE id_pedido = ${id_pedido}`;
    if (!pedido) throw new Error('Pedido no encontrado');

    // 2. Si es cancelación, DEVOLVEMOS el stock reservado
    if (estado === 'cancelado') {
      const items = await sql`SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido = ${id_pedido}`;
      for (const item of items) {
        await sql`
          UPDATE productos 
          SET stock_actual = stock_actual + ${item.cantidad} 
          WHERE id_producto = ${item.id_producto}
        `;
      }
      // Anular la venta asociada si existe
      await sql`UPDATE ventas SET estado = false WHERE id_pedido = ${id_pedido}`;
    }

    // 3. Si el nuevo estado es 'entregado', crear la venta si no existe Y el pedido ya está pago
    if (estado === 'entregado') {
      if (!pedido.pago_confirmado) {
        throw new Error('No se puede marcar como Entregado un pedido que no ha sido marcado como Pagado.');
      }

      const ventaExistente = await sql`SELECT id_venta FROM ventas WHERE id_pedido = ${id_pedido} AND estado = true`;
      
      if (ventaExistente.length === 0) {
        // Crear la venta
        const [nuevaVenta] = await sql`
          INSERT INTO ventas (
            id_pedido, id_usuario_cliente, id_usuario_empleado, 
            fecha_venta, subtotal, iva, total, metodo_pago, estado
          ) VALUES (
            ${id_pedido}, ${pedido.id_usuario_cliente}, ${pedido.id_usuario_empleado || null}, 
            NOW(), ${pedido.subtotal}, ${pedido.iva}, ${pedido.total}, ${pedido.metodo_pago}, true
          ) RETURNING id_venta
        `;

        // Copiar detalles del pedido a detalles de venta (EL STOCK YA SE REDUJO AL CREAR EL PEDIDO)
        const items = await sql`SELECT * FROM detalle_pedido WHERE id_pedido = ${id_pedido}`;
        for (const item of items) {
          // Insertar detalle de venta
          await sql`
            INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
            VALUES (${nuevaVenta.id_venta}, ${item.id_producto}, ${item.cantidad}, ${item.precio_unitario}, ${item.subtotal})
          `;
        }
      }
    }

    // 4. Actualizar el estado del pedido y shipping info si aplica
    let setClause = sql`estado = ${estado}, motivo_anulacion = ${motivo}`;
    
    if (estado === 'enviado' && shippingData) {
      setClause = sql`${setClause}, 
        transportadora = ${shippingData.transportadora},
        numero_guia = ${shippingData.numero_guia},
        tracking_link = ${shippingData.tracking_link},
        fecha_envio = ${shippingData.fecha_envio},
        fecha_estimada = ${shippingData.fecha_estimada}`;
    }

    const [updatedPedido] = await sql`
      UPDATE pedidos 
      SET ${setClause}
      WHERE id_pedido = ${id_pedido}
      RETURNING *
    `;

    return updatedPedido;
  });
};

/**
 * Cancelar una orden y devolver el stock reservado
 * Solo se pueden cancelar pedidos en estado 'pendiente'
 */
export const cancelarOrden = async (id_pedido, motivo) => {
  return await sql.begin(async (sql) => {
    // 1. Verificar que el pedido existe y está en estado pendiente
    const [pedido] = await sql`SELECT * FROM pedidos WHERE id_pedido = ${id_pedido}`;
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    if (pedido.estado !== 'pendiente') {
      throw new Error('Solo se pueden cancelar pedidos pendientes');
    }

    // 3. Devolver el stock reservado
    const items = await sql`SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido = ${id_pedido}`;
    for (const item of items) {
      await sql`
        UPDATE productos 
        SET stock_actual = stock_actual + ${item.cantidad} 
        WHERE id_producto = ${item.id_producto}
      `;
    }

    // 4. Marcar el pedido como cancelado
    const [pedidoCancelado] = await sql`
      UPDATE pedidos
      SET estado = 'cancelado',
          motivo_anulacion = ${motivo}
      WHERE id_pedido = ${id_pedido}
      RETURNING *
    `;

    // 5. Anular cualquier venta asociada (por si acaso)
    await sql`UPDATE ventas SET estado = false WHERE id_pedido = ${id_pedido}`;

    return pedidoCancelado;
  });
};

/**
 * Confirmar o desconfirmar el pago de un pedido
 */
export const confirmarPago = async (id_pedido, pago_confirmado) => {
  const [updatedPedido] = await sql`
    UPDATE pedidos 
    SET pago_confirmado = ${pago_confirmado}
    WHERE id_pedido = ${id_pedido}
    RETURNING *
  `;
  if (!updatedPedido) throw new Error('Pedido no encontrado');
  return updatedPedido;
};

export const actualizarComprobante = async (id_pedido, url) => {
  const [updatedPedido] = await sql`
  UPDATE pedidos
  SET comprobante_url = ${url}
  WHERE id_pedido = ${id_pedido}
  RETURNING *
  `;
  return updatedPedido;
}

/**
 * Actualizar datos de un pedido (dirección, cliente, productos)
 * - pendiente: permite cambiar dirección, cliente y productos
 * - preparado/procesando: solo dirección
 */
export const actualizarPedido = async (id_pedido, { direccion, id_cliente, items }) => {
  const [pedido] = await sql`SELECT * FROM pedidos WHERE id_pedido = ${id_pedido}`;
  if (!pedido) throw new Error('Pedido no encontrado');

  const estadosEditables = ['pendiente', 'preparado', 'procesando'];
  if (!estadosEditables.includes(pedido.estado)) {
    throw new Error(`Solo se puede editar un pedido en estado pendiente, preparado o procesando. Estado actual: ${pedido.estado}`);
  }

  return await sql.begin(async (sql) => {
    // Actualizar dirección siempre que se envíe
    if (direccion !== undefined) {
      await sql`UPDATE pedidos SET direccion = ${direccion} WHERE id_pedido = ${id_pedido}`;
    }

    // Cambiar cliente (solo pendiente)
    if (id_cliente !== undefined && pedido.estado === 'pendiente') {
      await sql`UPDATE pedidos SET id_usuario_cliente = ${id_cliente} WHERE id_pedido = ${id_pedido}`;
    }

    // Cambiar productos (solo pendiente)
    if (items && Array.isArray(items) && items.length > 0 && pedido.estado === 'pendiente') {
      // 1. Devolver stock de los items actuales
      const itemsActuales = await sql`SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido = ${id_pedido}`;
      for (const item of itemsActuales) {
        await sql`UPDATE productos SET stock_actual = stock_actual + ${item.cantidad} WHERE id_producto = ${item.id_producto}`;
      }

      // 2. Eliminar detalles actuales
      await sql`DELETE FROM detalle_pedido WHERE id_pedido = ${id_pedido}`;

      // 3. Insertar nuevos items y reservar stock
      let nuevoTotal = 0;
      for (const item of items) {
        const [p] = await sql`SELECT precio_venta, stock_actual FROM productos WHERE id_producto = ${item.id_producto}`;
        if (!p) throw new Error(`Producto ID ${item.id_producto} no encontrado`);
        if (p.stock_actual < item.cantidad) throw new Error(`Stock insuficiente para el producto ID ${item.id_producto}`);

        const subtotal = p.precio_venta * item.cantidad;
        nuevoTotal += subtotal;

        await sql`
          INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
          VALUES (${id_pedido}, ${item.id_producto}, ${item.cantidad}, ${p.precio_venta}, ${subtotal})
        `;
        await sql`UPDATE productos SET stock_actual = stock_actual - ${item.cantidad} WHERE id_producto = ${item.id_producto}`;
      }

      // 4. Actualizar total del pedido
      await sql`UPDATE pedidos SET total = ${nuevoTotal} WHERE id_pedido = ${id_pedido}`;
    }

    const [updated] = await sql`SELECT * FROM pedidos WHERE id_pedido = ${id_pedido}`;
    return updated;
  });
};

/**
 * Cancelar pedido por el cliente — solo si le pertenece y está en 'pendiente'
 */
export const cancelarOrdenCliente = async (id_pedido, id_usuario) => {
  const [pedido] = await sql`SELECT * FROM pedidos WHERE id_pedido = ${id_pedido}`;
  if (!pedido) throw new Error('Pedido no encontrado');
  if (pedido.id_usuario_cliente !== id_usuario) throw new Error('No tienes permiso para cancelar este pedido');
  if (pedido.estado !== 'pendiente') throw new Error('Solo puedes cancelar pedidos en estado pendiente');

  return await sql.begin(async (sql) => {
    const items = await sql`SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido = ${id_pedido}`;
    for (const item of items) {
      await sql`UPDATE productos SET stock_actual = stock_actual + ${item.cantidad} WHERE id_producto = ${item.id_producto}`;
    }
    const [updated] = await sql`UPDATE pedidos SET estado = 'cancelado', motivo_anulacion = 'Cancelado por el cliente' WHERE id_pedido = ${id_pedido} RETURNING *`;
    return updated;
  });
};

/**
 * Actualizar dirección de un pedido por el cliente — solo si le pertenece y está en 'pendiente'
 */
export const actualizarDireccionCliente = async (id_pedido, id_usuario, direccion) => {
  const [pedido] = await sql`SELECT * FROM pedidos WHERE id_pedido = ${id_pedido}`;
  if (!pedido) throw new Error('Pedido no encontrado');
  if (pedido.id_usuario_cliente !== id_usuario) throw new Error('No tienes permiso para editar este pedido');
  if (!['pendiente', 'preparado'].includes(pedido.estado)) throw new Error('Solo puedes cambiar la dirección si el pedido está en pendiente o preparado');

  const [updated] = await sql`UPDATE pedidos SET direccion = ${direccion} WHERE id_pedido = ${id_pedido} RETURNING *`;
  return updated;
};
