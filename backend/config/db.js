const mongoose = require("mongoose");

/**
 * Establishes connection to MongoDB database.
 * On failure: logs the error but does NOT crash the server,
 * so the AI chat still works without persistence.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB isn't available
      socketTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Failed: ${error.message}`);
    console.warn("   Server will run WITHOUT conversation persistence.");
    console.warn("   AI chat will still work — conversations just won't be saved.");
    console.warn("   To fix: start MongoDB locally or set a MongoDB Atlas URI in backend/.env");
    // DO NOT process.exit(1) — allow server to start without DB
  }
};

module.exports = connectDB;
