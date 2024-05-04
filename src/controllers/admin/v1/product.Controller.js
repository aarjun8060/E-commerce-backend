/**
 * ProductController.js
 * @description : exports action methods for Product.
 */
import { 
    asyncHandler 
} from "../../../utils/asyncHandler.js";
import { 
    validateFilterWithJoi, 
    validateParamsWithJoi 
} from "../../../utils/validateRequest.js";
import { 
    findFilterKeys,
    productSchemaKeys,
    productUpdateSchemaKeys 
} from "../../../utils/validation/productValidation.js";
import { 
    dbServiceCount,
    dbServiceCreate, 
    dbServiceDeleteMany, 
    dbServiceDeleteOne, 
    dbServiceFindOne,
    dbServicePaginate,
    dbServiceUpdateMany,
    dbServiceUpdateOne
} from "../../../db/dbServices.js";
import { 
    isValidObjectId 
} from "mongoose";
import { 
    Product 
} from "../../../models/product.model.js";


const addProduct = asyncHandler(async (req,res) => {
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
        if(!createdProduct){
            return res.internalServerError()
        }
        return res.success({ data : createdProduct });
    } catch (error) {
        console.log("error in product",error)
        return res.internalServerError({ message:error.message }); 
    }
})

const addBulkProduct = asyncHandler(async (req,res) => {
    try {
        if(req.body && (!Array.isArray(req.body.data))){
            return res.badRequest();
        }
        let dataToCreate = [ ...req.body.data ];
        for(let i=0; i<dataToCreate.length;i++){
            dataToCreate[i] = {
                ...dataToCreate[i],
                addedBy: req.user.id
            }
        }

        let createdProducts = await dbServiceCreate(Product,dataToCreate);
        if(!createdProducts){
            return res.internalServerError()
        }
        createdProducts = { count: createdProducts ? createdProducts.length: 0};
        return res.success({data : { count: createdProducts.count || 0}})
    } catch (error) {
        return res.internalServerError({message:error.message})
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

const softDeleteProduct = asyncHandler(async (req,res) => {
    try {
        let query = {}
        if(!req.params.id && isValidObjectId(req.params.id)){
            return res.validationError({ message : 'invalid objectId.' });
        }

        query._id = req.params.id
    
        let updatedBody = {
            isDeleted: true,
            updatedBy: req.user.id,
        }

        let updatedProduct = await dbServiceUpdateOne(Product,query,updatedBody)

        if(!updatedProduct){
            return res.recordNotFound()
        }

        return res.success({data:updatedProduct})
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})

const softDeleteProductMany = asyncHandler(async (req,res) => {
    try {
        let ids = req.body.ids;
        if(!ids && !Array.isArray(ids)){
            return res.badRequest()
        }
        const query = {_id: {$in:ids}};
        console.log("query",query)

        const updatedBody = {
            isDeleted:true,
            addedBy:req.user.id
        }

        let updatedProduct = await dbServiceUpdateMany(Product,query,updatedBody);

        if (!updatedProduct) {
            return res.recordNotFound();
        }
        return res.success({ data:{ count :updatedProduct } });
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})


const deleteProduct = asyncHandler( async(req,res) => {
    try {
        if (!req.params.id){
            return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
        }

        if(!req.params.id && isValidObjectId(req.params.id)){
            return res.validationError({ message : 'invalid objectId.' });
        }

      const query = { _id:req.params.id };
      console.log("query",query)

      const deletedProduct = await dbServiceDeleteOne(Product,query)
      
      console.log("deletedProduct",deletedProduct)
      if(!deletedProduct){
        return res.recordNotFound();
      }
      return res.success({ data:deletedProduct });
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})

const deleteProductMany = asyncHandler(async (req,res) => {
    try {
        let ids = req.body.ids;
        if(!ids && !Array.isArray(ids)){
            return res.badRequest()
        }
        const query = {_id: {$in:ids}};
        console.log("query",query)

        let updatedProduct = await dbServiceDeleteMany(Product,query);

        if (!updatedProduct) {
            return res.recordNotFound();
        }
        return res.success({ data:{ count :updatedProduct } });
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})

const updateProduct = asyncHandler(async(req,res) => {
    try {
        let dataToUpdate = {
            ...req.body,
            updatedBy:req.user.id,
        };

        let validateRequest = validateParamsWithJoi(
            dataToUpdate,
            productUpdateSchemaKeys
        )

        if(!validateRequest.isValid){
            return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        }

        const query = {_id:req.params.id}

        const updateProduct = await dbServiceUpdateOne(Product,query,dataToUpdate)

        if(!updateProduct){
            return res.recordNotFound()
        }

        return res.success({data:updateProduct})
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})

const updateManyProduct = asyncHandler(async(req,res) => {
    try {
        let filter = req.body && req.body.filter ? {...req.body.filter} : {};
        let dataToUpdate = {}
        delete dataToUpdate['addedBy'];
        if(req.body && typeof req.body.data === 'object' && req.body.data !== null){
            dataToUpdate = {
                ...req.body.data,
                updatedBy:req.user.id
            }
        }

        let updatedManyProduct = await dbServiceUpdateMany(Product,filter,dataToUpdate)
        if(!updateManyProduct){
            return res.recordNotFound()
        }
        return res.success({data:updatedManyProduct})
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})
export {
    addProduct,
    addBulkProduct,
    findAllProduct,
    getProduct,
    getProductCount,
    softDeleteProduct,
    softDeleteProductMany,
    deleteProduct,
    deleteProductMany,
    updateProduct,
    updateManyProduct
}