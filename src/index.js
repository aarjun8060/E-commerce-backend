import dotenv from "dotenv";
dotenv.config();

const requiredEnvironmentVariables = ["MONGODB_URL", "ADMIN_JWT_SECRET"];

const missing = requiredEnvironmentVariables.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const { default: connectDB } = await import("./db/index.js");
const { app } = await import("./app.js");

await connectDB();

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
