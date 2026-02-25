import { Router } from "express";
import {
  getProfile,
  updateProfile,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  desactivarUsuario,
} from "../controllers/users.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

// Rutas de perfil del usuario autenticado
router.get("/profile", authRequired, getProfile);
router.put("/profile", authRequired, updateProfile);

// Rutas de administración de usuarios (requieren autenticación)
router.get("/", authRequired, listarUsuarios);
router.get("/:id", authRequired, obtenerUsuario);
router.put("/:id", authRequired, actualizarUsuario);
router.delete("/:id", authRequired, desactivarUsuario);

export default router;
