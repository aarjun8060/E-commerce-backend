import Joi from "joi";

const fields = {
  title: Joi.string().trim().min(2).max(200),
  category: Joi.string().valid("News", "Event", "Achievement"),
  date: Joi.date().iso(),
  shortDescription: Joi.string().trim().min(1).max(500),
  content: Joi.string().trim().min(1).max(50000),
  published: Joi.boolean(),
};

const createSchema = Joi.object({
  ...fields,
  title: fields.title.required(),
  category: fields.category.required(),
  date: fields.date.required(),
  shortDescription: fields.shortDescription.required(),
  content: fields.content.required(),
  published: fields.published.default(false),
}).unknown(false);

const updateSchema = Joi.object(fields).min(1).unknown(false);

export const validateAdminNewsEvent = (payload, isUpdate = false) => {
  const schema = isUpdate ? updateSchema : createSchema;
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    convert: true,
  });

  if (!error) return { value };

  const errors = {};
  for (const detail of error.details) {
    errors[detail.path[0] || "request"] = detail.message.replaceAll('"', "");
  }
  return { errors };
};
