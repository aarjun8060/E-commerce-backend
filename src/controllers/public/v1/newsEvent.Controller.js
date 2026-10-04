import Joi from "joi";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { NewsEvent } from "../../../models/newsEvent.model.js";

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  category: Joi.string().valid("News", "Event", "Achievement"),
}).unknown(false);

export const listNewsEvents = asyncHandler(async (req, res) => {
  const { error, value } = querySchema.validate(req.query, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: { query: "Invalid pagination or category" },
    });
  }

  const filter = { published: true };
  if (value.category) filter.category = value.category;

  const [data, total] = await Promise.all([
    NewsEvent.find(filter)
      .select("-content")
      .sort({ date: -1, createdAt: -1 })
      .skip((value.page - 1) * value.limit)
      .limit(value.limit),
    NewsEvent.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data,
    pagination: {
      page: value.page,
      limit: value.limit,
      total,
      totalPages: Math.ceil(total / value.limit),
    },
  });
});

export const getNewsEventBySlug = asyncHandler(async (req, res) => {
  const slug = String(req.params.slug || "").trim();
  if (!slug) {
    return res.status(400).json({ success: false, message: "Invalid slug" });
  }

  const data = await NewsEvent.findOne({ slug, published: true });
  if (!data) {
    return res.status(404).json({ success: false, message: "News/Event not found" });
  }

  return res.json({ success: true, data });
});
