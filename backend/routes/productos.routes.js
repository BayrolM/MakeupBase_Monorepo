import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  featured,
} from "../controllers/productos.controller.js";

const router = Router();

router.get("/", listar); // Público
router.get("/featured", featured); // Público
router.get("/:id", obtener); // Público
router.post("/", authRequired, crear); // ✅ Protegido
router.put("/:id", authRequired, actualizar); // ✅ Protegido
router.delete("/:id", authRequired, eliminar); // ✅ Protegido

export default router;