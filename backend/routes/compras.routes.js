import { Router } from "express";
import { listar, obtener, crear } from "../controllers/compras.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";

const router = Router();

router.get("/", adminRequired,authRequired, listar);
router.get("/:id", adminRequired, authRequired, obtener);
router.post("/", adminRequired, authRequired, crear);

export default router;
