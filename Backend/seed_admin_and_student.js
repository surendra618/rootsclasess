import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "admin", "instructor"], default: "student" },
  className: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedLoginCredentials() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected successfully!");

    // 1. Create or reset Test Admin Account
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const admin = await User.findOneAndUpdate(
      { email: "admin@rootclasses.com" },
      {
        fullName: "Root Admin",
        email: "admin@rootclasses.com",
        password: adminPasswordHash,
        role: "admin"
      },
      { upsert: true, new: true }
    );

    // 2. Create or reset Test Student Account
    const studentPasswordHash = await bcrypt.hash("student123", 10);
    const student = await User.findOneAndUpdate(
      { email: "student@rootclasses.com" },
      {
        fullName: "Test Student",
        email: "student@rootclasses.com",
        password: studentPasswordHash,
        role: "student",
        className: "11th"
      },
      { upsert: true, new: true }
    );

    // 3. Create or reset Test Instructor Account
    const instructorPasswordHash = await bcrypt.hash("teacher123", 10);
    const teacher = await User.findOneAndUpdate(
      { email: "teacher@rootclasses.com" },
      {
        fullName: "Test Instructor",
        email: "teacher@rootclasses.com",
        password: instructorPasswordHash,
        role: "instructor"
      },
      { upsert: true, new: true }
    );

    console.log("\n==========================================");
    console.log("LOGIN CREDENTIALS CREATED SUCCESSFULLY!");
    console.log("==========================================");
    console.log("ADMIN LOGIN:");
    console.log("  Email:    admin@rootclasses.com");
    console.log("  Password: admin123");
    console.log("------------------------------------------");
    console.log("TEACHER/INSTRUCTOR LOGIN:");
    console.log("  Email:    teacher@rootclasses.com");
    console.log("  Password: teacher123");
    console.log("------------------------------------------");
    console.log("STUDENT LOGIN:");
    console.log("  Email:    student@rootclasses.com");
    console.log("  Password: student123");
    console.log("==========================================\n");

  } catch (err) {
    console.error("Error creating login credentials:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedLoginCredentials();
