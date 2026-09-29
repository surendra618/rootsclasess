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

async function seedTests() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    const testSeedData = [
      {
        title: "NEET Special Mock Test - Physics & Chemistry",
        totalMarks: 100,
        passingPercentage: 60,
        duration: 45,
        className: "11th",
        difficulty: "Medium",
        category: "NEET",
        isPublished: true,
        questions: [
          {
            question: "What is the SI unit of electric current?",
            options: ["Volt", "Ampere", "Ohm", "Watt"],
            correctAnswer: 1,
            marks: 50
          },
          {
            question: "Which of the following is a noble gas?",
            options: ["Oxygen", "Nitrogen", "Helium", "Hydrogen"],
            correctAnswer: 2,
            marks: 50
          }
        ]
      },
      {
        title: "JEE Main Mathematics & Calculus Assessment",
        totalMarks: 100,
        passingPercentage: 70,
        duration: 60,
        className: "11th",
        difficulty: "Hard",
        category: "JEE",
        isPublished: true,
        questions: [
          {
            question: "What is the derivative of sin(x)?",
            options: ["cos(x)", "-cos(x)", "tan(x)", "-sin(x)"],
            correctAnswer: 0,
            marks: 50
          },
          {
            question: "What is the value of log10(100)?",
            options: ["1", "2", "10", "100"],
            correctAnswer: 1,
            marks: 50
          }
        ]
      },
      {
        title: "Comprehensive Foundation Biology & Organic Chemistry",
        totalMarks: 100,
        passingPercentage: 50,
        duration: 30,
        className: "11th",
        difficulty: "Easy",
        category: "Foundation",
        isPublished: true,
        questions: [
          {
            question: "What is the powerhouse of the cell?",
            options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
            correctAnswer: 1,
            marks: 50
          },
          {
            question: "What is the chemical formula of Glucose?",
            options: ["C6H12O6", "H2O", "CO2", "NaCl"],
            correctAnswer: 0,
            marks: 50
          }
        ]
      }
    ];

    const inserted = await Test.insertMany(testSeedData);
    console.log("SUCCESSFULLY_INSERTED_3_TESTS:", inserted.map(t => t.title));

    const totalNow = await Test.countDocuments({ className: "11th", isPublished: true });
    console.log("Total Class 11th tests in DB now:", totalNow);

  } catch (err) {
    console.error("Error seeding tests:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedTests();
