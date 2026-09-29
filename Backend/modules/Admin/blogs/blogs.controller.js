import cloudinary from "../../../config/cloudinary.js";
import { Blog } from "./blogs.model.js";

export const CreateBlogs = async (req, res, next) => {
    try {
        const { title, author, category, content, status } = req.body;
        if (!title || !author || !category || !content || !status) {
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



        const blog = await Blog.create({
            title,
            author,
            category,
            content,
            image: result.secure_url,
            status
        });

        return res.status(200).json({
            message: "Blog created successfully",
            error: false,
            success: true,
            data: blog
        })


    } catch (error) {
        next(error)
    }
}

export const GetBlogsData = async (req, res, next) => {
    try {
        const blogs = await Blog.find()

        return res.status(200).json({
            message: "fatched all blogs",
            error: true,
            success: false,
            data: blogs
        })

    } catch (error) {
        next(error)
    }
}

export const UpdateBlog = async (req, res, next) => {
    try {
        const { blogId, title, author, category, content, status } = req.body

        if (!blogId) {
            return res.status(400).json({
                message: "blogId is required",
                error: true,
                success: false
            })
        }

        const existingblog = await Blog.findById(blogId)

        if (!existingblog) {
            return res.status(404).json({
                message: "blog not found",
                error: true,
                success: false
            })
        }

        let imageUrl = existingblog.image;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }

        const updateblog = await Blog.findByIdAndUpdate(blogId, {
            title: title || existingblog.title,
            author: author || existingblog.author,
            category: category || existingblog.category,
            content: content || existingblog.content,
            status: status || existingblog.status,
            image: imageUrl
        },{new:true})

        return res.status(200).json({
            messaage:"Blog Updated successfully",
            error:false,
            success:true,
            data:updateblog
        })

    } catch (error) {
       next(error)
    }
}

export const DeleteBlog = async(req,res,next)=>{
    try {
        const {blogId} = req.body;
        if(!blogId){
            return res.status(400).json({
                message:"blogId is not required",
                error:true,
                success:true
            })
        }
const blog = await Blog.findById(blogId)

if(!blog){
    return res.status(400).json({
        message:"blog not found",
        error:true,
        success:false
    })
}

const deleteBlog = await Blog.findByIdAndDelete(blogId)

return res.status(200).json({
    message:"blog deleted successfully",
    error:false,
    success:false,
    data:deleteBlog
})
        
        
    } catch (error) {
        next(error)
    }
}