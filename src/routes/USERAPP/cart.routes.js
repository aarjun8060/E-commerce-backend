import { Router } from "express";
import { PLATFORM } from "../../constants.js";
import { auth } from "../../middlewares/auth.middlewares.js";
import { 
    addCart,
    findAllCart, 
    getCart, 
    softDeleteCart,
    updateCart
} from "../../controllers/userapp/v1/cart.Controller.js";
const router = Router()

router.route("/create").post(auth(PLATFORM.USERAPP),addCart)
router.route("/list").post(auth(PLATFORM.USERAPP),findAllCart)
router.route("/get/:id").get(auth(PLATFORM.USERAPP),getCart)
router.route("/update/:id").put(auth(PLATFORM.USERAPP),updateCart)
router.route("/soft-delete/:id").delete(auth(PLATFORM.USERAPP),softDeleteCart)

export default router