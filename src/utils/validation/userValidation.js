/**
 * userValidation.js
 * @description :: validate each post and put request as per user model
 */

import joi from "joi";

export const schemaKeys = joi.object({
    password: joi.string().allow(null).allow(''),
    email: joi.string().email({ tlds: { allow: false } }),
    phone: joi.number().integer().allow(0),
    userType: joi.number().allow(0),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
}).unknown(true);