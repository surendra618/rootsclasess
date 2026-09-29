import mongoose from "mongoose";

const onlineClassSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            trim:true
        },
        instructor:{
            type:String,
            trim:true
        },
        day:{
            type:String,
             enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        },
        time:{
            type:String,

        },
        duration:{
            type:String,
        },
        description:{
            type:String
        },
        plateform:{
            type:String,
            enum:["Zoom","Google Meet","Microsoft Teams","YouTube"],
            default:"Zoom"
        },
        meetingLink:{
            type:String,

        },
        color:{
            type:String
        },

        status:{
            type:String,
            enum:["Upcoming","Live","Completed"],
            default:"Upcoming"
        }
    },{timestamps:true}
)
export const OnlineClass = mongoose.model("OnlineClass",onlineClassSchema)