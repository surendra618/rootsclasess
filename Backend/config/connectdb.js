import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

let isConnected = false;

const FALLBACK_MONGO_URL = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

const connectdb = async () => {
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }
    const mongoUrl = process.env.MONGO_URL || FALLBACK_MONGO_URL;
    try {
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 8000,
        });
        isConnected = true;
        console.log("Database connected successfully");
    } catch (error) {
        console.log("error while connecting database", error);
    }
};

export default connectdb;