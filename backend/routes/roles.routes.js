import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  listarRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
} from "../controllers/roles.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.get("/", authRequired, listarRoles);
router.get("/:id", authRequired, obtenerRol);
router.post("/", authRequired, crearRol);
router.put("/:id", authRequired, actualizarRol);

export default router;
