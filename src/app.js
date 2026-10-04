import express from "express";
import cors from "cors";

import adminAuthRouter from "./routes/ADMIN/auth.routes.js";
import newsEventsAdminRouter from "./routes/ADMIN/newsEvents.routes.js";
import enquiriesAdminRouter from "./routes/ADMIN/enquiries.routes.js";
import newsEventRouter from "./routes/PUBLIC/newsEvent.routes.js";
import enquiryRouter from "./routes/PUBLIC/enquiry.routes.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));


app.use(
    // midle ware to log requests
    (req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    }
)

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "API is running" });
});


app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin/news-events", newsEventsAdminRouter);
app.use("/api/v1/admin/enquiries", enquiriesAdminRouter);
app.use("/api/v1/news-events", newsEventRouter);
app.use("/api/v1/enquiries", enquiryRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: { image: "Image must not exceed 2 MB" },
    });
  }

  if (error?.name === "MulterError") {
    return res.status(422).json({
      success: false,
      message: "Invalid multipart request",
      errors: { image: error.message },
    });
  }

  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Malformed JSON" });
  }

  if (error?.name === "CastError" && error?.kind === "ObjectId") {
    return res.status(400).json({ success: false, message: "Invalid ObjectId" });
  }

  console.error(error);
  return res.status(500).json({ success: false, message: "Internal server error" });
});

export { app };
