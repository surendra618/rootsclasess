import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
    {
        name:{
            type:String,

        },
        image:{
            type:String,
        },
        achievement:{
            type:String,
        },
        Course:{
            type:String
        },
        review:{
            type:String,
        },
        rating:{
            type:String,
            default:5,
        },
    },{timestamps:true}
)

export const Testimonial = mongoose.model("Testimonial",testimonialSchema)