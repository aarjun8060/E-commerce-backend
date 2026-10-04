import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import connectDB from "../src/db/index.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "School Administrator";

if (!email || !password || password.length < 12) {
  throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters");
}

try {
  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.userType !== "Admin") {
      throw new Error("ADMIN_EMAIL already belongs to a non-admin account");
    }
    console.log("Admin account already exists; no changes made");
  } else {
    await User.create({ name, email, password, userType: "Admin", isActive: true });
    console.log(`Admin account created for ${email}`);
  }
} finally {
  await mongoose.disconnect();
}
