/**
 * ProductController.js
 * @description : exports action methods for Product.
 */

import { Product } from "../../../models/product.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";
import { 
    validateFilterWithJoi, 
    validateParamsWithJoi 
} from "../../../utils/validateRequest.js";
import { findFilterKeys, productSchemaKeys } from "../../../utils/validation/productValidation.js";
import { 
    dbServiceCount,
    dbServiceCreate, 
    dbServiceFindOne, 
    dbServicePaginate, 
    dbServiceUpdateOne 
} from "../../../db/dbServices.js";


/**
 * @description : create document of Product in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Product. {status, message, data}
 */ 

const addProduct = asyncHandler(async () => {
    try {
        let dataToCreate = {...req.body || {}}
        let validateRequest = validateParamsWithJoi(
            dataToCreate,
            productSchemaKeys
        )

        if(!validateRequest.isValid){
            return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        }

        dataToCreate.addedBy = req.user.id
        dataToCreate = new Product(dataToCreate)

        let createdProduct = await dbServiceCreate(Product,dataToCreate)

        return res.success({ data : createdProduct });
    } catch (error) {
        console.log("error in product",error)
        return res.internalServerError({ message:error.message }); 
    }
})


/**
 * @description : find all documents of Product from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Product(s). {status, message, data}
 */

const findAllProduct = asyncHandler(async(req,res) => {
    try {
        let options = {};
        let query = {};

        let validateRequest = validateFilterWithJoi(
            req.body,
            findFilterKeys,
            Product.schema.obj
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (req.body.isCountOnly){
            let totalRecords = await dbServiceCount(Product, query);
            return res.success({ data: { totalRecords } });
        }

        if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
            options = { ...req.body.options };
        }

        let foundProducts = await dbServicePaginate(Product,query,options);
        if (!foundProducts || !foundProducts.data || !foundProducts.data.length){
            return res.recordNotFound(); 
        }
        return res.success({ data :foundProducts });
    } catch (error) {
      return res.internalServerError({ message:error.message });
    }
})

/**
 * @description : find document of Product from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Product. {status, message, data}
 */
const getProduct = asyncHandler(async(req,res) => {
    try {
        let query = {};
        if(!isValidObjectId(req.params.id)){
            return res.validationError({ message : 'invalid objectId.' });
        }
        query._id = req.params.id
        let options ={}
        let foundProduct = await dbServiceFindOne(Product,query,options)

        if(!foundProduct){
            return res.recordNotFound();
        }

        return res.success({ data :foundProduct });
    } catch (error) {
      return res.internalServerError({ message:error.message });
    }
})

const getProductCount = asyncHandler(async(req,res)=> {
    try {
        let options = {};
        let query = {};
        let where = {};

        let validateRequest = validateFilterWithJoi(
            req.body,
            findFilterKeys,
            Product.schema.obj
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }

        if (req.body && typeof req.body.where === 'object' && req.body.where !== null) {
            where = { ...req.body.where };
        }
        let foundProducts = await dbServiceCount(Product,where);
        if (!foundProducts){
            return res.recordNotFound(); 
        }
        return res.success({ data : { count: foundProducts} });
    } catch (error) {
      return res.internalServerError({ message:error.message });
    }
})
export {
    addProduct,
    findAllProduct,
    getProduct,
    getProductCount
}