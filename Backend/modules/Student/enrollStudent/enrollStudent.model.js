import mongoose from "mongoose";

const EnrollStudentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true, 
    },

    orderId: {
      type: String,
      required: true, 
    },

    paymentId: {
      type: String,
    },

    signature: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    enrolledAt: {
      type: Date,
    },

    amount: {
      type: Number,
      required: true,
    },

    originalPrice: {
      type: Number,
    },

    discountApplied: {
      type: Number,
      default: 0,
    },

    receiptUrl: {
      type: String,
    },
  },
  { timestamps: true }
);
EnrollStudentSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

export const EnrollStudent = mongoose.model(
  "EnrollStudent",
  EnrollStudentSchema
);
