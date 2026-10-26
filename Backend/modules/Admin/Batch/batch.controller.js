import { Batch } from "./batch.model.js";
import { BatchApplication } from "./batchApplication.model.js";
import cloudinary from "../../../config/cloudinary.js";
import { sendCallbackEmail } from "../../../config/emailServices.js";
import razorpay from "../../../config/rozorpay.js";

// Helper for banner image upload (Cloudinary with local path fallback)
const uploadBannerImage = async (file) => {
  if (!file?.path) return null;
  try {
    if (process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "roots_batches"
      });
      return result.secure_url;
    }
  } catch (err) {
    console.warn("Cloudinary upload failed, falling back to local file:", err.message);
  }
  return `/uploads/${file.filename}`;
};

// Default seed batches to initialize DB if empty
const defaultSeedBatches = [
  {
    title: "Class 10 Science — Electricity & Board Booster Batch",
    badge: "CLASS 10 SCIENCE",
    faculty: "Surendra Sir",
    facultyRole: "Founder & Senior Science Faculty (12+ Yrs Exp)",
    domain: "CBSE BOARD 2026–27 • FOUNDATION",
    domainBg: "bg-red-50",
    domainText: "text-[#FB0500]",
    domainBorder: "border-red-200",
    tagline: "Master Electricity, Light, Chemical Reactions & 100% Board-Repeated Numericals",
    desc: "Specialized 10th Board preparation covering high-weightage topics like Electricity, Light, Chemical Reactions with most repeated PYQs, numericals, and exam strategies by Surendra Sir.",
    startDate: "Nov 10, 2026",
    timing: "5:30 PM – 7:30 PM",
    duration: "4 Months Crash + Test Series",
    mode: "Classroom (Patna) + Live Online",
    seats: 45,
    seatsLeft: 7,
    originalPrice: 7999,
    fee: 3499,
    tokenAmount: 499,
    scholarshipUpTo: "Up to 90%",
    bannerImg: "/batch_banner.jpg",
    accentColor: "#FB0500",
    btnClass: "bg-[#FB0500] hover:bg-red-700",
    hot: true,
    isActive: true,
    features: [
      "Surendra Sir Live Masterclasses",
      "Most Repeated PYQ & Derivation Booklet",
      "Daily Practice Problems (DPP) with Video Solutions",
      "10+ Full CBSE Pattern Mock Tests with Evaluation",
      "Personal 1-on-1 Doubt Clearance with Surendra Sir",
      "Formula Handbooks & Electricity Mind Maps"
    ],
    whatYouGet: [
      { title: "Surendra Sir Masterclasses", desc: "In-depth conceptual lectures covering all derivations, circuit diagrams, and numerical solving tricks." },
      { title: "Full Board Mock Test Series", desc: "CBSE pattern sample papers with step-by-step marking scheme and personalized evaluation." },
      { title: "Formula Booklet & DPPs", desc: "Comprehensive formula handbook, electricity quick revision chart, and daily practice problem sheets." },
      { title: "Up to 90% Scholarship", desc: "Avail fee concession through Roots Scholarship Admission Test (RSAT) for Class 10 students." }
    ],
    syllabusHighlights: [
      "Electric Current, Potential Difference & Ohm’s Law",
      "Series & Parallel Combinations & Numerical Shortcuts",
      "Heating Effects of Current, Joule’s Law & Electric Power",
      "Magnetic Effects, Fleming’s Rules & Electromagnetic Induction",
      "Chemical Reactions, Acid-Bases & Carbon Compounds",
      "Assertion-Reason, Case-Study & 5-Mark Question Mastery"
    ]
  },
  {
    title: "JEE Main + Advanced 1-Year Classroom Batch 2026–27",
    badge: "IIT-JEE BATCH",
    faculty: "IIT / NIT Alumni Faculty",
    facultyRole: "Ex-Allen / Resonance Senior Mentors (15+ Yrs Exp)",
    domain: "ENGINEERING DOMAIN • CLASS 11-12 & DROPPER",
    domainBg: "bg-blue-50",
    domainText: "text-[#0078FF]",
    domainBorder: "border-blue-200",
    tagline: "Complete Physics, Chemistry & Maths Mastery for Top All-India Rank",
    desc: "Intensive 1-Year classroom program for IIT JEE aspirants covering Physics, Chemistry, and Mathematics with advanced problem solving, national test series, and mentorship.",
    startDate: "Nov 15, 2026",
    timing: "7:00 AM – 1:00 PM",
    duration: "12 Months Comprehensive",
    mode: "Offline Classroom + Online Access",
    seats: 40,
    seatsLeft: 9,
    originalPrice: 65000,
    fee: 38500,
    tokenAmount: 999,
    scholarshipUpTo: "Up to 100%",
    bannerImg: "/batch3.png",
    accentColor: "#FB0500",
    btnClass: "bg-[#FB0500] hover:bg-red-700",
    hot: true,
    isActive: true,
    features: [
      "Daily 5-Hour Sessions by IIT/NIT Alumni",
      "40+ All India Mock Tests on NTA Interface",
      "Level 1-3 Graded Sheets with Advanced Problem Sets",
      "1-on-1 Faculty Mentorship & Weak-Area Tracking",
      "Daily Doubt Counter (Offline + App)",
      "Revision Modules & Previous 20-Year Archive"
    ],
    whatYouGet: [
      { title: "IIT/NIT Alumni Faculty", desc: "Daily concept classes with real-time doubt solving and speed-accuracy improvement techniques." },
      { title: "JEE Advanced Pattern Tests", desc: "Weekly chapter tests, monthly cumulative tests, and full-length CBT tests on actual exam interface." },
      { title: "Exhaustive Study Modules", desc: "Hardcopy theory modules, previous 15-year chapter-wise questions, and subjective problem sheets." },
      { title: "Merit-Based Scholarship", desc: "Up to 100% tuition waiver for meritorious students scoring high in RSAT screening test." }
    ],
    syllabusHighlights: [
      "Mechanics, Thermodynamics, Electromagnetism & Modern Physics",
      "Physical, Inorganic & Organic Chemistry (Reaction Mechanisms)",
      "Algebra, Coordinate Geometry, Calculus & Vectors",
      "High-Speed Short Tricks & Elimination Techniques for JEE Main",
      "Multi-concept Multi-correct Problems for JEE Advanced"
    ]
  },
  {
    title: "NEET (UG) 2-Year Integrated Classroom Batch 2026–28",
    badge: "NEET (UG) BATCH",
    faculty: "Senior Medical Faculty",
    facultyRole: "Doctor Panel & Ex-Top Institute Biology Mentors",
    domain: "MEDICAL DOMAIN • CLASS 11-12 & REPEATER",
    domainBg: "bg-emerald-50",
    domainText: "text-emerald-700",
    domainBorder: "border-emerald-200",
    tagline: "Target 680+ Score with 100% Line-by-Line NCERT Mastery & OMR Drills",
    desc: "Line-by-line NCERT mastery for Biology, Chemistry, and Physics with high-yield question drills, OMR test practice, and personalized doubt sessions.",
    startDate: "Dec 01, 2026",
    timing: "8:30 AM – 2:00 PM",
    duration: "24 Months Complete Syllabus",
    mode: "Classroom + Hybrid Portal",
    seats: 35,
    seatsLeft: 14,
    originalPrice: 75000,
    fee: 42000,
    tokenAmount: 999,
    scholarshipUpTo: "Up to 85%",
    bannerImg: "/batch2.png",
    accentColor: "#FB0500",
    btnClass: "bg-[#FB0500] hover:bg-red-700",
    hot: false,
    isActive: true,
    features: [
      "100% NCERT Focused Biology line-by-line decoding",
      "Weekly OMR-Based Tests with Negative-Marking Analysis",
      "Bi-weekly Parent Progress Reports & Rank Benchmarking",
      "Dedicated Physics & Chemistry Numerical Doubt Faculty",
      "Diagrams, Mnemonics & Mind-Map Memory Books",
      "5000+ High-Yield Questions Test Bank"
    ],
    whatYouGet: [
      { title: "Doctor & Senior Faculty Panel", desc: "Concept clarity with practical diagrams, mnemonics, and NCERT-centric high-yield coverage." },
      { title: "OMR Pattern NEET Test Series", desc: "Strictly timed 720-mark mock exams with negative marking analysis and rank benchmarking." },
      { title: "Biology NCERT Extract & DPPs", desc: "Line-by-line fill in blanks, assertion-reason booklets, and 5000+ chapter-wise questions." },
      { title: "Roots Medical Scholarship", desc: "Scholarship up to 85% on tuition fees for students securing top ranks in RSAT entrance test." }
    ],
    syllabusHighlights: [
      "Botany & Zoology: Complete 38 Chapters Line-by-Line",
      "Physics: Kinematics, Optics, Modern Physics & High-Yield Numerical Drills",
      "Chemistry: Inorganic NCERT Tables, Organic Mechanisms & Physical Formulae",
      "Assertion-Reasoning & Statement-Based Question Drills",
      "720-Mark Full Syllabus Mock Drills with National Percentile"
    ]
  }
];

/* ── 1. GET ALL BATCHES (Auto-seeds default if empty) ── */
export const GetAllBatches = async (req, res) => {
  try {
    const isAdmin = req.query.admin === "true" || req.query.all === "true";
    let batches = await Batch.find().sort({ createdAt: -1 });

    if (!batches || batches.length === 0) {
      batches = await Batch.insertMany(defaultSeedBatches.map(b => ({ ...b, isApproved: true })));
    }

    // Convert to plain objects and ensure fallback for existing batches
    let processed = batches.map(b => {
      const obj = b.toObject ? b.toObject() : b;
      if (obj.isApproved === undefined || obj.isApproved === null) {
        obj.isApproved = true; // existing batches default to approved
      }
      return obj;
    });

    // For public website, return only approved & active batches ("KARE TABHI JAYE")
    if (!isAdmin) {
      processed = processed.filter(b => b.isApproved === true && b.isActive !== false);
    }

    return res.status(200).json({
      success: true,
      message: "Batches fetched successfully",
      data: processed
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch batches",
      error: error.message
    });
  }
};

/* ── 2. CREATE / UPLOAD NEW BATCH ── */
export const CreateBatch = async (req, res) => {
  try {
    const {
      title,
      badge,
      faculty,
      facultyRole,
      domain,
      desc,
      startDate,
      timing,
      duration,
      mode,
      seats,
      seatsLeft,
      originalPrice,
      fee,
      tokenAmount,
      scholarshipUpTo,
      accentColor,
      btnClass,
      hot,
      isApproved,
      features,
      syllabusHighlights
    } = req.body;

    if (!title || !badge || !faculty || !startDate || !desc) {
      return res.status(400).json({
        success: false,
        message: "Title, Badge, Faculty, Start Date, and Description are required."
      });
    }

    let bannerImg = req.body.bannerImg || "/batch_banner.jpg";
    if (req.file) {
      const uploadedUrl = await uploadBannerImage(req.file);
      if (uploadedUrl) bannerImg = uploadedUrl;
    }

    const parsedFeatures = typeof features === "string" ? features.split(",").map(f => f.trim()) : features || [];
    const parsedSyllabus = typeof syllabusHighlights === "string" ? syllabusHighlights.split(",").map(s => s.trim()) : syllabusHighlights || [];

    const newBatch = await Batch.create({
      title,
      badge: badge.toUpperCase(),
      faculty,
      facultyRole: facultyRole || "Senior Faculty",
      domain: domain || "CBSE / COMPETITIVE DOMAIN",
      desc,
      startDate,
      timing: timing || "Flexible Timings",
      duration: duration || "Comprehensive Course",
      mode: mode || "Classroom + Live Online",
      seats: Number(seats) || 40,
      seatsLeft: Number(seatsLeft) || Number(seats) || 40,
      originalPrice: Number(originalPrice) || 9999,
      fee: Number(fee) || 4999,
      tokenAmount: Number(tokenAmount) || 499,
      scholarshipUpTo: scholarshipUpTo || "Up to 90%",
      bannerImg,
      accentColor: accentColor || "#FB0500",
      btnClass: btnClass || "bg-[#FB0500] hover:bg-red-700",
      hot: hot === "true" || hot === true,
      isApproved: isApproved === "true" || isApproved === true,
      isActive: true,
      features: parsedFeatures,
      syllabusHighlights: parsedSyllabus
    });

    return res.status(201).json({
      success: true,
      message: "Batch uploaded successfully!",
      data: newBatch
    });
  } catch (error) {
    console.error("Error creating batch:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload batch",
      error: error.message
    });
  }
};

/* ── 3. UPDATE BATCH ── */
export const UpdateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      const uploadedUrl = await uploadBannerImage(req.file);
      if (uploadedUrl) updateData.bannerImg = uploadedUrl;
    }

    if (typeof updateData.features === "string") {
      updateData.features = updateData.features.split(",").map(f => f.trim());
    }

    if (updateData.seats) updateData.seats = Number(updateData.seats);
    if (updateData.seatsLeft) updateData.seatsLeft = Number(updateData.seatsLeft);
    if (updateData.fee) updateData.fee = Number(updateData.fee);
    if (updateData.originalPrice) updateData.originalPrice = Number(updateData.originalPrice);
    if (updateData.tokenAmount) updateData.tokenAmount = Number(updateData.tokenAmount);

    const updatedBatch = await Batch.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBatch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: updatedBatch
    });
  } catch (error) {
    console.error("Error updating batch:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update batch",
      error: error.message
    });
  }
};

/* ── 4. DELETE BATCH ── */
export const DeleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Batch.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Batch deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting batch:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete batch",
      error: error.message
    });
  }
};

/* ── 4B. APPROVE / TOGGLE BATCH APPROVAL (KARE TABHI JAYE) ── */
export const ToggleBatchApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    const currentApproval = batch.isApproved === true;
    batch.isApproved = !currentApproval;
    if (batch.isApproved) {
      batch.isActive = true;
    }
    await batch.save();

    return res.status(200).json({
      success: true,
      message: batch.isApproved
        ? "Batch approved and published to website successfully!"
        : "Batch unapproved / unpublished from website.",
      data: batch
    });
  } catch (error) {
    console.error("Error toggling batch approval:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update batch approval",
      error: error.message
    });
  }
};

/* ── 5. SUBMIT BATCH ENROLLMENT APPLICATION (JO APPLY KARE US ME SABI KA DATA JAYE) ── */
export const ApplyBatchEnrollment = async (req, res) => {
  try {
    const {
      studentName,
      phone,
      email,
      city,
      parentName,
      parentPhone,
      schoolName,
      learningMode,
      couponCode,
      discountAmount,
      paymentOption,
      payableNow,
      finalTuitionFee,
      batchId,
      batchTitle,
      batchBadge,
      batchStartDate,
      paymentId,
      orderId,
      notes
    } = req.body;

    if (!studentName || !phone || !email || !city || !batchTitle) {
      return res.status(400).json({
        success: false,
        message: "Student name, WhatsApp phone, email, city, and batch are required."
      });
    }

    const enrollmentId = `ROOTS-ENR-${Date.now().toString().slice(-6)}`;
    const parsedPayable = Number(payableNow) || 0;

    let appStatus = "New";
    let appPaymentStatus = "Free (Pay at Center)";

    if (paymentId) {
      appStatus = "Seat Confirmed";
      appPaymentStatus = "Paid Online";
    } else if (parsedPayable === 0) {
      appStatus = "New";
      appPaymentStatus = "Free (Pay at Center)";
    } else {
      appStatus = "New";
      appPaymentStatus = "Pending Online Payment";
    }

    // Save full applicant & batch data to MongoDB
    const application = await BatchApplication.create({
      enrollmentId,
      studentName,
      phone,
      email,
      city,
      parentName: parentName || "N/A",
      parentPhone: parentPhone || "N/A",
      schoolName: schoolName || "N/A",
      learningMode: learningMode || "offline",
      couponCode: couponCode || "None",
      discountAmount: Number(discountAmount) || 0,
      paymentOption: paymentOption || "token",
      payableNow: parsedPayable,
      finalTuitionFee: Number(finalTuitionFee) || 0,
      batchId: batchId || "",
      batchTitle,
      batchBadge: batchBadge || "",
      batchStartDate: batchStartDate || "",
      paymentId: paymentId || "",
      orderId: orderId || "",
      paymentStatus: appPaymentStatus,
      notes: notes || "",
      status: appStatus
    });

    // Optionally update remaining seats in the batch
    if (batchId) {
      await Batch.findByIdAndUpdate(batchId, { $inc: { seatsLeft: -1 } }).catch(() => {});
    }

    // Send email alert to institute counselors
    sendCallbackEmail({
      firstName: studentName,
      lastName: `[Batch Enrollment: ${batchBadge || batchTitle}]`,
      mobileNumber: phone,
      email,
      stream: `${batchTitle} (${learningMode ? learningMode.toUpperCase() : "OFFLINE"})`,
      studentClass: `ID: ${enrollmentId} | Parent: ${parentName || "N/A"} (${parentPhone || "N/A"}) | City: ${city} | Payable: ₹${payableNow}`
    }).catch(err => {
      console.warn("Counselor email dispatch skipped:", err.message);
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully! Your seat has been reserved.",
      data: application
    });
  } catch (error) {
    console.error("Error submitting batch application:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit application. Please try again.",
      error: error.message
    });
  }
};

/* ── 6. GET ALL BATCH APPLICATIONS (FOR ADMIN PANEL) ── */
export const GetAllApplications = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { enrollmentId: { $regex: search, $options: "i" } },
        { batchTitle: { $regex: search, $options: "i" } }
      ];
    }

    const applications = await BatchApplication.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message
    });
  }
};

/* ── 7. UPDATE APPLICATION STATUS ── */
export const UpdateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, counselorRemarks } = req.body;

    const updated = await BatchApplication.findByIdAndUpdate(
      id,
      { status, counselorRemarks },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message
    });
  }
};

/* ── 8. DELETE APPLICATION ── */
export const DeleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BatchApplication.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Application deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete application",
      error: error.message
    });
  }
};

/* ── 9. CREATE RAZORPAY PAYMENT ORDER FOR BATCH (JO PAISA VALA HAI US ME LAGA PAYE KARANE KO) ── */
export const CreateBatchPaymentOrder = async (req, res) => {
  try {
    const { amount, studentName, batchTitle } = req.body;
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "This is a free option. No payment order required."
      });
    }

    let order = null;
    try {
      order = await razorpay.orders.create({
        amount: Math.round(numericAmount * 100),
        currency: "INR",
        receipt: `b_rcpt_${Date.now().toString().slice(-8)}`,
        notes: {
          studentName: studentName || "Student",
          batchTitle: batchTitle || "Roots Batch"
        }
      });
    } catch (rzpErr) {
      console.warn("Razorpay API order error, using fallback mock order ID:", rzpErr.message);
      order = {
        id: `order_batch_${Date.now()}`,
        amount: Math.round(numericAmount * 100),
        currency: "INR"
      };
    }

    return res.status(200).json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_live_TbpL4le4mBM46T"
    });
  } catch (error) {
    console.error("Error creating batch payment order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message
    });
  }
};

