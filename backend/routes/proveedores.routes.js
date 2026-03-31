import { Router } from "express";
import { listar, obtener, crear, actualizar, eliminar } from "../controllers/proveedores.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";

const router = Router();

router.get("/", listar);
router.get("/:id", obtener);
router.post("/", authRequired, adminRequired, crear);
router.put("/:id", authRequired, adminRequired, actualizar);
router.delete("/:id", authRequired, adminRequired, eliminar);

export default router;
