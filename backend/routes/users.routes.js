import { Router } from "express";
import {
  getProfile,
  updateProfile,
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  changePassword,
} from "../controllers/users.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";

const router = Router();

// Rutas de perfil del usuario autenticado
router.get("/profile", authRequired, getProfile);
router.put("/profile", authRequired, updateProfile);
router.put("/profile/password", authRequired, changePassword);

// Rutas de administración de usuarios (requieren ser admin)
router.get("/", authRequired, adminRequired, listarUsuarios);
router.post("/", authRequired, adminRequired, crearUsuario);
router.get("/:id", authRequired, adminRequired, obtenerUsuario);
router.put("/:id", authRequired, adminRequired, actualizarUsuario);
router.delete("/:id", authRequired, adminRequired, desactivarUsuario);

export default router;
