import * as ordersService from "../services/orders.service.js";

// Controlador para que el cliente cancele su propio pedido
export const cancelarOrdenPorCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;
    const orden = await ordersService.cancelarOrdenCliente(parseInt(id, 10), id_usuario);
    return res.json({ ok: true, message: "Pedido cancelado correctamente", data: orden });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ ok: false, message: error.message || "Error al cancelar el pedido" });
  }
};

// Controlador para que el cliente cambie la dirección de su pedido
export const actualizarDireccionPorCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { direccion } = req.body;
    const id_usuario = req.user.id_usuario;
    if (!direccion?.trim()) return res.status(400).json({ ok: false, message: "La dirección es obligatoria" });
    const orden = await ordersService.actualizarDireccionCliente(parseInt(id, 10), id_usuario, direccion.trim());
    return res.json({ ok: true, message: "Dirección actualizada correctamente", data: orden });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ ok: false, message: error.message || "Error al actualizar la dirección" });
  }
};

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
      items, 
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

// Controlador para que un administrador cree una orden de forma directa
export const crearOrdenDirecta = async (req, res) => {
  try {
    // Verificar que sea admin, bodeguero o vendedor (idealmente)
    // Para simplificar, confiaremos en auth middleware, pero podemos validar req.user.rol
    if (req.user.rol === 2) {
      return res.status(403).json({ ok: false, message: "No autorizado para crear órdenes directas" });
    }

    const { id_cliente, direccion, ciudad, metodo_pago, items } = req.body;
    
    if (!id_cliente || !items || items.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos requeridos (id_cliente, items).",
      });
    }

    const orden = await ordersService.crearOrdenDirecta(id_cliente, req.user.id_usuario, {
      direccion: direccion || 'N/A',
      ciudad: ciudad || 'N/A',
      metodo_pago: metodo_pago || 'efectivo',
      items,
    });

    return res.status(201).json({
      ok: true,
      message: "Orden creada exitosamente",
      data: orden,
    });
  } catch (error) {
    console.error("❌ ERROR CREATING DIRECT ORDER:", error);
    if (error.message.includes("Stock") || error.message.includes("no encontrado")) {
      return res.status(400).json({ ok: false, message: error.message });
    }
    // Return specific error if it's a DB constraint to help debug
    const errorMessage = error.detail || error.message || "Error en el servidor";
    return res.status(500).json({ ok: false, message: errorMessage });
  }
};

// Controlador para obtener todas las órdenes de un usuario
export const obtenerOrdenes = async (req, res) => {
  try {
    const { id_usuario, rol } = req.user;
    const { estado, q, page = 1, limit = 10 } = req.query;

    console.log(`📦 Usuario ${id_usuario} (rol: ${rol}) solicitando órdenes`);

    const result = await ordersService.obtenerOrdenes(id_usuario, rol, { 
        estado, 
        q, 
        page: parseInt(page, 10), 
        limit: parseInt(limit, 10) 
    });

    return res.json({ ok: true, ...result });
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

// Controlador para actualizar datos de un pedido (dirección, cliente, productos)
export const actualizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { direccion, id_cliente, items } = req.body;

    const orden = await ordersService.actualizarPedido(parseInt(id, 10), { direccion, id_cliente, items });

    return res.json({ ok: true, message: "Pedido actualizado exitosamente", data: orden });
  } catch (error) {
    console.error(error);
    if (error.message.includes("no encontrado") || error.message.includes("Solo se puede")) {
      return res.status(400).json({ ok: false, message: error.message });
    }
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// Controlador para actualizar el estado de una orden
export const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, motivo, shippingData } = req.body;

    if (!estado) {
      return res.status(400).json({ ok: false, message: "El estado es requerido" });
    }

    const orden = await ordersService.actualizarEstadoPedido(parseInt(id, 10), estado, motivo, shippingData);

    return res.json({ ok: true, message: "Estado actualizado exitosamente", data: orden });
  } catch (error) {
    console.error(error);
    if (error.message === "Pedido no encontrado") {
      return res.status(404).json({ ok: false, message: error.message });
    }
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// Controlador para cancelar una orden y devolver stock
export const cancelarOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo) {
      return res.status(400).json({ ok: false, message: "El motivo de cancelación es requerido" });
    }

    const orden = await ordersService.cancelarOrden(parseInt(id, 10), motivo);

    return res.json({ ok: true, message: "Orden cancelada exitosamente", data: orden });
  } catch (error) {
    console.error(error);
    if (error.message === "Pedido no encontrado" || error.message === "Solo se pueden cancelar pedidos pendientes") {
      return res.status(400).json({ ok: false, message: error.message });
    }
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

export const confirmarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { pago_confirmado } = req.body;

    const orden = await ordersService.confirmarPago(parseInt(id, 10), pago_confirmado);

    return res.json({ 
      ok: true, 
      message: pago_confirmado ? "Pago confirmado exitosamente" : "Confirmación de pago removida", 
      data: orden 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

export const subirComprobante = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No se subió ninguna imagen' });
    }

    const comprobanteUrl = `/uploads/comprobantes/${req.file.filename}`;
    const orden = await ordersService.actualizarComprobante(parseInt(id, 10), comprobanteUrl);

    return res.json({ 
      ok: true, 
      message: 'Comprobante subido exitosamente', 
      data: orden 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: 'Error al subir comprobante' });
  }
};
