import Joi from "joi";

export const enquiryAdminQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    status: Joi.string().valid("New", "Contacted", "Closed").optional(),
}).unknown(false);

export const enquiryStatusSchema = Joi.object({
    status: Joi.string().valid("New", "Contacted", "Closed").required(),
}).unknown(false);