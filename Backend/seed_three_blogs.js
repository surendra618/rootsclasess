import mongoose from 'mongoose';
import { Blog } from './modules/Admin/blogs/blogs.model.js';

const mongoUrl = 'mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0';

const newBlogs = [
  {
    title: 'Mastering Class 10th Electricity: Top 10 Most Repeated Numerical & Formulas',
    author: 'Surendra Sir (Founder & Physics HOD)',
    category: 'Exam Prep',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1200&auto=format&fit=crop',
    status: 'published',
    content: `Electricity is one of the highest-weightage chapters in Class 10 Science, carrying between 7 to 9 marks in the CBSE board theory examination. Every year, students lose easy marks on combination circuits and power calculation numericals due to conceptual confusion.\n\nKey Concepts to Master:\n1. Ohm's Law & V-I Graphs: Understand the slope representation of resistance and temperature dependency.\n2. Series vs Parallel Circuits: Master equivalent resistance shortcuts, current division, and potential drop principles.\n3. Joule's Heating Effect (H = I²Rt): Learn real-life applications including heating coils, fuses, and power transmission.\n4. Electric Power (P = VI = I²R = V²/R): Practice unit conversions between Joules and kilowatt-hours (commercial units).\n\nTop Advice from Surendra Sir:\nAlways write given values, formula used, step-by-step substitution with units, and highlight the final answer in a neat box. This guarantees 100% step marks in CBSE board evaluation.`
  },
  {
    title: 'How Ananya Scored 98.4% in CBSE Class 12 Boards with Root Classes',
    author: 'Root Academic Council',
    category: 'Success Stories',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop',
    status: 'published',
    content: `Achieving top percentiles in CBSE Class 12 Boards while preparing for competitive entrance examinations is a major aspiration for thousands of students. Here is how Ananya Sharma, a regular classroom student at Root Classes Ludhiana, scored 98.4% overall with a perfect 100 in Physics.\n\nAnanya's 4-Pillar Routine:\n1. Dedicated NCERT In-depth Reading: Reading NCERT lines and solving all exemplar questions covered 90% of board question patterns.\n2. Daily 30-Minute Derivation Drill: Practicing Gauss's Law, Biot-Savart Law, and Optics derivations without looking at notes.\n3. Weekly Sunday Mock Tests: Taking timed 3-hour mock tests on actual CBSE answer sheets helped eliminate presentation mistakes.\n4. Personalized Mentorship by Surendra Sir: Weekly doubt resolution cleared micro-misconceptions that textbooks couldn't solve.\n\nKey Takeaway for Students:\nConsistency always beats sporadic all-nighters. Maintain a daily timetable and trust the structured curriculum.`
  },
  {
    title: 'Top 7 Memory Techniques to Remember Organic Chemistry Reactions Effortlessly',
    author: 'Chemistry Faculty',
    category: 'Study Tips',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop',
    status: 'published',
    content: `Organic Chemistry often feels like an endless memorization task for students in Class 11, 12, and NEET/JEE preparation. However, once you understand the underlying electronic movements and mechanism logic, you will never need to rote-learn a reaction again.\n\n7 Proven Retention Techniques:\n1. Mechanism Logic over Memorization: Focus on nucleophile vs electrophile interactions instead of blindly memorizing products.\n2. Reaction Flowcharts: Create giant chart papers linking Alkanes -> Alkyl Halides -> Alcohols -> Aldehydes -> Carboxylic Acids.\n3. Flashcards for Named Reactions: Use small flashcards for Aldol Condensation, Cannizzaro, Reimer-Tiemann, and Kolbe reactions.\n4. The 24-Hour Spaced Repetition Rule: Revise any newly learned reaction within 24 hours, then after 3 days, and again after 7 days.\n5. Interconversion Challenges: Challenge yourself to convert simple benzene into complex target molecules in minimum steps.\n6. Color Coding: Use colored pens for functional groups and arrows representing electron pair transfers.\n7. Daily 15-Minute Rapid Recall: Write down 5 random reactions every morning before starting your regular study routine.`
  }
];

async function seed() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    for (const data of newBlogs) {
      const exists = await Blog.findOne({ title: data.title });
      if (!exists) {
        const created = await Blog.create(data);
        console.log('Created blog:', created.title);
      } else {
        console.log('Already exists:', exists.title);
      }
    }

    const total = await Blog.countDocuments();
    console.log('Total blogs now in database:', total);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding blogs:', err);
    process.exit(1);
  }
}

seed();
