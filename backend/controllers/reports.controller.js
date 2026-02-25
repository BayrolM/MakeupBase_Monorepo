import * as reportsService from "../services/reports.service.js";

// Controlador para obtener el dashboard
export const obtenerDashboard = async (req, res) => {
  try {
    const dashboard = await reportsService.obtenerDashboard();
    return res.json({ ok: true, data: dashboard });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// Controlador para obtener el reporte de ventas
export const obtenerReporteVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, id_usuario, limit } = req.query;

    const reporte = await reportsService.obtenerReporteVentas({
      fecha_inicio,
      fecha_fin,
      id_usuario: id_usuario ? parseInt(id_usuario, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : 50,
    });

    return res.json({ ok: true, data: reporte });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// Controlador para obtener el reporte de stock
export const obtenerReporteStock = async (req, res) => {
  try {
    const reporte = await reportsService.obtenerReporteStock();
    return res.json({ ok: true, data: reporte });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// Controlador para obtener el reporte de usuarios
export const obtenerReporteUsuarios = async (req, res) => {
  try {
    const reporte = await reportsService.obtenerReporteUsuarios();
    return res.json({ ok: true, data: reporte });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// Controlador para obtener el detalle de una venta
export const obtenerDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await reportsService.obtenerDetalleVenta(id);

    if (!venta) {
      return res.status(404).json({
        ok: false,
        message: "Venta no encontrada",
      });
    }

    return res.json({ ok: true, data: venta });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};
