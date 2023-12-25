import { Router } from "express";
import { register } from "../controllers/userapp/v1/auth.controller.js";
const router = Router()
router.route("/register").post(register)

export default router