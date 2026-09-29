import mongoose from "mongoose";
import { EnrollStudent } from "./enrollStudent.model.js";
import User from "../student.model.js";

export const enrollCourse = async (req, res) => {
  try {
    const { studentId, courseId, status = 'pending' } = req.body;

    // ✅ validation
    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "studentId and courseId are required"
      });
    }

    // ✅ check already enrolled
    const existingEnrollment = await EnrollStudent.findOne({
      student: studentId,
      course: courseId,
      status: 'success'
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course"
      });
    }

    // ✅ check pending
    const pendingEnrollment = await EnrollStudent.findOne({
      student: studentId,
      course: courseId,
      status: 'pending'
    });

    if (pendingEnrollment && status === 'pending') {
      return res.json({
        success: true,
        data: pendingEnrollment,
        message: "Existing pending enrollment found"
      });
    }

    // ✅ FIXED: correct fields
    const enrollment = new EnrollStudent({
      student: studentId,
      course: courseId,
      status,
      enrolledAt: status === 'success' ? new Date() : null
    });

    await enrollment.save();

    // ✅ update user
    if (status === 'success') {
      await User.findByIdAndUpdate(studentId, {
        $addToSet: { enrolledCourses: courseId }
      });
    }

    res.json({
      success: true,
      data: enrollment,
      message: status === 'success'
        ? "Enrolled successfully"
        : "Enrollment initiated"
    });

  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};