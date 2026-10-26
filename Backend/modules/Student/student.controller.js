import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import cloudinary from "../../config/cloudinary.js";
import User from './student.model.js';
import { sendOTP } from '../../config/emailServices.js';
import { emitNotification } from '../../config/socket.js';
import { Test } from '../Admin/CreateTest/createtest.model.js';
import { Course } from '../instructor/createCourse/createCourse.model.js';
import { EnrollStudent } from './enrollStudent/enrollStudent.model.js';
import { validateEmail } from '../../utils/emailValidator.js';

// In-memory store for verified registration emails (valid for 15 minutes)
export const verifiedRegistrationEmails = new Map();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};


export const Registeruser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      dateofBirth,
      gender,
      currentClass,
      interestedCourse,
      address,
      phone,
      otp
    } = req.body;

    // ✅ Validation
    if (
      !fullName || !email || !password || !dateofBirth ||
      !gender || !currentClass || !interestedCourse ||
      !address || !phone
    ) {
      return res.status(400).json({
        message: "All fields are required",
        error: true,
        success: false
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ✅ Phone Number Validation
    const cleanPhone = phone ? phone.toString().trim() : '';
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9",
        error: true,
        success: false
      });
    }

    // ✅ Disposable & Dummy Email Check
    const emailValidation = validateEmail(cleanEmail);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        message: emailValidation.message,
        error: true,
        success: false
      });
    }

    // ✅ Check existing user
    const existinguser = await User.findOne({ email: cleanEmail });
    if (existinguser) {
      return res.status(400).json({
        message: "User is already registered with this email",
        error: true,
        success: false
      });
    }

    // ✅ Hash password
    const hash = await bcrypt.hash(password, 10);

    // ✅ Create user (role FIXED here)
    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      password: hash,
      role: "student",
      dateofBirth,
      gender,
      currentClass,
      interestedCourse,
      address,
      phone,
      isBanned: false,
      isEmailVerified: true
    });

    // Clean up verified email state
    verifiedRegistrationEmails.delete(cleanEmail);

    const token = generateToken(user._id);

    emitNotification("admin_room", "new_student_registered", {
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt
    });

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
      error: true
    });
  }
};



export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        error: true,
        success: false
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ✅ Find user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        error: true,
        success: false
      });
    }

    // 🚫 Check if user account is BANNED
    if (user.isBanned) {
      return res.status(403).json({
        message: user.banReason
          ? `Your account has been banned: ${user.banReason}. Please contact support.`
          : "Your account has been banned by the administration. Please contact support.",
        error: true,
        success: false,
        isBanned: true
      });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        error: true,
        success: false
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role || "user",
        currentClass: user.currentClass || user.className || "11th",
        className: user.className || user.currentClass || "11th"
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
      error: true
    });
  }
};

export const handleStdProfile = async (req, res) => {
  try {
    let updateData = {};

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.profileImage = result.secure_url;

      console.log(result.secure_url, "uploaded image url");
    }

    const studentId = req.body.studentId;

    if (!studentId) {
      return res.status(400).json({
        message: "Student ID is required",
        error: true,
        success: false
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      message: "Profile Updated successfully",
      error: false,
      success: true,
      updatedUser,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false
    });
  }
};

export const Getuser = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        message: "user ID is required",
        success: false,
      });
    }

    const user = await User.findById(studentId)
      .populate({
        path: "enrolledCourses",
        populate: [
          { path: "category" },
          { path: "instructor", select: "fullName email phone role profileImage" }
        ]
      })
      .populate("purchasedTests");

    if (!user) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }

    // Also fetch courses from EnrollStudent to ensure zero enrollment records are missed
    const enrollments = await EnrollStudent.find({
      student: studentId,
      $or: [
        { paymentStatus: "success" },
        { status: "success" }
      ]
    }).populate({
      path: "course",
      populate: [
        { path: "category" },
        { path: "instructor", select: "fullName email phone role profileImage" }
      ]
    });

    const enrolledCourseIds = new Set(
      (user.enrolledCourses || [])
        .map(c => c?._id?.toString() || c?.toString())
        .filter(Boolean)
    );

    const mergedCourses = [...(user.enrolledCourses || [])];

    for (const e of enrollments) {
      if (e.course && e.course._id && !enrolledCourseIds.has(e.course._id.toString())) {
        enrolledCourseIds.add(e.course._id.toString());
        mergedCourses.push(e.course);
      }
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj.enrolledCourses = mergedCourses;

    return res.status(200).json({
      message: "user fetched successfully",
      success: true,
      user: userObj,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
export const EditProfileDetails = async (req, res) => {
  try {
    const { studentId, fullName, email, password, dateofBirth, gender, currentClass,
      interestedCourse, address, phone } = req.body;
    if (!studentId) {
      return res.status(400).json({
        message: "userId is required",
        error: true,
        success: false
      })
    }

    const user = await User.findByIdAndUpdate(studentId, {
      fullName,
      email,
      password,
      dateofBirth,
      gender,
      currentClass,
      interestedCourse,
      address,
      phone
    }, { new: true });
    if (!user) {
      return res.status(404).json({
        message: "user not found",
        error: true,
        success: false
      })
    }

    return res.status(200).json({
      message: "user profile details updated successfully",
      error: false,
      success: true,
      user
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "somthing error",
      success: false,
      error: true
    })
  }
}



const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
export const sendOTPEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validate email format and block disposable domains
    const validation = validateEmail(cleanEmail);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const otp = generateOTP();

    otpStore.set(cleanEmail, {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    const emailSent = await sendOTP(cleanEmail, otp);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check server email credentials or spam folder.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });
  } catch (error) {
    console.error('Error in sendOTPEmail:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const storedData = otpStore.get(cleanEmail);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new one.'
      });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if OTP matches
    if (storedData.otp !== otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP is valid, delete it from store and mark email verified for 15 minutes
    otpStore.delete(cleanEmail);
    verifiedRegistrationEmails.set(cleanEmail, Date.now() + 15 * 60 * 1000);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const otpData = otpStore.get(email);

    if (otpData) {
      return res.status(400).json({
        message: "OTP not verified yet",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getScholarshipTestforStudent = async (req, res, next) => {
  try {
    const student = req.user;

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    let tests = [];
    const isTestAccount = student.email === "student@rootclasses.com" || student.email?.includes("test");
    if (isTestAccount) {
      // Test account gets full access to all mock tests regardless of publish state or class
      tests = await Test.find().sort({ createdAt: -1 });
    } else if (!student.currentClass || student.currentClass === "All") {
      tests = await Test.find({ isPublished: true }).sort({ createdAt: -1 });
    } else {
      const classNum = student.currentClass ? String(student.currentClass).match(/\d+/) : null;
      const classPatterns = [student.currentClass, "All"];
      if (classNum) {
        classPatterns.push(new RegExp(classNum[0], "i"));
      }
      tests = await Test.find({
        $or: [
          { className: { $in: classPatterns } },
          { className: "All" },
          { category: { $in: [/^jee/i, /^neet/i, /^ssc/i, /^defense/i, /^nda/i] } }
        ],
        isPublished: true
      }).sort({ createdAt: -1 });
    }

    if (!tests || tests.length === 0) {
      tests = await Test.find().sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      tests,
    });

  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential, email: directEmail, fullName: directName, googleId: directGoogleId, profileImage, phone } = req.body;

    let email = directEmail;
    let fullName = directName;
    let googleId = directGoogleId;
    let picture = profileImage;

    // Decode Google JWT if passed
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          email = payload.email || email;
          fullName = payload.name || fullName;
          googleId = payload.sub || googleId;
          picture = payload.picture || picture;
        }
      } catch (e) {
        console.error("Error decoding Google credential JWT:", e);
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google email is required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(googleId ? [{ googleId }] : [])
      ]
    });

    if (user) {
      if (user.isBanned) {
        return res.status(403).json({
          success: false,
          isBanned: true,
          message: user.banReason || "Your account has been suspended by administration."
        });
      }

      // Update googleId, phone and verify status if needed
      if (!user.googleId && googleId) user.googleId = googleId;
      if (!user.isEmailVerified) user.isEmailVerified = true;
      if (picture && !user.profileImage) user.profileImage = picture;
      if (phone && !user.phone) user.phone = phone.toString().trim();
      await user.save();

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Signed in with Google successfully",
        token,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone || "",
          currentClass: user.currentClass || "11th",
          profileImage: user.profileImage || ""
        }
      });
    }

    // New User -> Register via Google
    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
    const hash = await bcrypt.hash(randomPassword, 10);

    user = await User.create({
      fullName: (fullName || cleanEmail.split('@')[0]).trim(),
      email: cleanEmail,
      password: hash,
      role: "student",
      googleId: googleId || null,
      authProvider: "google",
      profileImage: picture || "",
      isEmailVerified: true,
      currentClass: "11th",
      interestedCourse: "foundation",
      gender: "other",
      dateofBirth: "2006-01-01",
      phone: phone ? phone.toString().trim() : "",
      isBanned: false
    });

    const token = generateToken(user._id);

    emitNotification("admin_room", "new_student_registered", {
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      authProvider: "google"
    });

    return res.status(201).json({
      success: true,
      message: "Account created and signed in with Google successfully!",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        currentClass: user.currentClass,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error("Google Auth Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to authenticate with Google"
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const defaultAnnouncements = [
      {
        id: "rsat-scholarship-2026",
        title: "RSAT 2026 Scholarship Exam Live",
        message: "Roots Scholarship Admission Test 2026 is Live! Appear online & win up to 100% scholarship on NEET & JEE courses.",
        type: "scholarship",
        image: "/logo.svg",
        link: "/scholarship",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: "target-batches-2026",
        title: "Target 2026-27 New Batches",
        message: "Admissions open for Class 8-10 Foundation, NEET Droppers & IIT-JEE batches. Limited seats available!",
        type: "batch",
        image: "/batch_banner.jpg",
        link: "/comingbatches",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
      {
        id: "free-mock-test-series",
        title: "All India Test Series Uploaded",
        message: "Free full syllabus mock tests and chapter-wise practice tests are now active. Check your rank now!",
        type: "test",
        image: "/thumb_class10_science.jpg",
        link: "/test",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: "roots-welcome",
        title: "Welcome to Roots Classes!",
        message: "Unlock your potential with expert faculties and interactive study resources.",
        type: "info",
        image: "/logo.svg",
        link: "/course",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      }
    ];

    let liveNotifications = [];
    try {
      const tests = await Test.find({ isPublished: true }).sort({ createdAt: -1 }).limit(4).lean();
      tests.forEach(test => {
        liveNotifications.push({
          id: `test-${test._id}`,
          title: `New Test Available: ${test.title}`,
          message: test.description || `Test for ${test.className || 'Students'} is now open. Test duration: ${test.duration || 60} mins.`,
          type: "test",
          image: "/thumb_class10_science.jpg",
          link: "/test",
          createdAt: test.createdAt ? new Date(test.createdAt).toISOString() : new Date().toISOString()
        });
      });
    } catch (e) {
      console.warn("Could not query tests for notifications:", e.message);
    }

    try {
      const { Batch } = await import("../Admin/Batch/batch.model.js");
      const batches = await Batch.find().sort({ createdAt: -1 }).limit(3).lean();
      batches.forEach(b => {
        liveNotifications.push({
          id: `batch-${b._id}`,
          title: `${b.title || 'New Batch'} Starting Soon`,
          message: `${b.domain || 'Course'} batch starting on ${b.startDate || 'upcoming date'}. Timings: ${b.timing || 'Flexible'}.`,
          type: "batch",
          image: b.bannerImg || "/batch_banner.jpg",
          link: "/comingbatches",
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString()
        });
      });
    } catch (e) {
      console.warn("Could not query batches for notifications:", e.message);
    }

    const merged = [...liveNotifications, ...defaultAnnouncements];
    const seen = new Set();
    const finalNotifications = merged.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    return res.status(200).json({
      success: true,
      notifications: finalNotifications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
};
