/**
 * commonFilterValidation.js
 * @description :: helper to validate filter.
 */

import joi from 'joi'

/** exports options which contains attributes of querying data. */
export const options = joi.object({
    pagination: joi.boolean(),
    collation: joi.alternatives().try(joi.string(), joi.object()).allow(null).allow(''),
    sort: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()).allow(null).allow(''),
    populate: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()).allow(null).allow(''),
    projection: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()).allow(null).allow(''),
    lean: joi.boolean(),
    leanWithId: joi.boolean(),
    page: joi.number().integer(),
    limit: joi.number(),
    useEstimatedCount: joi.boolean(),
    useCustomCountFn: joi.boolean(),
    forceCountFn: joi.boolean(),
    read: joi.any(),
    options: joi.any()
  }).unknown(true);

/** exports joi boolean attributes for count request */
export const isCountOnly = joi.boolean();

/** exports validation attributes for mongoose populate */
export const populate = joi.object({
    path: joi.string().allow(null).allow(''),
    select: joi.array()
  }).unknown(true);

/** exports projection attributes for mongoose document */
export const select = joi.alternatives().try(joi.array().items(),joi.string(),joi.object()).allow(null).allow('');