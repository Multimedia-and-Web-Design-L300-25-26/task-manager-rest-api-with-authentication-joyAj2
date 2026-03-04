import mongoose from "mongoose";

const CONNECTION_ATTEMPT_TIMEOUT_MS = 10000;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set. Skipping MongoDB connection.");
    return false;
  }

  try {
    await Promise.race([
      mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000
      }),
      new Promise((_, reject) =>
        setTimeout(() => {
          reject(new Error(`MongoDB connection attempt timed out after ${CONNECTION_ATTEMPT_TIMEOUT_MS}ms`));
        }, CONNECTION_ATTEMPT_TIMEOUT_MS)
      )
    ]);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
};

export default connectDB;
