import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  crearOrden,
  crearOrdenDirecta,
  obtenerOrdenes,
  obtenerDetalleOrden,
  actualizarPedido,
  actualizarEstado,
  cancelarOrden,
  confirmarPago,
  subirComprobante,
  cancelarOrdenPorCliente,
  actualizarDireccionPorCliente,
} from "../controllers/orders.controller.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";
import { uploadComprobante } from '../middleware/upload.js'; 

const router = Router();

router.post("/", authRequired, crearOrden);
router.post("/admin", authRequired, adminRequired, crearOrdenDirecta);
router.get("/",  authRequired, obtenerOrdenes);
router.get("/:id", authRequired, obtenerDetalleOrden);
router.put("/:id/status", authRequired, adminRequired, actualizarEstado);
router.put("/:id", authRequired, adminRequired, actualizarPedido);
router.put("/:id/cancel", authRequired, cancelarOrden); // cliente puede cancelar su propio pedido
router.put("/:id/cancel-client", authRequired, cancelarOrdenPorCliente);
router.put("/:id/direccion", authRequired, actualizarDireccionPorCliente);
router.put("/:id/pago", authRequired, adminRequired, confirmarPago);
router.put('/:id/comprobante', uploadComprobante.single('comprobante'), subirComprobante);

export default router;
