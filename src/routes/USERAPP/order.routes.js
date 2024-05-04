import { Router } from "express";
import { 
    AllOrder,
    addOrder, 
    getOrder,
    softDeleteOrder,
    updateOrder
} from "../../controllers/userapp/v1/order.Controller.js"
import { auth } from "../../middlewares/auth.middlewares.js"
import { PLATFORM } from "../../constants.js";
const router = Router()

router.route("/create").post(auth(PLATFORM.USERAPP),addOrder)
router.route("/list").post(auth(PLATFORM.USERAPP),AllOrder)
router.route("/get/:id").get(auth(PLATFORM.USERAPP),getOrder)
router.route("/soft-delete/:id").delete(auth(PLATFORM.USERAPP),softDeleteOrder)
router.route("/update/:id").put(auth(PLATFORM.USERAPP),updateOrder)

export default router;