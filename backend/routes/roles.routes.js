import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  listarRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
} from "../controllers/roles.controller.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";

const router = Router();


router.get("/", adminRequired,authRequired, listarRoles);
router.get("/:id", adminRequired, authRequired, obtenerRol);
router.post("/", adminRequired, authRequired, crearRol);
router.put("/:id", adminRequired, authRequired, actualizarRol);

export default router;
