import mongoose from 'mongoose';
import { Course } from './modules/instructor/createCourse/createCourse.model.js';
import { Category } from './modules/Admin/category/category.model.js';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

async function createOneRupeeCourse() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    // Get a category
    let category = await Category.findOne({});
    if (!category) {
      category = await Category.create({ name: "General", description: "General Category" });
    }

    const courseData = {
      title: "Sample Premium Course (₹1)",
      description: "This is a premium course created for testing payments. It costs only 1 rupee.",
      price: 1,
      status: "approved",
      category: category._id,
      instructorName: "Test Instructor",
      level: "beginner",
      modules: [
        {
          title: "Module 1",
          chapters: [
            {
              title: "Chapter 1",
              topics: [
                {
                  title: "Topic 1",
                  description: "Introduction",
                  isPreviewFree: false
                }
              ]
            }
          ]
        }
      ]
    };

    const course = await Course.create(courseData);
    console.log("Successfully created course with ID:", course._id);

  } catch (err) {
    console.error("Error creating course:", err);
  } finally {
    await mongoose.disconnect();
  }
}

createOneRupeeCourse();
