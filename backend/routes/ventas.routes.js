import { Router } from "express";
import { listar, crear, anular } from "../controllers/ventas.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";

const router = Router();

router.get("/", authRequired, listar);
router.post("/", authRequired, crear);
router.put("/anular/:id", authRequired, adminRequired, anular);

export default router;
