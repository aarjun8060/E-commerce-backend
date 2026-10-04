import { isValidObjectId } from "mongoose";
import Joi from "joi";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { NewsEvent } from "../../../models/newsEvent.model.js";
import {
  saveNewsEventImage,
  removeNewsEventImage,
} from "../../../services/newsEventImage.services.js";
import { validateAdminNewsEvent } from "../../../utils/validation/adminNewsEventValidation.js";

const buildSlug = (title) =>
  title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "news-event";

const uniqueSlug = async (title, excludedId) => {
  const baseSlug = buildSlug(title);
  let slug = baseSlug;
  let suffix = 2;

  while (
    await NewsEvent.exists({
      slug,
      ...(excludedId ? { _id: { $ne: excludedId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${suffix++}`;
  }
  return slug;
};

const validationResponse = (res, errors) =>
  res.status(422).json({ success: false, message: "Validation failed", errors });

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  category: Joi.string().valid("News", "Event", "Achievement"),
  published: Joi.boolean(),
}).unknown(false);

export const listAdminNewsEvents = asyncHandler(async (req, res) => {
  const { error, value } = querySchema.validate(req.query, {
    abortEarly: false,
    convert: true,
  });
  if (error) return validationResponse(res, { query: "Invalid pagination or filter values" });

  const filter = {};
  if (value.category) filter.category = value.category;
  if (typeof value.published === "boolean") filter.published = value.published;

  const [data, total] = await Promise.all([
    NewsEvent.find(filter)
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

export const getAdminNewsEvent = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ success: false, message: "Invalid ObjectId" });

  const data = await NewsEvent.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "News/Event not found" });

  return res.json({ success: true, data });
});

export const createAdminNewsEvent = asyncHandler(async (req, res) => {
  const { value, errors } = validateAdminNewsEvent(req.body);
  if (errors) return validationResponse(res, errors);
  if (!req.file) return validationResponse(res, { image: "Image is required" });

  let imagePath;
  try {
    imagePath = await saveNewsEventImage(req.file);
    const data = await NewsEvent.create({
      ...value,
      ...(imagePath ? { image: imagePath } : {}),
      slug: await uniqueSlug(value.title),
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    if (imagePath) await removeNewsEventImage(imagePath).catch(() => {});
    if (error.message?.startsWith("Image ")) {
      return validationResponse(res, { image: error.message });
    }
    if (error.code === 11000)
      return res.status(409).json({ success: false, message: "News/Event slug already exists" });
    throw error;
  }
});

export const updateAdminNewsEvent = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ success: false, message: "Invalid ObjectId" });

  const { value, errors } = validateAdminNewsEvent(req.body, true);
  if (errors) return validationResponse(res, errors);

  const newsEvent = await NewsEvent.findById(req.params.id);
  if (!newsEvent)
    return res.status(404).json({ success: false, message: "News/Event not found" });

  let newImagePath;
  const oldImagePath = newsEvent.image;
  try {
    const updates = { ...value };
    if (value.title) updates.slug = await uniqueSlug(value.title, newsEvent._id);

    if (req.file) {
      newImagePath = await saveNewsEventImage(req.file);
      updates.image = newImagePath;
    }

    Object.assign(newsEvent, updates);
    await newsEvent.save();

    if (newImagePath && oldImagePath) {
      await removeNewsEventImage(oldImagePath).catch(() => {});
    }

    return res.json({ success: true, data: newsEvent });
  } catch (error) {
    if (newImagePath) await removeNewsEventImage(newImagePath).catch(() => {});
    if (error.message?.startsWith("Image "))
      return validationResponse(res, { image: error.message });
    if (error.code === 11000)
      return res.status(409).json({ success: false, message: "News/Event slug already exists" });
    throw error;
  }
});

export const deleteAdminNewsEvent = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ success: false, message: "Invalid ObjectId" });

  const data = await NewsEvent.findByIdAndDelete(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "News/Event not found" });

  await removeNewsEventImage(data.image).catch(() => {});
  return res.json({ success: true, data: { id: data.id } });
});
