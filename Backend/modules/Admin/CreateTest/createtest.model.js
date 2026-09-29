import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.Mixed, required: true },
  options: [{ type: mongoose.Schema.Types.Mixed, required: true }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
  marks: { type: Number, default: 1 }
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  totalMarks: { type: Number, default: 0 },
  passingPercentage: { type: Number, default: 70 },
  duration: { type: Number },

  questions: [questionSchema],
  className:{
    type:String,
    enum:["9th","10th","11th","12th"],
    required:true
  },

  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export const Test = mongoose.model("Test", testSchema);