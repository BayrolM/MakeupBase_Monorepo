import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  crearOrden,
  crearOrdenDirecta,
  obtenerOrdenes,
  obtenerDetalleOrden,
  actualizarEstado,
  cancelarOrden,
  confirmarPago,
  subirComprobante
} from "../controllers/orders.controller.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";
import { uploadComprobante } from '../middleware/upload.js'; 

const router = Router();

router.post("/", authRequired, crearOrden);
router.post("/admin", authRequired, adminRequired, crearOrdenDirecta);
router.get("/",  authRequired, obtenerOrdenes);
router.get("/:id", authRequired, obtenerDetalleOrden);
router.put("/:id/status", authRequired, adminRequired, actualizarEstado);
router.put("/:id/cancel", authRequired, adminRequired, cancelarOrden);
router.put("/:id/pago", authRequired, adminRequired, confirmarPago);
router.put('/:id/comprobante', uploadComprobante.single('comprobante'), subirComprobante);

export default router;
