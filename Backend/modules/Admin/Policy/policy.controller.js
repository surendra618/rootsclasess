import { Policy } from "./policy.model.js";
import cloudinary from "../../../config/cloudinary.js";

// Get single policy by type ('terms' or 'privacy')
export const getPolicyByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!type || !["terms", "privacy"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid policy type. Must be 'terms' or 'privacy'."
      });
    }

    const policy = await Policy.findOne({ type });

    if (!policy) {
      return res.status(200).json({
        success: false,
        data: null,
        message: `No customized ${type} policy found in database.`
      });
    }

    return res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error("Error fetching policy:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching policy details.",
      error: error.message
    });
  }
};

// Update or Create Policy
export const saveOrUpdatePolicy = async (req, res) => {
  try {
    const {
      type,
      title,
      subtitle,
      badge,
      effectiveDate,
      highlights,
      sections,
      supportEmail,
      supportPhone,
      campusAddress,
      pdfUrl
    } = req.body;

    if (!type || !["terms", "privacy"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Valid policy type ('terms' or 'privacy') is required."
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Policy title is required."
      });
    }

    const updatedPolicy = await Policy.findOneAndUpdate(
      { type },
      {
        type,
        title,
        subtitle: subtitle || "",
        badge: badge || "",
        effectiveDate: effectiveDate || "",
        highlights: Array.isArray(highlights) ? highlights : [],
        sections: Array.isArray(sections) ? sections : [],
        supportEmail: supportEmail || "support@rootsclasses.com",
        supportPhone: supportPhone || "+91 98765 43210",
        campusAddress: campusAddress || "Roots Classes Academic Tower, Ludhiana, Punjab, India",
        pdfUrl: pdfUrl || "",
        lastUpdated: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `${type === "terms" ? "Terms & Conditions" : "Privacy Policy"} saved successfully.`,
      data: updatedPolicy
    });
  } catch (error) {
    console.error("Error saving policy:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving policy details.",
      error: error.message
    });
  }
};

// Upload Policy Document / PDF
export const uploadPolicyPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file provided."
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "roots_classes_policies"
    });

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully.",
      url: result.secure_url
    });
  } catch (error) {
    console.error("Error uploading policy document:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload document file.",
      error: error.message
    });
  }
};

// Get All Policies
export const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({});
    return res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error("Error fetching all policies:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch policies.",
      error: error.message
    });
  }
};
