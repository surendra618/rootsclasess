import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import  User  from '../Student/student.model.js';


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};
export const AdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("req.body............................", req.body)

    if (!email || !password) {
      return res.status(400).json({
        message: "fill required fields",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ email }); 
    console.log(user , "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm")
    if (!user) {
      return res.status(404).json({
        message: "Invalid email and password",
        error: true,
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: " password not match  for admin",
        error: true,
        success: false,
      });
    }

    if (
      user.role !== "admin" &&
      user.role !== "instructor"
    ) {
      return res.status(403).json({
        message: "Access denied",
        error: true,
        success: false,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "This account has been banned.",
        error: true,
        success: false,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successfully",
      error: false,
      success: true,
      token,
      user,
    });

  } catch (error) {
    next(error);
  }
};

export const getAllStudent = async(req,res,next)=>{
    try {
        const student = await User.find({role:"student"}).sort({ createdAt: -1 });

        return res.status(200).json({
            message:"All student fatched Successfully",
            error:false,
            success:true,
            data:student
        })
        
    } catch (error) {
        next(error)
    }
};

export const toggleBanStudent = async (req, res, next) => {
  try {
    const { studentId, isBanned, banReason } = req.body;

    if (!studentId) {
      return res.status(400).json({
        message: "Student ID is required",
        error: true,
        success: false,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      studentId,
      {
        isBanned: isBanned !== undefined ? isBanned : true,
        banReason: banReason || (isBanned ? "Account suspended by administrator" : ""),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "Student not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: updatedUser.isBanned ? "Student has been banned successfully" : "Student has been unbanned successfully",
      error: false,
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const changeAdminPassword = async (req, res, next) => {
  try {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required",
        error: true,
        success: false
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        error: true,
        success: false
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "Current password is incorrect",
          error: true,
          success: false
        });
      }
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully!",
      error: false,
      success: true
    });
  } catch (error) {
    next(error);
  }
};