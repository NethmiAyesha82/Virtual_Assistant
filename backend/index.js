import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();

// CORS එක ඕනෑම Frontend domain එකකට (Localhost සහ Vercel Live Link) allow වන සේ වෙනස් කරන්න:
app.use(cors({
  origin: true, // හෝ ["http://localhost:5173", "https:// virtual-assistant-....vercel.app"]
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Vercel එකේ Live එක වැඩද බලන්න Root route එකක් එකතු කරන්න:
app.get("/", (req, res) => {
  res.send("Backend Server Running Successfully!");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// index.js යටම කොටස මෙසේ තිබිය යුතුය:
const port = process.env.PORT || 8000;

connectDb();

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;