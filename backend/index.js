import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Serverless Requests සඳහා Database Connection Middleware එක:
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    console.error("Database Middleware Error:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend Server Running Successfully!");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

const port = process.env.PORT || 8000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;