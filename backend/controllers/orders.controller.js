import * as ordersService from "../services/orders.service.js";

// Controlador para crear una nueva orden
export const crearOrden = async (req, res) => {
  try {
    const { direccion, ciudad, metodo_pago, items } = req.body;
    if (
      !direccion ||
      !ciudad ||
      !metodo_pago ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Faltan datos requeridos para la orden (dirección, ciudad, método de pago e items).",
      });
    }
    const orden = await ordersService.crearOrden(req.user.id_usuario, {
      direccion,
      ciudad,
      metodo_pago,
      items, // Se pasan los items al servicio
    });
    return res.status(201).json({
      ok: true,
      message: "Orden creada exitosamente",
      data: orden,
    });
  } catch (error) {
    console.error(error);
    if (error.message.includes("carrito") || error.message.includes("Stock")) {
      return res.status(400).json({ ok: false, message: error.message });
    }
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// Controlador para obtener todas las órdenes de un usuario
export const obtenerOrdenes = async (req, res) => {
  try {
    const { id_usuario, rol } = req.user; // Extraer rol del JWT
    const { estado } = req.query;

    console.log(`📦 Usuario ${id_usuario} (rol: ${rol}) solicitando órdenes`);

    // Pasar tanto el id_usuario como el rol al servicio
    // El servicio ahora puede recibir un estado para filtrar
    const ordenes = await ordersService.obtenerOrdenes(id_usuario, rol, estado);

    console.log(`✅ Devolviendo ${ordenes.length} órdenes`);

    return res.json({ ok: true, data: ordenes });
  } catch (error) {
    console.error("❌ Error en obtener Ordenes:", error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// Controlador para obtener el detalle de una orden específica
export const obtenerDetalleOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario, rol } = req.user;

    const orden = await ordersService.obtenerDetalleOrden(
      id_usuario,
      parseInt(id, 10),
      rol
    );

    return res.json({ ok: true, data: orden });
  } catch (error) {
    console.error(error);
    if (error.message === "Orden no encontrada") {
      return res.status(404).json({ ok: false, message: error.message });
    }
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};
