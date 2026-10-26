import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

let isConnected = false;

const connectdb = async () => {
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URL);
        isConnected = true;
        console.log("Database connected successfully");
    } catch (error) {
        console.log("error while connecting database", error);
    }
};

export default connectdb;