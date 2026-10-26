import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const FALLBACK_MONGO_URL = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/test?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectdb = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUrl = process.env.MONGO_URL || FALLBACK_MONGO_URL;
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(mongoUrl, opts).then((mongooseInstance) => {
      console.log("Database connected successfully");
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      console.error("error while connecting database:", err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

export default connectdb;