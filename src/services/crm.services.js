const CRM_TIMEOUT_MS = 5000;
const MAX_CRM_RESPONSE_LENGTH = 500;

const shortResponse = (message) => String(message).slice(0, MAX_CRM_RESPONSE_LENGTH);

export const pushEnquiryToCrm = async (enquiry) => {
    const webhookUrl = process.env.CRM_WEBHOOK_URL;
    if (!webhookUrl) {
        return { status: "Failed", response: "CRM_WEBHOOK_URL is not configured" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);
    const payload = {
        id: enquiry.id ?? enquiry._id?.toString(),
        parentName: enquiry.parentName,
        studentName: enquiry.studentName,
        classApplying: enquiry.classApplying,
        mobile: enquiry.mobile,
        email: enquiry.email ?? null,
        message: enquiry.message ?? null,
        status: enquiry.status,
        createdAt: enquiry.createdAt,
    };

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        if (!response.ok) {
            return {
                status: "Failed",
                response: shortResponse(`HTTP ${response.status}`),
            };
        }

        return { status: "Sent", response: String(response.status) };
    } catch (error) {
        const message = error.name === "AbortError"
            ? "CRM request timed out"
            : error.message || "CRM network error";
        return { status: "Failed", response: shortResponse(message) };
    } finally {
        clearTimeout(timeout);
    }
};