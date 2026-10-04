import express from "express";
import { createEnquiry } from "../../controllers/public/v1/enquiry.Controller.js";
import { enquiryRateLimit } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/", enquiryRateLimit, createEnquiry);

export default router;
