import { Router } from "express";
import { listar, obtener, crear, cambiarEstado, anular } from "../controllers/devoluciones.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";

const router = Router();

router.get("/", adminRequired, authRequired, listar);
router.get("/:id", adminRequired, authRequired, obtener);
router.post("/", adminRequired, authRequired, crear);
router.put("/:id/estado", adminRequired, authRequired, cambiarEstado);
router.put("/:id/anular", adminRequired, authRequired, anular);

export default router;
