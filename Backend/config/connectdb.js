import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectdb=async ()=>{
    try{
        mongoose
        .connect(process.env.MONGO_URL)

        .then(()=>{
            console.log("Database connected sucessfully");
        });
        
    }
    catch(error){
    console.log("error while connecting database",error);
    }
    
};
export default connectdb;