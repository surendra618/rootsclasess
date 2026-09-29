import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import User  from '../Student/student.model.js';


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};
export const InstructorLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        message: "Invalid email or password",
        error: true,
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({
        message: " password not match",
        error: true,
        success: false,
      });
    }

    if (user.role !== "instructor") {
      return res.status(403).json({
        message: "Access denied. Instructor only login.",
        error: true,
        success: false,
      });
    }

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name || user.fullName || user.username || "instructor",
      email: user.email,
      role: user.role, 
    
    };

    return res.status(200).json({
      message: "Instructor login successful",
      error: false,
      success: true,
      token: token,
      user: userResponse,
    });

  } catch (error) {
    console.error("Instructor Login Error:", error);
    next(error);
  }
};

export const RegisterInstructor = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, address } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        message: "Full Name, Email, Password, and Phone are required",
        error: true,
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
        error: true,
        success: false,
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hash,
      role: "instructor",
      phone,
      address: address || ""
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Teacher account created successfully!",
      error: false,
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Register Instructor Error:", error);
    next(error);
  }
};