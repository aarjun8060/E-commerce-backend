import { dbServiceCount, dbServiceCreate, dbServiceFindOne, dbServicePaginate, dbServiceUpdateOne } from "../../../db/dbServices";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { validateFilterWithJoi, validateParamsWithJoi } from "../../../utils/validateRequest.js";
import { OrderFindFilterKeys, orderSchemaKeys, orderUpdateSchemaKeys } from "../../../utils/validation/orderValidation.js";
import { Order } from "../../../models/order.model.js"
import { isValidObjectId } from "mongoose";
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
        let createOrderData = dbServiceCreate(Order,dataToCreate)
        if(!createOrderData){
            return res.internalServerError()
        }
        return res.success({ data : createdOrder });
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

export {
    addOrder,
    AllOrder,
    getOrder,
    softDeleteOrder,
    updateOrder
}
