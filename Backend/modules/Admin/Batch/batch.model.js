import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    badge: {
      type: String,
      required: true,
      trim: true
    },
    faculty: {
      type: String,
      required: true,
      trim: true
    },
    facultyRole: {
      type: String,
      default: "Senior Faculty & Mentor"
    },
    domain: {
      type: String,
      required: true,
      trim: true
    },
    domainBg: {
      type: String,
      default: "bg-red-50"
    },
    domainText: {
      type: String,
      default: "text-[#FB0500]"
    },
    domainBorder: {
      type: String,
      default: "border-red-200"
    },
    tagline: {
      type: String,
      trim: true
    },
    desc: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: String,
      required: true
    },
    timing: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      default: "Classroom (Patna) + Live Online"
    },
    seats: {
      type: Number,
      default: 45
    },
    seatsLeft: {
      type: Number,
      default: 7
    },
    originalPrice: {
      type: Number,
      default: 7999
    },
    fee: {
      type: Number,
      default: 3499
    },
    tokenAmount: {
      type: Number,
      default: 499
    },
    scholarshipUpTo: {
      type: String,
      default: "Up to 90%"
    },
    bannerImg: {
      type: String,
      default: "/batch_banner.jpg"
    },
    accentColor: {
      type: String,
      default: "#FB0500"
    },
    btnClass: {
      type: String,
      default: "bg-[#FB0500] hover:bg-red-700"
    },
    hot: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    features: {
      type: [String],
      default: []
    },
    whatYouGet: [
      {
        title: { type: String },
        desc: { type: String }
      }
    ],
    syllabusHighlights: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export const Batch = mongoose.model("Batch", batchSchema);
