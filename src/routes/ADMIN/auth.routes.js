import { Router } from "express";
import { login } from "../../controllers/admin/v1/auth.Controller.js";
import { adminLoginRateLimit } from "../../middlewares/rateLimit.middleware.js";

const router = Router();
router.post("/login", adminLoginRateLimit, login);

export default router;
