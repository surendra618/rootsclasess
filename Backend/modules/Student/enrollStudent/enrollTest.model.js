import mongoose from "mongoose";

const EnrollTestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
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
    receiptUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

EnrollTestSchema.index(
  { student: 1, test: 1 },
  { unique: true }
);

export const EnrollTest = mongoose.model(
  "EnrollTest",
  EnrollTestSchema
);
