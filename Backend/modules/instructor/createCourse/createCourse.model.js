import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: String,

  videoType: {
    type: String,
    enum: ["upload", "youtube"],
    default: "upload",
  },

  videoUrl: String,
  videoPublicId: String,

  youtubeUrl: String,

  notesUrl: String,
  notesPublicId: String,

  duration: Number,

  isPreviewFree: {
    type: Boolean,
    default: true,
  },

  order: Number,

  resources: [
    {
      title: String,
      fileUrl: String,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topics: [topicSchema],
  createdAt: { type: Date, default: Date.now },
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  chapters: [chapterSchema],
  createdAt: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema({
  title: { type: String},
  description: { type: String },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  instructorName: {
    type: String,
  
  },
    status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  duration: { type: String },
  price: { type: Number, default: null },

  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },

  modules: [moduleSchema],

  createdAt: { type: Date, default: Date.now },
});

export const Course = mongoose.model("Course", courseSchema);