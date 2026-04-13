import sql from "../config/db.js";

export const listarVentas = async (filters = {}) => {
  const {
    q,
    id_cliente,
    fecha_inicio,
    fecha_fin,
    page = 1,
    limit = 10
  } = filters;

  const offset = (page - 1) * limit;

  // Detectar si la búsqueda es por estado
  let estadoBool = null;
  if (q) {
    const qLower = q.toLowerCase().trim();
    if (qLower === 'activo' || qLower === 'activa') estadoBool = true;
    else if (qLower === 'anulada' || qLower === 'anulado' || qLower === 'inactivo') estadoBool = false;
  }

  // Fragmento WHERE dinámico
  const whereFragment = sql`
    WHERE 1=1
    ${q && estadoBool === null ? sql`AND (u.nombre ILIKE ${'%' + q + '%'} OR u.apellido ILIKE ${'%' + q + '%'} OR v.id_venta::text ILIKE ${'%' + q + '%'})` : sql``}
    ${estadoBool !== null ? sql`AND v.estado = ${estadoBool}` : sql``}
    ${id_cliente ? sql`AND v.id_usuario_cliente = ${id_cliente}` : sql``}
    ${fecha_inicio ? sql`AND v.fecha_venta >= ${fecha_inicio}` : sql``}
    ${fecha_fin ? sql`AND v.fecha_venta <= ${fecha_fin}` : sql``}
  `;

  // Contar total para paginación
  const countResult = await sql`
    SELECT COUNT(1) AS total 
    FROM ventas v
    LEFT JOIN usuarios u ON v.id_usuario_cliente = u.id_usuario
    ${whereFragment}
  `;
  const total = parseInt(countResult[0].total, 10);

  // Obtener ventas paginadas
  const items = await sql`
    SELECT 
      v.*, 
      u.nombre as nombre_cliente,
      u.apellido as apellido_cliente,
      (
        SELECT json_agg(dv)
        FROM (
          SELECT dv.*, p.nombre as nombre_producto 
          FROM detalle_ventas dv
          JOIN productos p ON dv.id_producto = p.id_producto
          WHERE dv.id_venta = v.id_venta
        ) dv
      ) as productos
    FROM ventas v
    LEFT JOIN usuarios u ON v.id_usuario_cliente = u.id_usuario
    ${whereFragment}
    ORDER BY v.fecha_venta DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return { total, page: parseInt(page, 10), limit: parseInt(limit, 10), items };
};
