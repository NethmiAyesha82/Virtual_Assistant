import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();

// Absolute CORS Bypass Middleware for Vercel Serverless
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

connectDb();

app.get("/", (req, res) => {
  res.send("Backend Server Running Successfully!");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

const port = process.env.PORT || 8000;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;