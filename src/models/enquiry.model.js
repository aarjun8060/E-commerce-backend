import mongoose, { Schema } from "mongoose";

const enquirySchema = new Schema({
    parentName: { type: String, required: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    classApplying: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ["New", "Contacted", "Closed"], default: "New" },
    crmStatus: { type: String, enum: ["Pending", "Sent", "Failed"], default: "Pending" },
    crmResponse: { type: String, maxlength: 500 },
}, { timestamps: true });

enquirySchema.index({ mobile: 1, classApplying: 1, createdAt: -1 });

enquirySchema.method("toJSON", function () {
    const { _id, __v, ...document } = this.toObject({ virtuals: true });
    document.id = _id;
    return document;
});

export const Enquiry = mongoose.model("Enquiry", enquirySchema);