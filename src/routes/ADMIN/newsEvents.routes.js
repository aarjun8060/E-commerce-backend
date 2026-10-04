import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../../middlewares/auth.middlewares.js";
import {
  createAdminNewsEvent,
  deleteAdminNewsEvent,
  getAdminNewsEvent,
  listAdminNewsEvents,
  updateAdminNewsEvent,
} from "../../controllers/admin/v1/newsEvent.Controller.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.use(requireAdmin);
router.get("/", listAdminNewsEvents);
router.post("/", upload.single("image"), createAdminNewsEvent);
router.get("/:id", getAdminNewsEvent);
router.put("/:id", upload.single("image"), updateAdminNewsEvent);
router.delete("/:id", deleteAdminNewsEvent);

export default router;
