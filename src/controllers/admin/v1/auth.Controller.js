import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { User } from "../../../models/user.model.js";
import { ADMIN_JWT_EXPIRES_IN } from "../../../constants.js";
import { loginSchema } from "../../../utils/validation/authValidations.js";

export const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body ?? {}, {
    abortEarly: false,
    convert: true,
  });
  if (error) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: Object.fromEntries(error.details.map((detail) => [detail.path[0], detail.message.replaceAll('"', "")])),
    });
  }

  const admin = await User.findOne({ email: value.email, userType: "Admin", isActive: true });
  if (!admin || !(await bcrypt.compare(value.password, admin.password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: admin._id.toString(), email: admin.email, role: "Admin" },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: ADMIN_JWT_EXPIRES_IN, algorithm: "HS256", subject: admin._id.toString() },
  );

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      admin: admin.toJSON(),
    },
  });
});
