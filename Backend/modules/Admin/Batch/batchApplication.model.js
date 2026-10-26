import mongoose from "mongoose";

const batchApplicationSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    parentName: {
      type: String,
      trim: true
    },
    parentPhone: {
      type: String,
      trim: true
    },
    schoolName: {
      type: String,
      trim: true
    },
    learningMode: {
      type: String,
      enum: ["offline", "online"],
      default: "offline"
    },
    couponCode: {
      type: String,
      trim: true
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    paymentOption: {
      type: String,
      enum: ["token", "full", "counseling"],
      default: "token"
    },
    payableNow: {
      type: Number,
      default: 0
    },
    finalTuitionFee: {
      type: Number,
      default: 0
    },
    batchId: {
      type: String
    },
    batchTitle: {
      type: String,
      required: true
    },
    batchBadge: {
      type: String
    },
    batchStartDate: {
      type: String
    },
    notes: {
      type: String,
      trim: true
    },
    paymentId: {
      type: String,
      default: ""
    },
    orderId: {
      type: String,
      default: ""
    },
    paymentStatus: {
      type: String,
      default: "Free/Pending At Center"
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Seat Confirmed", "Fee Received", "Cancelled"],
      default: "New"
    },
    counselorRemarks: {
      type: String
    }
  },
  { timestamps: true }
);

export const BatchApplication = mongoose.model("BatchApplication", batchApplicationSchema);
