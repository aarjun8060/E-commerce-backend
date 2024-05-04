import joi from "joi";
import { 
    isCountOnly, 
    options, 
    populate, 
    select 
} from "./commonFilterValidation.js";


export const cartSchemaKeys = joi.object({
    isDeleted : joi.boolean(),
    isActive:joi.boolean()
}).unknown(true)

export const cartUpdateSchema = joi.object({
    isDeleted : joi.boolean(),
    isActive:joi.boolean(),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true)

let keys = ['query', 'where'];
/** validation keys and properties of addon for filter documents from collection */
export const findFilterKeys = joi.object({
    options: options,
    ...Object.fromEntries(
        keys.map((key) => [key,joi.object({
            isDeleted: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
            isActive: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
            id: joi.any(),
            _id: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object())
        }).unknown(true)]),
    ),
    isCountOnly: isCountOnly,
    populate: joi.array().items(populate),
    select: select
}).unknown(true)