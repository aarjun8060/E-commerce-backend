import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import {responseHandler} from "./utils/response/responseHandler.js"

//  All Routes 
// ------------- USER Routes--------------------
import userRouter from "./routes/USERAPP/user.routes.js"
import productRouter from "./routes/USERAPP/products.routes.js"
import cartRouter from "./routes/USERAPP/cart.routes.js"
import orderRouter from "./routes/USERAPP/order.routes.js"
// ==================ADMIN Routes =========================
import userAdminRouter from "./routes/ADMIN/auth.routes.js"
import productAdminRouter from "./routes/ADMIN/products.routes.js"
import cartAdminRouter from "./routes/ADMIN/cart.routes.js"
import orderAdminRouter from "./routes/ADMIN/order.routes.js"


// Strategy Passport 
import {userappPassportStrategy} from "../config/userappPassportStrategy.js"
import { adminPassportStrategy } from "../config/adminPassportStrategy.js"

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credential : true
}))
app.use(responseHandler);

app.use(passport.initialize());
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


userappPassportStrategy(passport);
adminPassportStrategy(passport);

//  User Routes
app.use("/api/v1/userapp/auth",userRouter)
app.use("/api/v1/userapp/product",productRouter)
app.use("/api/v1/userapp/cart",cartRouter)
app.use("/api/v1/userapp/order",orderRouter)
// ADMIN ROUTES
app.use("/api/v1/admin/auth",userAdminRouter)
app.use("/api/v1/admin/product",productAdminRouter)
app.use("/api/v1/admin/cart",cartAdminRouter)
app.use("/api/v1/admin/order",orderAdminRouter)

export { app }