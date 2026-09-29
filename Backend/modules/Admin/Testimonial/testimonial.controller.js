import cloudinary from "../../../config/cloudinary.js";
import { Testimonial } from "./testimonial.model.js";

export const AddTestimonial = async (req, res, next) => {
    try {
        const { name, achievement, Course, review, rating } = req.body;

        if (!name || !achievement || !Course || !review || !rating) {
            return res.status(400).json({
                message: "fill all required fields",
                error: true,
                success: false
            })
        }

        if (!req.file) {
            return res.status(400).json({
                message: "image is required",
            });
        }


        const result = await cloudinary.uploader.upload(req.file.path);

        console.log("Cloudinary URL:", result.secure_url);

        const testimonial = await Testimonial.create({
            name,
            achievement,
            Course,
            review,
            rating,
            image: result.secure_url
        })

        return res.status(200).json({
            message: "Add student successfully for Testimonial",
            error: false,
            success: true,
            data: testimonial
        })

    } catch (error) {
        next(error)
    }
}
export const GetTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.find()
        return res.status(200).json({
            message: "get successfully",
            error: false,
            success: true,
            data: testimonial
        })

    } catch (error) {
        next(error)
    }
}

export const UpdateTestimonial = async (req, res, next) => {
    try {
        const { testimonialId, name, achievement, Course, review, rating } = req.body;
        if (!testimonialId) {
            return res.status(400).json({
                message: "testimonialId  is required",
                error: true,
                success: false
            })
        }
        const existingTestimonial = await Testimonial.findById(testimonialId)
        if (!existingTestimonial) {
            return res.status(404).json({
                message: "Testimonial not found",
                error: true,
                success: false
            })
        }
        let imageUrl = existingTestimonial.image;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }
        const editTestimonial = await Testimonial.findByIdAndUpdate(testimonialId,{
            name: name || existingTestimonial.name,
            achievement: achievement || existingTestimonial.achievement,
            Course: Course || existingTestimonial.Course,
            review: review || existingTestimonial.review,
            rating: rating || existingTestimonial.rating,
            image:imageUrl
        },{new:true})

        return res.status(200).json({
            message:"testimonial updated successfully",
            error:false,
            success:true,
            data:editTestimonial
        })


    } catch (error) {
     next(error)
    }
}

export const DeleteTestinomial = async(req,res,next)=>{
    try {
        const {testimonialId} = req.body;
        if(!testimonialId){
            return res.status(400).json({
                message:"Id is required",
                error:true,
                success:false
            })
        }
        const testimonial = await Testimonial.findByIdAndDelete(testimonialId)

        return res.status(200).json({
            message:"deleted successfully",
            error:false,
            success:true,
            data:testimonial
        })
        
    } catch (error) {
        next(error)
    }
}
