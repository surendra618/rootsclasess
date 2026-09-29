import mongoose from 'mongoose';
import { Course } from './modules/instructor/createCourse/createCourse.model.js';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

async function updateCoursePrice() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    // Find the Mathematics course shown in the screenshot
    const course = await Course.findOneAndUpdate(
      { title: { $regex: /Mathematics/i } },
      { $set: { price: 1 } },
      { new: true }
    );

    if (course) {
      console.log(`Successfully updated course "${course.title}" to ₹${course.price}`);
    } else {
      console.log("Could not find the Mathematics course to update.");
    }

  } catch (err) {
    console.error("Error updating course:", err);
  } finally {
    await mongoose.disconnect();
  }
}

updateCoursePrice();
