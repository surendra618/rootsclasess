import mongoose from 'mongoose';
import { Testimonial } from './modules/Admin/Testimonial/testimonial.model.js';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

const seedData = [
  {
    name: "Rohan Gupta",
    image: "",
    achievement: "AIR 15 - JEE Advanced",
    Course: "Engineering",
    review: "The constant support from the faculty and the well-planned test series made a huge difference. I could evaluate my weak areas effectively.",
    rating: "5"
  },
  {
    name: "Ananya Desai",
    image: "",
    achievement: "AIR 42 - NEET",
    Course: "Medical",
    review: "I joined the crash course, and it was the best decision! The revision modules and doubt-solving sessions were top-notch and exactly what I needed.",
    rating: "5"
  },
  {
    name: "Vikram Singh",
    image: "",
    achievement: "99.8% in CBSE 12th",
    Course: "Foundation",
    review: "The foundation batch helped me build strong fundamentals. The teachers simplify complex topics effortlessly, making learning enjoyable.",
    rating: "5"
  },
  {
    name: "Meera Patel",
    image: "",
    achievement: "Cleared NDA - 1st Attempt",
    Course: "Defense",
    review: "Apart from the academic syllabus, the guidance for the interview process was phenomenal. Highly recommend this institute to all aspirants.",
    rating: "5"
  },
  {
    name: "Kabir Sharma",
    image: "",
    achievement: "AIR 120 - JEE Mains",
    Course: "Engineering",
    review: "Great environment, competitive peers, and teachers who genuinely care about your success. The recorded lectures were very handy during revision.",
    rating: "4"
  }
];

async function seedTestimonials() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    const inserted = await Testimonial.insertMany(seedData);
    console.log("Successfully inserted", inserted.length, "testimonials!");

  } catch (err) {
    console.error("Error seeding testimonials:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedTestimonials();
