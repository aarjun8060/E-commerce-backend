import express from "express";
import { getNewsEventBySlug, listNewsEvents } from "../../controllers/public/v1/newsEvent.Controller.js";

const router = express.Router();

router.get("/", listNewsEvents);
router.get("/:slug", getNewsEventBySlug);

export default router;