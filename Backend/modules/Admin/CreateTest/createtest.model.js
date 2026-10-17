import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.Mixed, required: true },
  options: [{ type: mongoose.Schema.Types.Mixed, required: true }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
  marks: { type: Number, default: 1 },
  subject: { type: String, default: "" }
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  totalMarks: { type: Number, default: 0 },
  passingPercentage: { type: Number, default: 70 },
  duration: { type: Number },

  questions: [questionSchema],
  className:{
    type:String,
    enum:["9th","10th","11th","12th","All"],
    default:"11th"
  },
  category: {
    type: String,
    default: "General"
  },
  year: {
    type: String,
    default: function() {
      return new Date().getFullYear().toString();
    }
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  },
  description: { type: String, default: "" },
  isPublished: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 }
}, { timestamps: true });

export const Test = mongoose.model("Test", testSchema);