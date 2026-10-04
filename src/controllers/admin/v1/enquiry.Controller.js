import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { Enquiry } from "../../../models/enquiry.model.js";
import { pushEnquiryToCrm } from "../../../services/crm.services.js";
import { enquiryAdminQuerySchema, enquiryStatusSchema } from "../../../utils/validation/adminEnquiryValidation.js";

export const listAdminEnquiries = asyncHandler(async (req, res) => {
    const { error, value } = enquiryAdminQuerySchema.validate(req.query, {
        abortEarly: false,
        convert: true,
    });
    if (error) {
        return res.status(422).json({
            success: false,
            message: "Validation failed",
            errors: { query: "Invalid pagination or status filter" },
        });
    }

    const filter = value.status ? { status: value.status } : {};
    const [data, total] = await Promise.all([
        Enquiry.find(filter)
            .sort({ createdAt: -1 })
            .skip((value.page - 1) * value.limit)
            .limit(value.limit),
        Enquiry.countDocuments(filter),
    ]);
    return res.status(200).json({
        success: true,
        data,
        pagination: { page: value.page, limit: value.limit, total, totalPages: Math.ceil(total / value.limit) },
    });
});

export const updateAdminEnquiryStatus = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid ObjectId" });
    }
    const { error, value } = enquiryStatusSchema.validate(req.body, {
        abortEarly: false,
        convert: true,
    });
    if (error) {
        return res.status(422).json({
            success: false,
            message: "Validation failed",
            errors: { status: "Status must be New, Contacted, or Closed" },
        });
    }

    const data = await Enquiry.findByIdAndUpdate(
        req.params.id,
        { status: value.status },
        { new: true, runValidators: true },
    );
    if (!data) {
        return res.status(404).json({ success: false, message: "Enquiry not found" });
    }
    return res.status(200).json({ success: true, data });
});

export const retryAdminEnquiryCrm = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid ObjectId" });
    }
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
        return res.status(404).json({ success: false, message: "Enquiry not found" });
    }
    if (enquiry.crmStatus === "Sent") {
        return res.status(409).json({ success: false, message: "This enquiry was already delivered to the CRM" });
    }

    const result = await pushEnquiryToCrm(enquiry);
    enquiry.crmStatus = result.status;
    enquiry.crmResponse = String(result.response || "").slice(0, 500);
    await enquiry.save();
    return res.status(200).json({ success: true, data: enquiry });
});
