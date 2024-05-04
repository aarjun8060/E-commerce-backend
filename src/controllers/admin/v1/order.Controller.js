import { 
    asyncHandler 
} from "../../../utils/asyncHandler.js";
import { 
    validateFilterWithJoi, 
    validateParamsWithJoi 
} from "../../../utils/validateRequest.js";
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
    Order
} from "../../../models/order.model.js"
import { 
    OrderFindFilterKeys,
    orderSchemaKeys, 
    orderUpdateSchemaKeys
} from "../../../utils/validation/orderValidation.js";

/**
 * @description : create document of Order in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Order. {status, message, data}
 */ 
const addOrder = asyncHandler(async(req,res) => {
    try {
        let dataToCreate = {...req.body || []}

        let validateRequest = validateParamsWithJoi(
            dataToCreate,
            orderSchemaKeys
        )
        if(!validateRequest.isValid){
            return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        }

        dataToCreate.addedBy = req.user.id
        dataToCreate = new Order(dataToCreate)
        let createOrderData = await dbServiceCreate(Order,dataToCreate)

        if(!createOrderData){
            return res.internalServerError()
        }
        return res.success({ data : createOrderData });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
})

const addBulkOrder = asyncHandler(async(req,res) => {
    try {
        if(req.body && !Array.isArray(req.body.data)){
            return res.badRequest()
        }
        let dataToCreate = [...req.body.data]

        for(let i=0;i<dataToCreate.length;i++){
            dataToCreate[i] = {
                ...dataToCreate[i],
                addedBy:req.user.id
            }
        }

        let createdOrders = await dbServiceCreate(Order,dataToCreate);
        createdOrders = { count: createdOrders ? createdOrders.length : 0 };
        return res.success({ data:{ count:createdOrders.count || 0 } });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
})

/**
 * @description : find all documents of Order from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Order(s). {status, message, data}
 */
const AllOrder = asyncHandler(async(req,res) => {
    try {
        let options = {}
        let query = {}

        let validateRequest = validateFilterWithJoi(
            req.body,
            OrderFindFilterKeys,
            Order.schema.obj
        )

        if(!validateRequest.isValid){
            return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        }

        if(typeof req.body.query === 'object' && req.body.query !== null){
            query = { ...req.body.query };
        }
        if(req.body.isCountOnly){
            let totalRecords = await dbServiceCount(Order,query)
            return res.success({data:{totalRecords}})
        }

        if(typeof req.body.options === 'object' && req.body.options !== null){
            options = {...req.body.options}
        }

        query.userId = req.user.id
        let foundOrders = await dbServicePaginate(Order,query,options)
        if (!foundOrders || !foundOrders.data || !foundOrders.data.length){
            return res.recordNotFound(); 
        }

        return res.success({ data :foundOrders });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
})

/**
 * @description : find document of Order from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Order. {status, message, data}
 */
const getOrder = asyncHandler(async(req,res) => {
    try {
        let query = {}
        if(!isValidObjectId(req.params.id)){
            return res.validationError({ message : 'invalid objectId.' });
        }
        query._id = req.params.id 
        let options = {}
        let foundOrder = await dbServiceFindOne(Order,query,options)
        if(!foundOrder){
            return res.recordNotFound()
        }
        res.success({data:foundOrder})
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
})

/**
 * @description : deactivate document of Order from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Order.
 * @return {Object} : deactivated Order. {status, message, data}
 */
const softDeleteOrder = asyncHandler(async(req,res) => {
    try {
        if(!req.params.id){
            return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
        }
        if(!isValidObjectId(req.params.id)){
            return res.validationError({ message : 'invalid objectId.' });
        }
        let query = {
            _id : req.params.id
        }
        const updatedBody = {
            isDeleted:true,
            updatedBy:req.user.id
        }

        let softDeleteOrder = await dbServiceUpdateOne(Order,query,updatedBody)
        if (!softDeleteOrder){
            return res.recordNotFound();
        }
        return res.success({ data: softDeleteOrder });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
})

const softDeleteBulkOrder = asyncHandler(async(req,res) => {
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

        let softDeleteOrder = await dbServiceUpdateMany(Order,query,updatedBody)

        if (!softDeleteOrder) {
            return res.recordNotFound();
        }
        
        return res.success({ data:{ count : softDeleteOrder } });
    } catch (error) {
      return res.internalServerError({ message:error.message });  
    }
})

const deleteOrder = asyncHandler(async(req,res) => {
    try {
        if(!req.params.id){
            return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
        }
        if(!isValidObjectId(req.params.id)){
            return res.validationError({ message : 'invalid objectId.' });
        }
        let query = {
            _id : req.params.id
        }
        let deleteOrder = await dbServiceDeleteOne(Order,query)
        if (!deleteOrder){
            return res.recordNotFound();
        }
        return res.success({ data: deleteOrder });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
})


const deleteBulkOrder = asyncHandler(async(req,res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
        return res.badRequest();
        }

        const query = {_id : {$in :ids}};
         
        let deleteOrders = await dbServiceDeleteMany(Order,query)

        if (!deleteOrders) {
            return res.recordNotFound();
        }
        
        return res.success({ data:{ count : deleteOrders } });
    } catch (error) {
      return res.internalServerError({ message:error.message });  
    }
})

const updateOrder = asyncHandler(async(req,res) => {
    try {
        let dataToUpdate = {
            ...req.body,
            updatedBy:req.user.id
        }

        let validateRequest = validateParamsWithJoi(
            dataToUpdate,
            orderUpdateSchemaKeys
        )
        if(!validateRequest.isValid){
            return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        }

        const query = { _id:req.params.id };
        let updatedOrder = await dbServiceUpdateOne(Order,query,dataToUpdate);
        if (!updatedOrder){
            return res.recordNotFound();
        }
      return res.success({ data :updatedOrder });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
})

const getOrderCount = asyncHandler(async(req,res) => {
    try {
        let where = {}
        if((typeof(req.body.where) === 'object') && (req.body.where !== null)){
            where = { ...req.body.where }
        }
        let countOrder = await dbServiceCount(Order,where)

        if(!countOrder){
            return res.recordNotFound()
        }

        return res.success({data: {count:countOrder}})
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
})

const updateBulkOrder = asyncHandler(async (req,res) => {
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
        let updatedOrder = await dbServiceUpdateMany(Order,filter,dataToUpdate);
        if (!updatedOrder){
        return res.recordNotFound();
        }
        return res.success({ data :{ count : updatedOrder } });
    } catch (error) {
      return res.internalServerError({ message:error.message });  
    }
})

export {
    addOrder,
    addBulkOrder,
    AllOrder,
    getOrder,
    getOrderCount,
    updateOrder,
    updateBulkOrder,
    softDeleteOrder,
    deleteOrder,
    softDeleteBulkOrder,
    deleteBulkOrder
}
