import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const requireAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Admin authentication required" });
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET, { algorithms: ["HS256"] });
    if (payload.role !== "Admin" || typeof payload.id !== "string" || payload.sub !== payload.id) {
      return res.status(401).json({ success: false, message: "Invalid admin token" });
    }
    const admin = await User.findOne({
      _id: payload.id,
      userType: "Admin",
      isActive: true,
    }).select("name email userType isActive");

    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized admin" });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired admin token" });
  }
};
