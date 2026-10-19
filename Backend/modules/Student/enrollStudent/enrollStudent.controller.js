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

    let enrollment = await EnrollStudent.findOne({
      student: studentId,
      course: courseId
    });

    if (enrollment) {
      if (status === 'success') {
        enrollment.status = 'success';
        enrollment.paymentStatus = 'success';
        if (!enrollment.enrolledAt) enrollment.enrolledAt = new Date();
        await enrollment.save();
      }
    } else {
      enrollment = new EnrollStudent({
        student: studentId,
        course: courseId,
        status,
        paymentStatus: status === 'success' ? 'success' : 'pending',
        orderId: `FREE_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        amount: 0,
        enrolledAt: status === 'success' ? new Date() : null
      });
      await enrollment.save();
    }

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