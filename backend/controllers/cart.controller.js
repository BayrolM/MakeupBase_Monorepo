import * as cartService from "../services/cart.service.js";

export const obtenerCarrito = async (req, res) => {
  try {
    const carrito = await cartService.obtenerCarrito(req.user.id_usuario);
    return res.json({ ok: true, data: carrito });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

export const agregarItem = async (req, res) => {
  try {
    const { id_producto, cantidad } = req.body;

    if (!id_producto || !cantidad || cantidad <= 0) {
      return res.status(400).json({
        ok: false,
        message: "id_producto y cantidad son requeridos",
      });
    }

    const carrito = await cartService.agregarAlCarrito(
      req.user.id_usuario,
      id_producto,
      cantidad
    );

    return res.json({ ok: true, data: carrito });
  } catch (error) {
    console.error(error);
    if (
      error.message === "Producto no encontrado" ||
      error.message === "Stock insuficiente"
    ) {
      return res.status(400).json({ ok: false, message: error.message });
    }
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

export const actualizarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({
        ok: false,
        message: "La cantidad debe ser mayor a 0",
      });
    }

    const carrito = await cartService.actualizarItemCarrito(
      req.user.id_usuario,
      parseInt(id, 10),
      cantidad
    );

    return res.json({ ok: true, data: carrito });
  } catch (error) {
    console.error(error);
    if (
      error.message.includes("no encontrado") ||
      error.message === "Stock insuficiente"
    ) {
      return res.status(400).json({ ok: false, message: error.message });
    }
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

export const eliminarItem = async (req, res) => {
  try {
    const { id } = req.params;

    const carrito = await cartService.eliminarItemCarrito(
      req.user.id_usuario,
      parseInt(id, 10)
    );

    return res.json({ ok: true, data: carrito });
  } catch (error) {
    console.error(error);
    if (error.message.includes("no encontrado")) {
      return res.status(404).json({ ok: false, message: error.message });
    }
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};
