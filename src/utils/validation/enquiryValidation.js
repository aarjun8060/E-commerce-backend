import Joi from "joi";
import { ENQUIRY_CLASS_OPTIONS } from "../../constants.js";

export const enquirySchema = Joi.object({
    parentName: Joi.string().trim().min(2).max(100).required(),
    studentName: Joi.string().trim().min(2).max(100).required(),
    classApplying: Joi.string().trim().valid(...ENQUIRY_CLASS_OPTIONS).required(),
    mobile: Joi.string().trim().pattern(/^[6-9]\d{9}$/).required(),
    email: Joi.string().trim().lowercase().email().allow(""),
    message: Joi.string().trim().max(1000).allow(""),
}).unknown(false);

const validationMessages = {
    parentName: {
        "any.required": "Parent name is required",
        "string.empty": "Parent name is required",
        "string.min": "Parent name must be at least 2 characters",
        "string.max": "Parent name must be at most 100 characters",
    },
    studentName: {
        "any.required": "Student name is required",
        "string.empty": "Student name is required",
        "string.min": "Student name must be at least 2 characters",
        "string.max": "Student name must be at most 100 characters",
    },
    classApplying: {
        "any.required": "Class applying is required",
        "string.empty": "Class applying is required",
        "any.only": "Select a valid class",
    },
    mobile: {
        "any.required": "Mobile number is required",
        "string.empty": "Mobile number is required",
        "string.pattern.base": "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9",
    },
    email: {
        "string.email": "Enter a valid email address",
    },
    message: {
        "string.max": "Message must be at most 1000 characters",
    },
};

export const validateEnquiry = (payload) => {
    const body = payload && typeof payload === "object" && !Array.isArray(payload)
        ? payload
        : {};
    const { error, value } = enquirySchema.validate(body, {
        abortEarly: false,
        convert: true,
        stripUnknown: { objects: true },
    });

    if (!error) {
        return { value };
    }

    const errors = {};
    for (const detail of error.details) {
        const field = detail.path[0];
        if (typeof field === "string" && !errors[field]) {
            errors[field] = validationMessages[field]?.[detail.type] ?? "Invalid value";
        }
    }

    return { errors };
};