import { Router } from "express"
import { auth } from "../../middlewares/auth.middlewares.js"
import { PLATFORM } from "../../constants.js"
import { 
    AllOrder,
    addBulkOrder,
    addOrder,
    deleteBulkOrder,
    deleteOrder,
    getOrder,
    getOrderCount,
    softDeleteBulkOrder,
    softDeleteOrder,
    updateBulkOrder,
    updateOrder
} from "../../controllers/admin/v1/order.Controller.js"

const router = Router()

router.route("/create").post(auth(PLATFORM.ADMIN),addOrder)
router.route("/add-bulk").post(auth(PLATFORM.ADMIN),addBulkOrder)
router.route("/list").post(auth(PLATFORM.ADMIN),AllOrder)
router.route("/get/:id").get(auth(PLATFORM.ADMIN),getOrder)
router.route("/count").post(auth(PLATFORM.ADMIN),getOrderCount)
router.route("/update/:id").put(auth(PLATFORM.ADMIN),updateOrder)
router.route("/update-bulk").put(auth(PLATFORM.ADMIN),updateBulkOrder)
router.route("/soft-delete/:id").delete(auth(PLATFORM.ADMIN),softDeleteOrder)
router.route("/bulk-soft-delete").delete(auth(PLATFORM.ADMIN),softDeleteBulkOrder)
router.route("/delete/:id").delete(auth(PLATFORM.ADMIN),deleteOrder)
router.route("/bulk-delete").delete(auth(PLATFORM.ADMIN),deleteBulkOrder)

export default router;