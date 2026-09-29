import cloudinary from "../../../config/cloudinary.js";
import { Faculty } from "./faculty.model.js";

export const CreateFaculty = async (req, res, next) => {
    try {
        const { name, subject, description, rating, experience } = req.body;

        if (!name || !subject || !description) {
            return res.status(400).json({
                message: "Fill required fields: Name, Subject, and Description",
                error: true,
                success: false
            })
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Image is required",
                error: true,
                success: false
            });
        }

        const result = await cloudinary.uploader.upload(req.file.path);

        const faculty = await Faculty.create({
            name,
            subject,
            description,
            rating: rating || 5,
            experience: experience || '5+',
            image: result.secure_url
        })

        return res.status(200).json({
            message: "Faculty member created successfully",
            error: false,
            success: true,
            data: faculty
        })

    } catch (error) {
        next(error)
    }
}

export const GetFaculty = async (req, res, next) => {
    try {
        const allFaculty = await Faculty.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Faculty list fetched successfully",
            error: false,
            success: true,
            data: allFaculty
        })

    } catch (error) {
        next(error)
    }
}

export const UpdateFaculty = async (req, res, next) => {
    try {
        const { facultyId, name, subject, description, rating, experience } = req.body;
        
        if (!facultyId) {
            return res.status(400).json({
                message: "Faculty Id is required",
                error: true,
                success: false
            })
        }

        const existingFaculty = await Faculty.findById(facultyId);
        if (!existingFaculty) {
            return res.status(404).json({
                message: "Faculty member not found",
                error: true,
                success: false
            })
        }

        let imageUrl = existingFaculty.image;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }

        const updatedFaculty = await Faculty.findByIdAndUpdate(facultyId, {
            name: name || existingFaculty.name,
            subject: subject || existingFaculty.subject,
            description: description || existingFaculty.description,
            rating: rating || existingFaculty.rating,
            experience: experience || existingFaculty.experience,
            image: imageUrl
        }, { new: true });

        return res.status(200).json({
            message: "Faculty member updated successfully",
            error: false,
            success: true,
            data: updatedFaculty
        })

    } catch (error) {
        next(error)
    }
}

export const DeleteFaculty = async (req, res, next) => {
    try {
        const { facultyId } = req.body;
        if (!facultyId) {
            return res.status(400).json({
                message: "Faculty Id is required",
                error: true,
                success: false
            })
        }

        const deletedFaculty = await Faculty.findByIdAndDelete(facultyId);

        return res.status(200).json({
            message: "Faculty member deleted successfully",
            error: false,
            success: true,
            data: deletedFaculty
        })

    } catch (error) {
        next(error)
    }
}
