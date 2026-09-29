import cloudinary from "../../../config/cloudinary.js";
import { Slider } from "./slider.model.js";

const uploadSliderImage = async (file) => {
    if (!file?.path) {
        return null;
    }

    const result = await cloudinary.uploader.upload(file.path);
    return result.secure_url;
};

export const CreateSlider = async (req, res, next) => {
    try {
        const { title, subtitle, buttonText, classText, isDefault } = req.body;

        if (!title || !subtitle || !buttonText || !classText) {
            return res.status(400).json({
                message: "fill required fields",
                error: true,
                success: false
            })
        }

        const desktopFile = req.files?.desktopImage?.[0];
        const tabletFile = req.files?.tabletImage?.[0];
        const mobileFile = req.files?.mobileImage?.[0];

        if (!desktopFile || !tabletFile || !mobileFile) {
            return res.status(400).json({
                message: "desktop, tablet and mobile images are required",
            });
        }

        const [desktopImage, tabletImage, mobileImage] = await Promise.all([
            uploadSliderImage(desktopFile),
            uploadSliderImage(tabletFile),
            uploadSliderImage(mobileFile)
        ]);

        if (isDefault === 'true' || isDefault === true) {
            await Slider.updateMany({}, { isDefault: false });
        }

        const  slider = await Slider.create({
            title,
            subtitle,
            buttonText,
            classText,
            image: desktopImage,
            desktopImage,
            tabletImage,
            mobileImage,
            isDefault: isDefault === 'true' || isDefault === true
        })

        return res.status(200).json({
            message:"slider created successfully",
            error:false,
            success:true,
            data:slider
        })

    } catch (error) {
      next(true)
    }
}

export const GetSlider = async(req,res,next)=>{
    try {
        const allslider = await Slider.find().sort({ isDefault: -1, createdAt: -1 })

        return res.status(200).json({
            message:"ALl slider fatched successfully",
            error:false,
            success:true,
            data:allslider
        })
        
    } catch (error) {
        next(error)
    }
}

export const UpdateSlider = async(req,res,next)=>{
    try {
        const {sliderId,title, subtitle, buttonText, classText, isDefault} = req.body;
        if(!sliderId){
            return res.status(400).json({
                message:"slider Id is required",
                error:true,
                success:false
            })
        }

        const existingSlider = await Slider.findById(sliderId)
        if(!existingSlider){
            return res.status(404).json({
                message:"slider not found",
                error:true,
                success:false

            })
        }
        let desktopImage = existingSlider.desktopImage || existingSlider.image;
        let tabletImage = existingSlider.tabletImage || existingSlider.desktopImage || existingSlider.image;
        let mobileImage = existingSlider.mobileImage || existingSlider.tabletImage || existingSlider.desktopImage || existingSlider.image;

        if (req.files?.desktopImage?.[0]) {
            desktopImage = await uploadSliderImage(req.files.desktopImage[0]);
        }

        if (req.files?.tabletImage?.[0]) {
            tabletImage = await uploadSliderImage(req.files.tabletImage[0]);
        }

        if (req.files?.mobileImage?.[0]) {
            mobileImage = await uploadSliderImage(req.files.mobileImage[0]);
        }

        if (isDefault === 'true' || isDefault === true) {
            await Slider.updateMany({ _id: { $ne: sliderId } }, { isDefault: false });
        }

        const editSlider = await Slider.findByIdAndUpdate(sliderId,{
            title: title || existingSlider.title, 
            subtitle: subtitle || existingSlider.subtitle,
             buttonText: buttonText || existingSlider.buttonText, 
             classText: classText || existingSlider.classText,
             image: desktopImage,
             desktopImage,
             tabletImage,
             mobileImage,
             isDefault: isDefault !== undefined ? (isDefault === 'true' || isDefault === true) : existingSlider.isDefault
        },{new:true})

        return res.status(200).json({
            message:"Slider Updated successgully",
            error:false,
            success:true,
            data:editSlider
        })
        
    } catch (error) {
        next(error)
    }
}

export const DeleteSlider = async(req,res,next)=>{
    try {
        const {sliderId} = req.body;
        if(!sliderId){
            return res.status(400).json({
                message:"Slider Id is required",
                error:true,
                success:false
            })
        }
         
    const deleteslider = await Slider.findByIdAndDelete(sliderId)
    
    return res.status(200).json({
        message:"Slider deleted successfully",
        error:false,
        success:true,
        data:deleteslider
    })

    } catch (error) {
      next(error)  
    }
}

