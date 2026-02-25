import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  crearOrden,
  obtenerOrdenes,
  obtenerDetalleOrden
} from "../controllers/orders.controller.js";

const router = Router();

router.post("/", authRequired, crearOrden);
router.get("/", authRequired, obtenerOrdenes);
router.get("/:id", authRequired, obtenerDetalleOrden);

export default router;
