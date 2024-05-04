import { Router } from "express"
import { 
    addCart, 
    deleteCart, 
    findAllCart,
    getCart,
    getCartCount,
    insertBulkCart,
    softDeleteBulkCart,
    softDeleteCart,
    updateBulkCart,
    updateCart
} from "../../controllers/admin/v1/cart.Controller.js"
import { auth } from "../../middlewares/auth.middlewares.js"
import { PLATFORM } from "../../constants.js"

const router = Router()

router.route("/create").post(auth(PLATFORM.ADMIN),addCart)
router.route("/bulk-cart").post(auth(PLATFORM.ADMIN),insertBulkCart)
router.route("/list").post(auth(PLATFORM.ADMIN),findAllCart)
router.route("/get/:id").get(auth(PLATFORM.ADMIN),getCart)
router.route("/update/:id").put(auth(PLATFORM.ADMIN),updateCart)
router.route("/update-bulk").put(auth(PLATFORM.ADMIN),updateBulkCart)
router.route("/count").post(auth(PLATFORM.ADMIN),getCartCount)
router.route("/soft-delete/:id").delete(auth(PLATFORM.ADMIN),softDeleteCart)
router.route("/soft-delete-many").delete(auth(PLATFORM.ADMIN),softDeleteBulkCart)
router.route("/delete/:id").delete(auth(PLATFORM.ADMIN),deleteCart)
router.route("/bulk-delete").delete(auth(PLATFORM.ADMIN),)

export default router;