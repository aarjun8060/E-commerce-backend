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
    asyncHandler 
} from "../../../utils/asyncHandler.js";
import { 
    validateFilterWithJoi, 
    validateParamsWithJoi 
} from "../../../utils/validateRequest.js";
import { 
    isValidObjectId 
} from "mongoose";
import { 
    Cart 
} from "../../../models/cart.model.js";
import { cartSchemaKeys, cartUpdateSchema, findFilterKeys } from "../../../utils/validation/cartValidation.js";

 /**
 * @description : create document of Cart in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Cart. {status, message, data}
 */
 const addCart = asyncHandler(async(req,res) => {
    try {
        let dataToCreate = {...req.body || [] }
        let validateRequest = validateParamsWithJoi(
            dataToCreate,
            cartSchemaKeys,
        )
        if(!validateRequest.isValid){
            return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        }

        dataToCreate.addedBy = req.user.id
        dataToCreate = new Cart(dataToCreate)

        let createdCart = await dbServiceCreate(Cart,dataToCreate)

        return res.success({ data : createdCart });
    } catch (error) {
        return res.internalServerError({ message:error.message });
    }
})

const insertBulkCart = asyncHandler(async(req,res) => {
    try {
        if(req.body && !Array.isArray(req.body.data)){
            return res.badRequest()
        }
        let dataToCreate = [ ...req.body.data ]

        for(let i=0;i <dataToCreate.length;i++){
            dataToCreate[i]  = {
                ...dataToCreate[i],
                addedBy:req.user.id
            }
        }

        let createdCarts = await dbServiceCreate(Cart,dataToCreate)

        createdCarts = { count: createdCarts ? createdCarts.length : 0 };
        return res.success({ data:{ count:createdCarts.count || 0 } });
    } catch (error) {
        return res.internalServerError({ message:error.message });
    }
})


/**
 * @description : find all documents of Cart from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Cart(s). {status, message, data}
 */
const findAllCart = asyncHandler(async(req,res) => {
    try {
       let options ={}
       let  query = {}

       let validateRequest = validateFilterWithJoi(
        req.body,
        findFilterKeys,
        Cart.schema.obj
      );

      if(!validateRequest.isValid){
        return res.validationError({ message: `${validateRequest.message}` });
      }

      if(typeof req.body.query === 'object' && req.body.query !== null){
        query = {...req.body.query}
      }

      if(req.body.isCountOnly){
        let totalRecords = await dbServiceCount(Cart,query)
        return res.success({ data: { totalRecords } });
      }
      if(typeof req.body.options === 'object' && req.body.options !== null){
        options = {...req.body.options}
      }
        query.userId = req.user.id;
        let foundCarts = await dbServicePaginate(Cart,query,options)
        if (!foundCarts || !foundCarts.data || !foundCarts.data.length){
            return res.recordNotFound(); 
        }
        return res.success({data:foundCarts})
    } catch (error) {
        return res.internalServerError({ message:error.message });
    }
})

/**
 * @description : find document of Cart from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Cart. {status, message, data}
 */
const getCart = asyncHandler(async(req,res)=>{
    try {
        let query={}
        if(!isValidObjectId(req.params.id)){
            return res.validationError({ message : 'invalid objectId.' });
        }
        query._id = req.params.id
        let options = {}

        let foundCart = await dbServiceFindOne(Cart,query,options)

        if(!foundCart){
            return res.recordNotFound();
        }

        return res.success({data:foundCart})

    } catch (error) {
        return res.internalServerError({ message:error.message });
    }
})

 /**
 * @description : deactivate document of Cart from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Cart.
 * @return {Object} : deactivated Cart. {status, message, data}
 */
const softDeleteCart = asyncHandler(async(req,res)=>{
    try {
        let query={}
        if(!isValidObjectId(req.params.id)){
            return res.validationError({ message : 'invalid objectId.' });
        }
        query._id = req.params.id;
        let updatedBody = {
            isDeleted:true,
            updatedBy:req.user.id
        }

        const isDeletedCart = await dbServiceUpdateOne(Cart,query,updatedBody)

        if(!isDeletedCart){
            return res.recordNotFound();
        }

        return res.success({ data:isDeletedCart});

    } catch (error) {
        return res.internalServerError({ message:error.message });
    }
})

  /**
 * @description : update document of Cart with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Cart.
 * @return {Object} : updated Cart. {status, message, data}
 */
const updateCart = asyncHandler(async(req,res) => {
    try {
        let dataToUpdate = {
            ...req.body,
            updatedBy:req.user.id
        }

        let validateRequest = validateParamsWithJoi(
            dataToUpdate,
            cartUpdateSchema
        )

        if(!validateRequest.isValid){
            return res.validationError({message: `Invalid values in parameters, ${validateRequest.message}`})
        }

        const query = {_id : req.params.id}

        let updatedCart = await dbServiceUpdateOne(Cart,query,dataToUpdate)
        if (!updatedCart){
            return res.recordNotFound();
        }
        return res.success({data:updatedCart}) 
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})

const getCartCount = asyncHandler(async (req,res) => {
    try {
        let where = {}
        let validateRequest = validateFilterWithJoi(
            req.body,
            findFilterKeys,
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }

        if(typeof req.body.where === 'object' && req.body.where !== null){
            where = { ...req.body.where}
        }

        let countCart = await dbServiceCount(Cart,where)
        console.log("countCart",countCart)
        return res.success({data:{count:countCart}})
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})

const deleteCart = asyncHandler(async(req,res) => {
    try {
        if(!req.params.id){
            return res.badRequest({ message : 'Insufficient request parameters! id is required.' })
        }

        if(!isValidObjectId(req.params.id)){
            return  res.validationError({message:"invalid objectId."})
        }
        let query = { _id : req.params.id}
        let deleteCart = await dbServiceDeleteOne(Cart,query)
        if(!deleteCart){
            return res.recordNotFound()
        }
        return res.success({data:deleteCart})
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})

const softDeleteBulkCart = asyncHandler(async (req,res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
        return res.badRequest();
        }

        const query = {_id : {$in :ids}};
        const updatedBody = {
            isDeleted:true,
            updatedBy:req.user.id
        }

        let softDeleteCart = await dbServiceUpdateMany(Cart,query,updatedBody)

        if (!softDeleteCart) {
            return res.recordNotFound();
        }
        
        return res.success({ data:{ count : softDeleteCart } });
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})

const deleteCartBulk = asyncHandler(async(req,res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
        return res.badRequest();
        }

        const query = {_id : {$in :ids}};
        let deletedCart = await dbServiceDeleteMany(Cart,query)

        if (!deletedCart){
            return res.recordNotFound();
        }

        return res.success({ data :{ count :deletedCart } });
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})

const updateBulkCart = asyncHandler(async (req,res) => {
    try {
        let filter = req.body && req.body.filter ? {...req.body.filter} : {}

        let dataToUpdate = {}
        delete dataToUpdate['addedBy'];
        if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
            dataToUpdate = { 
              ...req.body.data,
              updatedBy : req.user.id
            };
        }
        let updatedCart = await dbServiceUpdateMany(Cart,filter,dataToUpdate);
        if (!updatedCart){
        return res.recordNotFound();
        }
        return res.success({ data :{ count : updatedCart } });
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})
export {
    addCart,
    insertBulkCart,
    findAllCart,
    getCart,
    softDeleteCart,
    softDeleteBulkCart,
    deleteCart,
    deleteCartBulk,
    updateCart,
    updateBulkCart,
    getCartCount
}