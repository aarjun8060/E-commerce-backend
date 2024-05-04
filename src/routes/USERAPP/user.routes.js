import { Router } from "express";
import { 
    getUser, 
    login, 
    register, 
    resetPassword, 
    sentResetPasswordOTP, 
    softDelete, 
    updateUser,
    validateEmail
} from "../../controllers/userapp/v1/auth.Controller.js";

const router = Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/get/:id").get(getUser)
router.route("/soft-delete/:id").delete(softDelete)
router.route("/update/:id").put(updateUser)
router.route("/reset-password-otp").post(sentResetPasswordOTP)
router.route("/validate-otp").post(validateEmail)
router.route("/reset-password").put(resetPassword)

export default router