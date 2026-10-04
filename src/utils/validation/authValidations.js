

import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: Joi.string().min(1).max(128).required(),
}).unknown(false);


