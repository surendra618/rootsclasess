import { Router } from "express";
import multer from "multer";
import { EditProfileDetails, getScholarshipTestforStudent, Getuser, handleLogin, handleStdProfile, Registeruser, resetPassword, sendOTPEmail, verifyOTP } from "./student.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const studentRouter =Router()
const upload = multer({ dest: "uploads/" });

studentRouter.post("/register",Registeruser)
studentRouter.post("/login",handleLogin)
studentRouter.post("/std-profile-img",upload.single("image"),handleStdProfile)
studentRouter.post("/edit-profile-details",EditProfileDetails)
studentRouter.post("/get-student",Getuser)

studentRouter.post("/send-otp",sendOTPEmail)
studentRouter.post("/verify-otp",verifyOTP)

studentRouter.get("/test-email", async (req, res) => {
  const { sendOTP } = await import("../../config/emailServices.js");
  const email = req.query.email || "rootsclasses1313@gmail.com";
  try {
    const hasUser = !!process.env.EMAIL_USER;
    const hasPass = !!process.env.EMAIL_PASS;
    const result = await sendOTP(email, "999888");
    return res.json({
      success: result,
      envConfigured: { hasUser, hasPass, user: process.env.EMAIL_USER },
      message: result ? "Test email sent successfully!" : "Failed to send test email. Check server logs."
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

studentRouter.post("/reset-password",resetPassword)
studentRouter.post("/get-testfor-student",authMiddleware,getScholarshipTestforStudent)



export default studentRouter