import { Router } from "express";
import { 
    addBulkProduct,
    addProduct,
    deleteProduct,
    deleteProductMany,
    findAllProduct, 
    getProduct, 
    getProductCount, 
    softDeleteProduct,
    softDeleteProductMany,
    updateManyProduct,
    updateProduct
} from "../../controllers/admin/v1/product.Controller.js";
import { auth } from "../../middlewares/auth.middlewares.js"
import { PLATFORM } from "../../constants.js";

const router = Router()

router.route("/create").post(auth(PLATFORM.ADMIN),addProduct)
router.route("/add-bulk").post(auth(PLATFORM.ADMIN),addBulkProduct)
router.route("/list").post(findAllProduct)
router.route('/get/:id').get(getProduct)
router.route('/count').post(getProductCount)
router.route("/soft-delete/:id").delete(auth(PLATFORM.ADMIN),softDeleteProduct)
router.route("/soft-delete-many").delete(auth(PLATFORM.ADMIN),softDeleteProductMany)

router.route("/delete/:id").delete(auth(PLATFORM.ADMIN),deleteProduct)
router.route("/delete-many").delete(auth(PLATFORM.ADMIN),deleteProductMany)
router.route("/update/:id").put(auth(PLATFORM.ADMIN),updateProduct)
router.route("/update-many").put(auth(PLATFORM.ADMIN),updateManyProduct)

export default router