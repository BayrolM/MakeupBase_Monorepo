import { Router } from "express";
import { listar, obtener, crear } from "../controllers/compras.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authRequired, listar);
router.get("/:id", authRequired, obtener);
router.post("/", authRequired, crear);

export default router;
