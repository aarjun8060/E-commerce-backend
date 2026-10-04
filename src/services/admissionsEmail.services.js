const EMAIL_TIMEOUT_MS = 5000;

export async function sendAdmissionsEnquiryEmail(enquiry) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.COMPANY_EMAIL;
  const from = process.env.ADMISSIONS_EMAIL_FROM;
  if (!apiKey || !to || !from) return { sent: false, skipped: true };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New admission enquiry: ${enquiry.studentName}`,
        text: [
          `Parent: ${enquiry.parentName}`,
          `Student: ${enquiry.studentName}`,
          `Class: ${enquiry.classApplying}`,
          `Mobile: ${enquiry.mobile}`,
          `Email: ${enquiry.email || "Not provided"}`,
          `Message: ${enquiry.message || "Not provided"}`,
        ].join("\n"),
      }),
      signal: controller.signal,
    });
    return { sent: response.ok, status: response.status };
  } catch (error) {
    return {
      sent: false,
      response: error?.name === "AbortError" ? "Email request timed out" : "Email provider unavailable",
    };
  } finally {
    clearTimeout(timeout);
  }
}
