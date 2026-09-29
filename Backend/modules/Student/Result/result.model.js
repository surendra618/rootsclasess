import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },

    obtainedMarks: {
      type: Number,
      default: 0,
    },

    totalMarks: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    isEligible: {
      type: Boolean,
      default: false,
    },

    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswer: Number,
        isCorrect: Boolean,
      },
    ],

    attemptDate: {
      type: Date,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    testStartTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

resultSchema.index({ studentId: 1, testId: 1 }, { unique: true });

export const Result = mongoose.model("Result", resultSchema);