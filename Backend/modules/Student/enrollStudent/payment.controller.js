import crypto from "crypto";
import razorpay from "../../../config/rozorpay.js";
import { Course } from "../../instructor/createCourse/createCourse.model.js";
import { Test } from "../../Admin/CreateTest/createtest.model.js";
import { EnrollStudent } from "./enrollStudent.model.js";
import { EnrollTest } from "./enrollTest.model.js";
import User from '../student.model.js';
import Scholarship from "../Scholrship/scholarship.model.js";
import { generateReceipt } from "../../../utils/generate_recipt.js";
import { sendReceiptEmail } from "../../../config/emailServices.js";
import path from "path";
import fs from 'fs';

const generateAndSendReceipt = async (enrollmentId, razorpayPaymentId) => {
  try {
    const enrollment = await EnrollStudent.findById(enrollmentId);
    if (!enrollment) return;

    const [student, course] = await Promise.all([
      User.findById(enrollment.student),
      Course.findById(enrollment.course)
    ]);

    if (!student || !course) {
      console.error("Receipt skipped: Student or Course not found");
      return;
    }

    const dir = path.join(process.cwd(), "receipts");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileName = `receipt_${enrollment._id}.pdf`;
    const filePath = path.join(dir, fileName);

    await generateReceipt(filePath, {
      name: student.fullName || student.name,
      course: course.title,
      originalPrice: enrollment.originalPrice ?? enrollment.amount,
      discount: enrollment.discountApplied || 0,
      finalPrice: enrollment.amount,
      orderId: enrollment.orderId,
      paymentId: razorpayPaymentId,
      date: new Date().toLocaleString()
    });

    enrollment.receiptUrl = `/receipts/${fileName}`;
    await enrollment.save();

    await sendReceiptEmail(student, enrollment, course, filePath);
  } catch (err) {
    console.error("Receipt/email failed:", err);
  }
};

const generateAndSendTestReceipt = async (enrollmentId, razorpayPaymentId) => {
  try {
    const enrollment = await EnrollTest.findById(enrollmentId);
    if (!enrollment) return;

    const [student, test] = await Promise.all([
      User.findById(enrollment.student),
      Test.findById(enrollment.test)
    ]);

    if (!student || !test) return;

    const dir = path.join(process.cwd(), "receipts");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileName = `receipt_test_${enrollment._id}.pdf`;
    const filePath = path.join(dir, fileName);

    await generateReceipt(filePath, {
      name: student.fullName || student.name,
      course: `${test.title} (Test Series)`,
      originalPrice: enrollment.amount,
      discount: 0,
      finalPrice: enrollment.amount,
      orderId: enrollment.orderId,
      paymentId: razorpayPaymentId,
      date: new Date().toLocaleString()
    });

    enrollment.receiptUrl = `/receipts/${fileName}`;
    await enrollment.save();

    await sendReceiptEmail(student, enrollment, { title: `${test.title} (Test Series)` }, filePath);
  } catch (err) {
    console.error("Test receipt/email failed:", err);
  }
};

export const createPayment = async (req, res) => {
  try {
    const { courseId, testId, studentId } = req.body;

    if ((!courseId && !testId) || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Course ID or Test ID, and Student ID are required"
      });
    }

    // ==========================================
    // 1. Handle Paid Test Series Purchase
    // ==========================================
    if (testId) {
      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          message: "Test not found"
        });
      }

      if (!test.isPaid || !test.price || test.price <= 0) {
        return res.status(400).json({
          success: false,
          message: "This test is free. No payment required."
        });
      }

      const student = await User.findById(studentId);
      if (student && student.purchasedTests?.some(t => t.toString() === testId.toString())) {
        return res.status(400).json({
          success: false,
          message: "You have already purchased this mock test series!",
          alreadyPurchased: true
        });
      }

      const existingEnrollment = await EnrollTest.findOne({
        student: studentId,
        test: testId,
        paymentStatus: "success"
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: "You have already purchased this mock test series!",
          alreadyPurchased: true,
          enrollmentId: existingEnrollment._id
        });
      }

      const finalPrice = test.price;
      const order = await razorpay.orders.create({
        amount: Math.round(finalPrice * 100),
        currency: "INR",
        receipt: `test_${Date.now().toString().slice(-10)}`
      });

      let testEnrollment = await EnrollTest.findOne({
        student: studentId,
        test: testId,
        paymentStatus: "pending"
      });

      if (testEnrollment) {
        testEnrollment.orderId = order.id;
        testEnrollment.amount = finalPrice;
        await testEnrollment.save();
      } else {
        testEnrollment = await EnrollTest.create({
          student: studentId,
          test: testId,
          orderId: order.id,
          amount: finalPrice,
          status: "pending",
          paymentStatus: "pending"
        });
      }

      return res.json({
        success: true,
        order,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_TbpL4le4mBM46T',
        enrollmentId: testEnrollment._id,
        isTest: true,
        testId: test._id,
        finalPrice,
        discountApplied: 0
      });
    }

    // ==========================================
    // 2. Handle Course Purchase
    // ==========================================
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const existingEnrollment = await EnrollStudent.findOne({
      student: studentId,
      course: courseId,
      status: { $in: ['active', 'completed', 'success'] } 
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this course!",
        alreadyPurchased: true,
        enrollmentId: existingEnrollment._id
      });
    }

    const student = await User.findById(studentId);
    if (student && student.enrolledCourses?.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this course!",
        alreadyPurchased: true
      });
    }

    const now = new Date();

    const scholarship = await Scholarship.findOne({
      studentId,
      status: "approved",
      isUsed: false,
      validFrom: { $lte: now },
      validUntil: { $gte: now }  
    });

    let finalPrice = course.price;
    let discountApplied = 0;

    if (scholarship) {
      discountApplied = scholarship.discount || 0;
      finalPrice = course.price - (course.price * discountApplied / 100);
    }

    console.log("Final Price:", finalPrice);

    const order = await razorpay.orders.create({
      amount: Math.round(finalPrice * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now().toString().slice(-10)}`
    });

    let enrollment = await EnrollStudent.findOne({
      student: studentId,
      course: courseId,
      paymentStatus: "pending"
    });

    if (enrollment) {
      enrollment.orderId = order.id;
      enrollment.amount = finalPrice;
      enrollment.discountApplied = discountApplied;
      await enrollment.save();
    } else {
      try {
        enrollment = await EnrollStudent.create({
          student: studentId,
          course: courseId,
          orderId: order.id,
          amount: finalPrice,
          originalPrice: course.price,
          discountApplied,
          status: "pending",
          paymentStatus: "pending"
        });
      } catch (dbError) {
        if (dbError.code === 11000) {
          return res.status(400).json({
            success: false,
            message: "You have already purchased this course!",
            alreadyPurchased: true
          });
        }
        throw dbError;
      }
    }

    return res.json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_TbpL4le4mBM46T',
      enrollmentId: enrollment._id,
      finalPrice,
      discountApplied
    });

  } catch (error) {
    console.error("Create payment error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this item!",
        alreadyPurchased: true
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment"
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      enrollmentId,
      isTest
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // ==========================================
    // 1. Check if this is a Test Series payment
    // ==========================================
    let testEnrollment = null;
    if (isTest && enrollmentId) {
      testEnrollment = await EnrollTest.findById(enrollmentId);
    }
    if (!testEnrollment && isTest) {
      testEnrollment = await EnrollTest.findOne({ orderId: razorpay_order_id });
    }
    if (!testEnrollment && !enrollmentId) {
      // Auto-detect by order ID if isTest flag wasn't sent
      testEnrollment = await EnrollTest.findOne({ orderId: razorpay_order_id });
    }

    if (testEnrollment) {
      if (testEnrollment.status === "success") {
        return res.json({
          success: true,
          message: "Payment already verified",
          data: testEnrollment,
          isTest: true
        });
      }

      testEnrollment.paymentId = razorpay_payment_id;
      testEnrollment.signature = razorpay_signature;
      testEnrollment.status = "success";
      testEnrollment.paymentStatus = "success";
      testEnrollment.enrolledAt = new Date();
      await testEnrollment.save();

      await User.findByIdAndUpdate(
        testEnrollment.student,
        {
          $addToSet: { purchasedTests: testEnrollment.test }
        }
      );

      generateAndSendTestReceipt(testEnrollment._id, razorpay_payment_id);

      return res.json({
        success: true,
        message: "Payment successful! Test series unlocked. You can now attempt the mock test.",
        data: testEnrollment,
        isTest: true
      });
    }

    // ==========================================
    // 2. Handle Course Enrollment verification
    // ==========================================
    let enrollment = null;

    if (enrollmentId) {
      enrollment = await EnrollStudent.findById(enrollmentId);
    }

    if (!enrollment) {
      enrollment = await EnrollStudent.findOne({
        orderId: razorpay_order_id
      });
    }

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    if (enrollment.status === "success") {
      return res.json({
        success: true,
        message: "Payment already verified",
        data: enrollment
      });
    }

    enrollment.paymentId = razorpay_payment_id;
    enrollment.signature = razorpay_signature;
    enrollment.status = "success";
    enrollment.paymentStatus = "success";
    enrollment.enrolledAt = new Date();

    await enrollment.save();

    await User.findByIdAndUpdate(
      enrollment.student,
      {
        $addToSet: { enrolledCourses: enrollment.course }
      }
    );

    const scholarship = await Scholarship.findOne({
      studentId: enrollment.student,
      status: "approved",
      isUsed: false
    });

    if (scholarship) {
      scholarship.isUsed = true;
      scholarship.usedAt = new Date();
      scholarship.usedForCourse = enrollment.course;
      await scholarship.save();
    }

    generateAndSendReceipt(enrollment._id, razorpay_payment_id);

    return res.json({
      success: true,
      message: "Payment successful and enrollment completed. Receipt will be emailed shortly.",
      data: enrollment
    });

  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed"
    });
  }
};

export const GetMyCourse = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const enrollment = await EnrollStudent.find({
      student: studentId,
      paymentStatus: "success"
    }).populate("course");

    return res.status(200).json({
      message: "get all my purches",
      error: false,
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const GetPurchasedTests = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const enrollments = await EnrollTest.find({
      student: studentId,
      paymentStatus: "success"
    }).populate("test");

    const user = await User.findById(studentId);
    const userPurchased = user?.purchasedTests || [];

    return res.status(200).json({
      success: true,
      data: enrollments,
      testIds: Array.from(new Set([
        ...enrollments.map(e => e.test?._id?.toString() || e.test?.toString()),
        ...userPurchased.map(t => t?.toString())
      ].filter(Boolean)))
    });
  } catch (error) {
    next(error);
  }
};
