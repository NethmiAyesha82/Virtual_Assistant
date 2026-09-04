import mongoose from "mongoose";

// Connection එක Cache කර තබා ගැනීමට Variable එකක්:
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Connection එක නැතිනම් Mongoose Queries Buffer වීම වළක්වයි
      serverSelectionTimeoutMS: 5000, // DB එක සොයාගැනීමට තත්පර 5කට වඩා නොගනී
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URL, opts).then((mongoose) => {
      console.log("MongoDB Connected Successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB Connection Failed:", e);
    throw e;
  }

  return cached.conn;
};

export default connectDb;