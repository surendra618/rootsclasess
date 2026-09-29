import { OnlineClass } from "../onlinecourse/onlinecourse.model.js";
import { Attendance } from "./attendance.model.js";

export const JoinClass = async (req, res, next) => {
  try {
    const { studentId, classId } = req.body;

    if (!studentId || !classId) {
      return res.status(400).json({
        message: "studentId and classId required",
        success: false,
      });
    }

    const classData = await OnlineClass.findById(classId);

    if (!classData) {
      return res.status(404).json({
        message: "Class not found",
        success: false,
      });
    }

    const alreadyJoined = await Attendance.findOne({
      studentId,
      classId,
    });

    if (alreadyJoined) {
      return res.status(200).json({
        message: "Already joined",
        success: true,
      });
    }

    const attendance = await Attendance.create({
      studentId,
      classId,
    });

    return res.status(200).json({
      message: "Class joined successfully",
      success: true,
      data: attendance,
    });

  } catch (error) {
    next(error);
  }
};

export const GetStudentCount = async(req,res,next)=>{
    try {
        const classes = await OnlineClass.find()

       const classWithCount = await Promise.all(
        classes.map(async(cls)=>{
            const count = await Attendance.countDocuments({
                classId:cls._id,
            });
            return {
                ...cls._doc,
                studentCount:count
            }
        })
       )
        res.status(200).json({
            success:true,
            data:classWithCount
        })
        
    } catch (error) {
        next(error)
    }
}