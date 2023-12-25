import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import {responseHandler} from "./utils/response/responseHandler.js"
import userRouter from "./routes/user.routes.js"
const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credential : true
}))
app.use(responseHandler);

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//  User Routes
app.use("/api/v1/userapp",userRouter)





export { app }