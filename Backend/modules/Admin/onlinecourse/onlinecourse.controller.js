import { OnlineClass } from "./onlinecourse.model.js";

export const CreateOnlineClass = async(req,res,next)=>{
    try {
        const {title,instructor,day,time,duration,description,plateform,meetingLink,color}=req.body;
        console.log(req.body,"dbfjdsieuwiur")

        if(!title || !instructor || !day || !time || !duration || !description || !plateform || !meetingLink || !color){
            return res.status(400).json({
                message:"fill All fields",
                error:true,
                success:false
            })
        }

        const createClass = new OnlineClass({
            title,
            instructor,
            day,
            time,
            duration,
            description,
            plateform,
            meetingLink,
            color
        });
        await createClass.save()

        return res.status(200).json({
            message:"Class created successfully",
            error:false,
            success:true,
            data:createClass,
        })


        
    } catch (error) {
       next(error)   
    }
}

export const GetCreatedClass = async(req,res,next)=>{
    try {
        const Allclass = await OnlineClass.find()

        return res.status(200).json({
            message:"All class fatched successfully",
            error:false,
            success:true,
            Allclass,
        })
        
    } catch (error) {
        next(error)
    }
}

export const UpdateClassData = async(req,res,next)=>{
    try {
        const {classId,title,instructor,day,time,duration,description,plateform,meetingLink,color}= req.body;
        if(!classId){
            return res.status(400).json({
                message:"class ID not found",
                error:true,
                success:false
            })
        }

        const editclass = await OnlineClass.findByIdAndUpdate(classId,{
            title,
            instructor,
            day,
            time,
            duration,
            description,
            plateform,
            meetingLink,
            color
        },{new:true})

       if(!editclass){
        return res.status(404).json({
            message:"class not found",
            error:true,
            success:false
        })
       }

       return res.status(200).json({
        message:"class updated successfully",
        error:false,
        success:true,
        data:editclass
       })
        
    } catch (error) {
        console.log(error)
    }
}

export const DeleteClass = async(req,res,next)=>{
    try {
        const {classId}= req.body;

        if(!classId){
            return res.status(400).json({
                message:"classId is not found",
                error:true,
                success:false
            })
        }

        const deletedclass = await  OnlineClass.findByIdAndDelete(classId)

        return res.status(200).json({
            message:"class deleted successfully",
            error:false,
            success:true,
            data:deletedclass
        })
        
    } catch (error) {
        next(error)
    }
}


export const GatAllClasses = async(req,res,next)=>{
    try {
        const classes = await OnlineClass.find()
        const UpdatedClasses = classes.map((cls)=>{
            const now = new Date();

            const classStart = new Date(`${cls.date} ${cls.time}`);
            const classEnd = new Date(
                classStart.getTime()+cls.duration*60000
            );
            let status="Upcoming";

            if(now >= classStart && now <= classEnd){
                status="Live";
            }else if(now > classEnd){
                status="Completed"
            }

            return {...cls._doc,status}
        })

        res.status(200).json({
            message:"fatch all classes",
            error:false,
            success:true,
            UpdatedClasses,
        })
        
    } catch (error) {
        next(error)
    }
}
