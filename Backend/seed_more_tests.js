import mongoose from 'mongoose';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

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
  className: {
    type: String,
    enum: ["9th", "10th", "11th", "12th"],
    required: true
  },
  difficulty: { type: String, default: "Medium" },
  category: { type: String, default: "General" },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

const Test = mongoose.model("Test", testSchema);

async function seedMoreTests() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    const testSeedData = [
      {
        title: "CBSE Class 10th Board Pattern Test - Science",
        totalMarks: 80,
        passingPercentage: 33,
        duration: 180,
        className: "10th",
        difficulty: "Hard",
        category: "CBSE Boards",
        isPublished: true,
        questions: [
          {
            question: "Which of the following is a balanced chemical equation?",
            options: ["H2 + O2 -> H2O", "2H2 + O2 -> 2H2O", "H2 + O2 -> 2H2O", "2H2 + O2 -> H2O"],
            correctAnswer: 1,
            marks: 40
          },
          {
            question: "What is the SI unit of power of a lens?",
            options: ["Meter", "Diopter", "Watt", "Joule"],
            correctAnswer: 1,
            marks: 40
          }
        ]
      },
      {
        title: "NDA Foundation Mock Test - Mathematics",
        totalMarks: 120,
        passingPercentage: 40,
        duration: 90,
        className: "12th",
        difficulty: "Medium",
        category: "Defense",
        isPublished: true,
        questions: [
          {
            question: "What is the value of i^4?",
            options: ["1", "-1", "i", "-i"],
            correctAnswer: 0,
            marks: 60
          },
          {
            question: "The probability of an impossible event is:",
            options: ["1", "0", "0.5", "-1"],
            correctAnswer: 1,
            marks: 60
          }
        ]
      }
    ];

    const inserted = await Test.insertMany(testSeedData);
    console.log("SUCCESSFULLY_INSERTED_2_MORE_TESTS:", inserted.map(t => t.title));

  } catch (err) {
    console.error("Error seeding tests:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedMoreTests();
