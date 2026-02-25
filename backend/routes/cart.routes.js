import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  obtenerCarrito,
  agregarItem,
  actualizarItem,
  eliminarItem
} from "../controllers/cart.controller.js";

const router = Router();

// Todas las rutas del carrito requieren autenticación
router.get("/", authRequired, obtenerCarrito);
router.post("/items", authRequired, agregarItem);
router.put("/items/:id", authRequired, actualizarItem);
router.delete("/items/:id", authRequired, eliminarItem);

export default router;
