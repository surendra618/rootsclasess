import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        studentId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Student",
         
        },
        classId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"OnlineClass",
          
        },
        joinedAt:{
            type:Date,
            default:Date.now
        }
    },{timestamps:true}
)

attendanceSchema.index({studentId:1,classId:1},{unique:true})
export const Attendance = mongoose.model("Attendance",attendanceSchema)