import { sendScholarshipEmail } from '../../../config/emailServices.js';
import { Result } from '../Result/result.model.js';
import User from '../student.model.js';
import Scholarship from './scholarship.model.js';

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

        // 📊 Check results
        const studentResults = await Result.find({ studentId });

        if (!studentResults.length) {
            return res.status(403).json({
                success: false,
                message: "Please attempt at least one test"
            });
        }

        const highestPercentage = Math.max(
            ...studentResults.map(r => r.percentage)
        );

        if (highestPercentage < 70) {
            return res.status(403).json({
                success: false,
                message: `Not eligible. Required 70%. Your highest: ${highestPercentage}%`
            });
        }

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
        if (validUntil) scholarship.validUntil = new Date(validUntil);

        const updated = await scholarship.save();

        await sendScholarshipEmail(
            scholarship.email,
            "Student" 
        );

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

export const getApprovedRejectedScholarships = async (req, res) => {
    try {
        const scholarships = await Scholarship.find(
            { status: { $in: ["approved", "rejected"] } },
            { status: 1, studentId: 1, discount: 1, validFrom: 1, validUntil: 1, adminRemark: 1 }
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
        const { studentId } = req.body;

        const scholarship = await Scholarship.findOne({
            studentId,
            status: "approved",
        }).select("discount validFrom validUntil status");

        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: "No approved scholarship found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                discount: scholarship.discount,
                validFrom: scholarship.validFrom,
                validUntil: scholarship.validUntil,
            },
        });

    } catch (error) {
        next(error)
    }
}