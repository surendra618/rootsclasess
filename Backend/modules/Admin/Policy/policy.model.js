import mongoose from "mongoose";

const policySectionSchema = new mongoose.Schema(
  {
    number: { type: String, default: "" },
    title: { type: String, required: true },
    tagline: { type: String, default: "" },
    content: { type: String, required: true },
    points: [{ type: String }]
  },
  { _id: false }
);

const policyHighlightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  { _id: false }
);

const policySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      enum: ["terms", "privacy"]
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ""
    },
    badge: {
      type: String,
      default: ""
    },
    effectiveDate: {
      type: String,
      default: ""
    },
    highlights: [policyHighlightSchema],
    sections: [policySectionSchema],
    supportEmail: {
      type: String,
      default: "support@rootsclasses.com"
    },
    supportPhone: {
      type: String,
      default: "+91 98765 43210"
    },
    campusAddress: {
      type: String,
      default: "Roots Classes Academic Tower, Ludhiana, Punjab, India"
    },
    pdfUrl: {
      type: String,
      default: ""
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export const Policy = mongoose.model("Policy", policySchema);
