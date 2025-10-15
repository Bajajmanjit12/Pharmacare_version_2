const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI;
if (!URI) throw new Error("MONGODB_URI missing in .env");

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(URI, {
      dbName: 'NewsPaper',
      bufferCommands: false,
      maxPoolSize: 200,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    })
    .then(mongoose => mongoose.connection)
    .catch(err => {
      console.error("Failed to connect MongoDB:", err);
      throw new Error("Database connection failed");
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectToDatabase;
