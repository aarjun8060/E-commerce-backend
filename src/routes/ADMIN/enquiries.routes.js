import { Router } from "express";
import { requireAdmin } from "../../middlewares/auth.middlewares.js";
import {
  listAdminEnquiries,
  retryAdminEnquiryCrm,
  updateAdminEnquiryStatus,
} from "../../controllers/admin/v1/enquiry.Controller.js";

const router = Router();
router.use(requireAdmin);
router.get("/", listAdminEnquiries);
router.post("/:id/retry-crm", retryAdminEnquiryCrm);
router.patch("/:id/status", updateAdminEnquiryStatus);

export default router;
