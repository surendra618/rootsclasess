import { sendScholarshipEmail } from '../../../config/emailServices.js';
import { Result } from '../Result/result.model.js';
import User from '../student.model.js';
import Scholarship from './scholarship.model.js';
import { Test } from '../../Admin/CreateTest/createtest.model.js';

export const handleApplyScholarship = async (req, res) => {
    try {
        const {
            studentId,
            phone,
            email,
            lookingForCategory,
            studentClass,
            program
        } = req.body;

        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // 📊 Optional: Check past results if available for analytics
        const studentResults = await Result.find({ studentId });
        const highestPercentage = studentResults.length
            ? Math.max(...studentResults.map(r => r.percentage || 0))
            : 0;

        const existingApplication = await Scholarship.findOne({ studentId });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "Scholarship already applied"
            });
        }

        // validation
        if (!program || !studentClass || !lookingForCategory || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newApplication = await Scholarship.create({
            studentId,
            program,
            studentClass,
            lookingForCategory,
            email: email.toLowerCase(),
            phone,
            status: "pending",
            discount: 0
        });

        await User.findByIdAndUpdate(studentId, {
            scholarshipApplied: newApplication._id
        });

        return res.status(201).json({
            success: true,
            message: "Scholarship application submitted",
            data: newApplication,
            eligibility: {
                eligible: true,
                highestPercentage
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const approveScholarship = async (req, res) => {
    try {
        const { scholarshipId, discount, validFrom, validUntil } = req.body;

        console.log("Received ID:", scholarshipId);

        const scholarship = await Scholarship.findById(scholarshipId);

        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: "Scholarship not found"
            });
        }

        scholarship.status = "approved";
        scholarship.discount = discount || 0;

        if (validFrom) scholarship.validFrom = new Date(validFrom);
        else if (!scholarship.validFrom) scholarship.validFrom = new Date();

        if (validUntil) scholarship.validUntil = new Date(validUntil);
        else if (!scholarship.validUntil) {
            const exp = new Date();
            exp.setDate(exp.getDate() + 90);
            scholarship.validUntil = exp;
        }

        const updated = await scholarship.save();

        try {
            await sendScholarshipEmail(
                scholarship.email,
                scholarship.studentId?.fullName || scholarship.studentId?.name || "Student" 
            );
        } catch (emailErr) {
            console.error("Scholarship email failed:", emailErr.message);
        }

        return res.json({
            success: true,
            message: "Scholarship approved and email sent",
            scholarship: updated
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const rejectScholarship = async (req, res) => {
    try {
        const { scholarshipId, remark } = req.body;

        const scholarship = await Scholarship.findById(scholarshipId);

        if (!scholarship) {
            return res.status(404).json({ message: "Not found" });
        }

        scholarship.status = "rejected";
        scholarship.adminRemark = remark;

        await scholarship.save();

        return res.json({
            success: true,
            message: "Scholarship rejected",
            scholarship
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const grantTestAccess = async (req, res) => {
    try {
        const { scholarshipId, testId } = req.body;

        if (!scholarshipId) {
            return res.status(400).json({ success: false, message: "Scholarship ID is required" });
        }

        const scholarship = await Scholarship.findById(scholarshipId);
        if (!scholarship) {
            return res.status(404).json({ success: false, message: "Scholarship application not found" });
        }

        let assignedTest = null;
        if (testId) {
            assignedTest = await Test.findById(testId);
            if (!assignedTest) {
                return res.status(404).json({ success: false, message: "Selected test not found" });
            }
        } else {
            // Automatically find best matching published scholarship test for this student's class
            const rawClass = String(scholarship.studentClass || '').toLowerCase();
            const classNumMatch = rawClass.match(/\d+/);
            const classNum = classNumMatch ? classNumMatch[0] : null;

            if (classNum) {
                assignedTest = await Test.findOne({
                    isPublished: true,
                    $or: [
                        { className: `${classNum}th` },
                        { className: `${classNum}` },
                        { title: new RegExp(`Class\\s*${classNum}`, 'i') }
                    ],
                    $and: [
                        {
                            $or: [
                                { title: /scholarship/i },
                                { category: /scholarship/i }
                            ]
                        }
                    ]
                });
            }

            if (!assignedTest) {
                // Fallback to general scholarship test
                assignedTest = await Test.findOne({
                    isPublished: true,
                    $or: [
                        { title: /scholarship/i },
                        { category: /scholarship/i }
                    ]
                }).sort({ createdAt: -1 });
            }
        }

        scholarship.testAccessGranted = true;
        scholarship.assignedTest = assignedTest ? assignedTest._id : null;
        scholarship.testAccessGrantedAt = new Date();
        if (req.user?._id) {
            scholarship.testAccessGrantedBy = req.user._id;
        }

        const updated = await scholarship.save();
        await updated.populate("assignedTest", "title className category duration totalMarks questions");
        await updated.populate("studentId", "fullName name email phone currentClass");

        return res.status(200).json({
            success: true,
            message: `Test access granted successfully${assignedTest ? ` (${assignedTest.title})` : ''}`,
            data: updated
        });
    } catch (error) {
        console.error("Error granting test access:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const revokeTestAccess = async (req, res) => {
    try {
        const { scholarshipId } = req.body;
        if (!scholarshipId) {
            return res.status(400).json({ success: false, message: "Scholarship ID is required" });
        }

        const scholarship = await Scholarship.findById(scholarshipId);
        if (!scholarship) {
            return res.status(404).json({ success: false, message: "Scholarship application not found" });
        }

        scholarship.testAccessGranted = false;
        scholarship.assignedTest = null;
        const updated = await scholarship.save();

        return res.status(200).json({
            success: true,
            message: "Test access revoked successfully",
            data: updated
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAvailableScholarshipTests = async (req, res) => {
    try {
        const tests = await Test.find({ isPublished: true })
            .select("title className category duration totalMarks questions")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            tests: tests.map(t => ({
                _id: t._id,
                title: t.title,
                className: t.className,
                category: t.category,
                duration: t.duration || 60,
                totalMarks: t.totalMarks,
                totalQuestions: t.questions?.length || 0,
                isScholarship: (t.title || '').toLowerCase().includes('scholarship') || (t.category || '').toLowerCase().includes('scholarship')
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllScholarshipApplications = async (req, res) => {
    try {
        const scholarships = await Scholarship.find()
            .populate("studentId", "fullName name email phone currentClass")
            .populate("assignedTest", "title className category duration totalMarks questions")
            .sort({ createdAt: -1 });

        // Attach highest test score if available
        const studentIds = scholarships.map(s => s.studentId?._id || s.studentId).filter(Boolean);
        const results = await Result.find({ studentId: { $in: studentIds } });
        
        const resultsMap = new Map();
        results.forEach(r => {
            const sId = String(r.studentId);
            const currentHighest = resultsMap.get(sId);
            const pct = r.percentage ?? 0;
            if (currentHighest === undefined || pct > currentHighest) {
                resultsMap.set(sId, pct);
            }
        });

        const data = scholarships.map(s => {
            const sObj = s.toObject();
            const sId = String(s.studentId?._id || s.studentId);
            sObj.highestTestScore = resultsMap.has(sId) ? resultsMap.get(sId) : null;
            return sObj;
        });

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteScholarship = async (req, res) => {
    try {
        const { scholarshipId } = req.body;
        const deleted = await Scholarship.findByIdAndDelete(scholarshipId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Scholarship not found" });
        }
        await User.findByIdAndUpdate(deleted.studentId, {
            $unset: { scholarshipApplied: "" }
        });
        return res.status(200).json({
            success: true,
            message: "Scholarship application deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getApprovedRejectedScholarships = async (req, res) => {
    try {
        const scholarships = await Scholarship.find(
            { status: { $in: ["approved", "rejected"] } },
            { status: 1, studentId: 1, discount: 1, validFrom: 1, validUntil: 1, adminRemark: 1, testAccessGranted: 1 }
        )
            .populate("studentId", "fullName email");

        return res.status(200).json({
            success: true,
            data: scholarships
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getStudentScholarship = async (req, res, next) => {
    try {
        const studentId = req.body?.studentId || req.user?._id;

        const scholarship = await Scholarship.findOne({
            studentId,
        }).populate("assignedTest", "title className category duration totalMarks questions");

        if (!scholarship) {
            return res.status(200).json({
                success: true,
                hasApplied: false,
                data: null,
            });
        }

        return res.status(200).json({
            success: true,
            hasApplied: true,
            data: scholarship,
        });

    } catch (error) {
        next(error);
    }
};

export const getScholarshipTest = async (req, res, next) => {
    try {
        const studentId = req.user?._id || req.body?.studentId;
        
        let scholarship = null;
        if (studentId) {
            scholarship = await Scholarship.findOne({ studentId }).populate("assignedTest", "title className category duration totalMarks questions");
        }

        let tests = [];
        if (scholarship?.testAccessGranted && scholarship?.assignedTest) {
            // Student has an explicitly assigned test granted by admin
            tests = [scholarship.assignedTest];
        } else {
            // Find published tests specifically marked or titled for scholarship
            const query = {
                isPublished: true,
                $or: [
                    { title: { $regex: /scholarship/i } },
                    { category: { $regex: /scholarship/i } }
                ]
            };
            tests = await Test.find(query).sort({ createdAt: -1 });
        }

        return res.status(200).json({
            success: true,
            hasApplied: !!scholarship,
            testAccessGranted: Boolean(scholarship?.testAccessGranted),
            assignedTest: scholarship?.assignedTest || null,
            scholarship: scholarship || null,
            tests,
            data: tests
        });
    } catch (error) {
        next(error);
    }
};