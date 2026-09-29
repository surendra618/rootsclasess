import mongoose from 'mongoose';
import { Course } from './modules/instructor/createCourse/createCourse.model.js';
import { Category } from './modules/Admin/category/category.model.js';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

async function seedMoreCourses() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    // Get a category
    let category = await Category.findOne({});
    if (!category) {
      category = await Category.create({ name: "General", description: "General Category" });
    }

    const coursesData = [
      {
        title: "Test Course - ₹2",
        description: "A premium testing course priced at 2 rupees.",
        price: 2,
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
                  { title: "Topic 1", description: "Introduction", isPreviewFree: false }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "Test Course - ₹3",
        description: "A premium testing course priced at 3 rupees.",
        price: 3,
        status: "approved",
        category: category._id,
        instructorName: "Test Instructor",
        level: "intermediate",
        modules: [
          {
            title: "Module 1",
            chapters: [
              {
                title: "Chapter 1",
                topics: [
                  { title: "Topic 1", description: "Introduction", isPreviewFree: false }
                ]
              }
            ]
          }
        ]
      }
    ];

    const inserted = await Course.insertMany(coursesData);
    console.log("Successfully created", inserted.length, "courses with IDs:", inserted.map(c => c._id));

  } catch (err) {
    console.error("Error creating courses:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedMoreCourses();
