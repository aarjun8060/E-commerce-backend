import joi from "joi";
import { 
    isCountOnly, 
    options, 
    populate, 
    select 
} from "./commonFilterValidation.js";


export const orderSchemaKeys = joi.object({
    userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(''),
    cartId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(''),
    paymentId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(''),
    packageId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(''),
    status: joi.string().allow(null).allow(''),
    paymentStatus: joi.string().allow(null).allow(''),
    isDeleted: joi.boolean(),
    isActive: joi.boolean()
}).unknown(true)


let keys = ['query', 'where'];
/** validation keys and properties of addon for filter documents from collection */
export const OrderFindFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      userId: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object()),
      cartId: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object()),
      paymentId: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object()),
      packageId: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object()),
      status: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      paymentStatus: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      isActive: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
    
}).unknown(true);

/** validation keys and properties of addon for updation */
export const orderUpdateSchemaKeys = joi.object({
    userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(''),
    cartId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(''),
    paymentId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(''),
    packageId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(''),
    status: joi.string().allow(null).allow(''),
    paymentStatus: joi.string().allow(null).allow(''),
    isDeleted: joi.boolean(),
    isActive: joi.boolean(),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
  }).unknown(true);