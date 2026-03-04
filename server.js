import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnected = await connectDB();

  app.listen(PORT, () => {
    if (dbConnected) {
      console.log(`Server running on port ${PORT}`);
    } else {
      console.log(`Server running on port ${PORT} (without MongoDB connection)`);
    }
  });
};

startServer();
