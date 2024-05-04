import { Router } from "express";
import { 
    addProduct,
    findAllProduct,
    getProduct,
    getProductCount
} from "../../controllers/userapp/v1/product.Controller.js";

const router = Router()

router.route("/list").post(findAllProduct)
router.route('/get/:id').get(getProduct)
router.route('/count').post(getProductCount)

export default router