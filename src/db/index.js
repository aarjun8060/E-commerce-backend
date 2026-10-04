import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) throw new Error("MONGODB_URL is not configured");

  await mongoose.connect(mongoUrl, { dbName: DB_NAME });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${DB_NAME}`);
};

export default connectDB;
