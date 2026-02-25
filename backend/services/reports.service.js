import sql from '../config/db.js';

/**
 * Obtener estadísticas para el dashboard
 */
export const obtenerDashboard = async () => {
  // Total de ventas
  const totalVentas = await sql`
    SELECT COALESCE(SUM(total), 0) as total
    FROM ventas
    WHERE estado = true
  `;

  // Total de órdenes
  const totalOrdenes = await sql`
    SELECT COUNT(*) as total
    FROM pedidos
    WHERE estado != 'carrito'
  `;

  // Total de productos
  const totalProductos = await sql`
    SELECT COUNT(*) as total
    FROM productos
    WHERE estado = true
  `;

  // Total de usuarios
  const totalUsuarios = await sql`
    SELECT COUNT(*) as total
    FROM usuarios
    WHERE estado = true
  `;

  // Productos con bajo stock
  const productosBajoStock = await sql`
    SELECT COUNT(*) as total
    FROM productos
    WHERE stock_actual <= stock_min AND estado = true
  `;

  // Ventas por mes (últimos 6 meses)
  const ventasPorMes = await sql`
    SELECT 
      TO_CHAR(fecha_venta, 'YYYY-MM') as mes,
      COUNT(*) as cantidad,
      SUM(total) as total
    FROM ventas
    WHERE fecha_venta >= NOW() - INTERVAL '6 months'
      AND estado = true
    GROUP BY TO_CHAR(fecha_venta, 'YYYY-MM')
    ORDER BY mes DESC
  `;

  // Productos más vendidos
  const productosMasVendidos = await sql`
    SELECT 
      p.id_producto,
      p.nombre,
      p.sku,
      SUM(dv.cantidad) as total_vendido
    FROM detalle_ventas dv
    INNER JOIN productos p ON dv.id_producto = p.id_producto
    INNER JOIN ventas v ON dv.id_venta = v.id_venta
    WHERE v.estado = true
    GROUP BY p.id_producto, p.nombre, p.sku
    ORDER BY total_vendido DESC
    LIMIT 10
  `;

  return {
    resumen: {
      total_ventas: parseFloat(totalVentas[0].total),
      total_ordenes: parseInt(totalOrdenes[0].total),
      total_productos: parseInt(totalProductos[0].total),
      total_usuarios: parseInt(totalUsuarios[0].total),
      productos_bajo_stock: parseInt(productosBajoStock[0].total),
    },
    ventas_por_mes: ventasPorMes,
    productos_mas_vendidos: productosMasVendidos,
  };
};

/**
 * Obtener reporte de ventas con filtros
 */
export const obtenerReporteVentas = async (filtros = {}) => {
  const { fecha_inicio, fecha_fin, id_usuario, limit = 50 } = filtros;

  let whereConditions = sql`WHERE v.estado = true`;

  if (fecha_inicio && fecha_fin) {
    whereConditions = sql`
      WHERE v.estado = true
        AND v.fecha_venta >= ${fecha_inicio}::timestamp
        AND v.fecha_venta <= ${fecha_fin}::timestamp
    `;
  } else if (fecha_inicio) {
    whereConditions = sql`
      WHERE v.estado = true
        AND v.fecha_venta >= ${fecha_inicio}::timestamp
    `;
  } else if (fecha_fin) {
    whereConditions = sql`
      WHERE v.estado = true
        AND v.fecha_venta <= ${fecha_fin}::timestamp
    `;
  }

  if (id_usuario) {
    whereConditions = sql`${whereConditions} AND v.id_cliente = ${id_usuario}`;
  }

  const ventas = await sql`
    SELECT
      v.id_venta,
      CONCAT(u.nombres, ' ', u.apellidos) as nombre_usuario,
      pr.nombre as nombre_producto,
      dv.cantidad,
      dv.subtotal,
      v.fecha_venta,
      v.metodo_pago,
      v.total as total_venta,
      p.id_pedido,
      p.estado as estado_pedido
    FROM detalle_ventas dv
    INNER JOIN ventas v ON dv.id_venta = v.id_venta
    INNER JOIN productos pr ON dv.id_producto = pr.id_producto
    INNER JOIN usuarios u ON v.id_cliente = u.id_usuario
    LEFT JOIN pedidos p ON v.id_pedido = p.id_pedido
    ${whereConditions}
    ORDER BY v.id_venta ASC
    LIMIT ${limit}
  `;

  // Calcular totales
  const totales = await sql`
    SELECT
      COUNT(DISTINCT v.id_venta) as cantidad_ventas,
      SUM(v.total) as total_ventas,
      AVG(v.total) as promedio_venta
    FROM ventas v
    ${whereConditions}
  `;

  return {
    ventas,
    totales: {
      cantidad_ventas: parseInt(totales[0].cantidad_ventas),
      total_ventas: parseFloat(totales[0].total_ventas || 0),
      promedio_venta: parseFloat(totales[0].promedio_venta || 0),
    },
  };
};

/**
 * Obtener reporte de stock
 */
export const obtenerReporteStock = async () => {
  const productos = await sql`
    SELECT
      p.id_producto,
      p.sku,
      p.nombre,
      p.stock_actual,
      p.stock_max,
      p.stock_min,
      p.precio_venta,
      m.nombre as marca,
      c.nombre as categoria
    FROM productos p
    INNER JOIN marcas m ON p.id_marca = m.id_marca
    INNER JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE p.estado = true
    ORDER BY p.stock_actual ASC
  `;

  return productos;
};

/**
 * Obtener reporte de usuarios
 */
export const obtenerReporteUsuarios = async () => {
  const usuarios = await sql`
    SELECT
      u.id_usuario,
      u.documento,
      CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo,
      u.email,
      u.telefono,
      u.ciudad,
      r.nombre as rol,
      u.estado
    FROM usuarios u
    INNER JOIN roles r ON u.id_rol = r.id_rol
    ORDER BY u.id_usuario
  `;

  return usuarios;
};

/**
 * Obtener detalle de una venta específica
 */
export const obtenerDetalleVenta = async (id_venta) => {
  // Obtener información de la venta
  const venta = await sql`
    SELECT
      v.id_venta,
      v.fecha_venta,
      v.metodo_pago,
      v.total,
      v.estado,
      u.id_usuario,
      u.nombres,
      u.apellidos,
      u.email,
      u.telefono,
      u.documento,
      p.id_pedido,
      p.direccion,
      p.ciudad,
      p.estado as estado_pedido
    FROM ventas v
    INNER JOIN usuarios u ON v.id_cliente = u.id_usuario
    LEFT JOIN pedidos p ON v.id_pedido = p.id_pedido
    WHERE v.id_venta = ${id_venta}
  `;

  if (venta.length === 0) {
    return null;
  }

  // Obtener los items de la venta
  const items = await sql`
    SELECT
      dv.id_detalle_venta,
      dv.id_producto,
      dv.cantidad,
      dv.precio_unitario,
      dv.subtotal,
      p.nombre,
      p.sku,
      p.descripcion
    FROM detalle_ventas dv
    INNER JOIN productos p ON dv.id_producto = p.id_producto
    WHERE dv.id_venta = ${id_venta}
    ORDER BY dv.id_detalle_venta
  `;

  return {
    ...venta[0],
    items,
  };
};
