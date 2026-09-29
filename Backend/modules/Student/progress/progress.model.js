import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  completedTopics: [
    {
      topicId: mongoose.Schema.Types.ObjectId,
    },
  ],
}, { timestamps: true });

export const Progress = mongoose.model("progress",progressSchema)