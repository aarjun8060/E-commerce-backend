import { asyncHandler } from "../../../utils/asyncHandler.js";
import { Enquiry } from "../../../models/enquiry.model.js";
import { pushEnquiryToCrm } from "../../../services/crm.services.js";
import { validateEnquiry } from "../../../utils/validation/enquiryValidation.js";
import { sendAdmissionsEnquiryEmail } from "../../../services/admissionsEmail.services.js";

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const THANK_YOU_MESSAGE = "Thank you! We have received your enquiry. Our team will contact you shortly.";

export const createEnquiry = asyncHandler(async (req, res) => {
    const { value, errors } = validateEnquiry(req.body ?? {});
    if (errors) {
        return res.status(422).json({ success: false, message: "Validation failed", errors });
    }

    const createdAfter = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    const duplicate = await Enquiry.exists({
        mobile: value.mobile,
        classApplying: value.classApplying,
        createdAt: { $gte: createdAfter },
    });
    if (duplicate) {
        return res.status(409).json({
            success: false,
            message: "We have already received your enquiry.",
        });
    }

    const enquiry = await Enquiry.create(value);
    let crmResult;
    try {
        crmResult = await pushEnquiryToCrm(enquiry);
    } catch (error) {
        crmResult = { status: "Failed", response: error.message || "CRM delivery failed" };
    }
    enquiry.crmStatus = crmResult.status;
    enquiry.crmResponse = String(crmResult.response).slice(0, 500);
    try {
        await enquiry.save();
    } catch {}

    void sendAdmissionsEnquiryEmail(enquiry).then((result) => {
        if (!result.sent && !result.skipped) {
            console.error("Admission notification email was not delivered", result.status || result.response);
        }
    }).catch(() => {
        console.error("Admission notification email was not delivered");
    });

    return res.status(201).json({
        success: true,
        message: THANK_YOU_MESSAGE,
        data: { id: enquiry.id ?? enquiry._id.toString() },
    });
});
