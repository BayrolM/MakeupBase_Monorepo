import { Router } from "express";
import { listar, obtener, crear, actualizar, eliminar } from "../controllers/categorias.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listar);
router.get("/:id", obtener);
router.post("/", authRequired, crear);
router.put("/:id", authRequired, actualizar);
router.delete("/:id", authRequired, eliminar);

export default router;
