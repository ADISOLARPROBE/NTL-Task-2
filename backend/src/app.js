import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

const app = express(); // create an express app

// 1. CORS configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true
    })
);

// 2. Rate limiting (API security)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    message: {
        message: "Too many requests from this IP, please try again after 15 minutes"
    }
});
app.use(limiter);

// 3. Built-in & cookie middlewares
app.use(express.json());
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

// 4. Global error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

export default app;
