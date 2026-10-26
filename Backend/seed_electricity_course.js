import mongoose from 'mongoose';
import { Course } from './modules/instructor/createCourse/createCourse.model.js';
import { Category } from './modules/Admin/category/category.model.js';
import User from './modules/Student/student.model.js';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

async function seedElectricityCourse() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    // 1. Get or create Science/Physics Category
    let category = await Category.findOne({ name: { $regex: /science/i } });
    if (!category) {
      category = await Category.findOne({ name: { $regex: /physics/i } });
    }
    if (!category) {
      category = await Category.create({
        name: "Class 10 Science",
        description: "Class 10th Science, Physics, Chemistry & Biology for Board Exams"
      });
      console.log("Created Category:", category._id);
    } else {
      console.log("Found existing Category:", category.name, category._id);
    }

    // 2. Find Instructor or Admin
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.findOne({ role: 'admin' });
    }

    const courseData = {
      title: "Class 10 Science: Score 100% in Electricity (Most Repeated Board Questions)",
      description: "Comprehensive Class 10 Science Masterclass on Electricity by Akash Sir (Roots Classes). Covers Ohm's Law, Series & Parallel Combinations, Heating Effect, Electric Power and in-depth solving of the Most Repeated CBSE Board Questions & Numericals.",
      price: 0,
      status: "approved",
      category: category._id,
      instructor: instructor ? instructor._id : null,
      instructorName: "Akash Sir (Roots Classes)",
      duration: "5.5 Hours",
      level: "beginner",
      modules: [
        {
          title: "इकाई 1: विद्युत धारा एवं परिपथ सिद्धांत (Electricity & Circuit Fundamentals)",
          chapters: [
            {
              title: "अध्याय 1: विद्युत आवेश, विभव एवं ओम का नियम (Current, Potential & Ohm's Law)",
              topics: [
                {
                  title: "1.1 विद्युत धारा, विद्युत विभव एवं परिपथ आरेख (Current & Potential Difference)",
                  description: `<h3>विद्युत धारा एवं विभवांतर परिचय</h3>
<p>विद्युत आवेश (Q = ne), विद्युत धारा (I = Q/t) की परिभाषा व मात्रक (एम्पीयर), विद्युत विभवांतर (V = W/Q) तथा वोल्टमीटर व एमीटर का परिपथ में संयोजन।</p>`,
                  notes: `1. विद्युत आवेश: Q = ±ne (1 कूलॉम में 6.25 × 10¹⁸ इलेक्ट्रान होते हैं)
2. विद्युत धारा: I = Q / t (मात्रक: एम्पीयर, A)
   - 1 A = 1 C / 1 s
   - धारा मापने वाला यंत्र: ऐमीटर (सदैव श्रेणीक्रम में जुड़ता है, इसका प्रतिरोध बहुत कम होता है)
3. विद्युत विभवांतर: V = W / Q (मात्रक: वोल्ट, V)
   - विभवांतर मापने वाला यंत्र: वोल्टमीटर (सदैव समांतर क्रम में जुड़ता है, इसका प्रतिरोध बहुत अधिक होता है)`,
                  videoType: "youtube",
                  videoUrl: "https://www.youtube.com/watch?v=JqaUm9BAnqo",
                  youtubeUrl: "https://www.youtube.com/watch?v=JqaUm9BAnqo",
                  duration: 35,
                  isPreviewFree: true,
                  order: 1
                },
                {
                  title: "1.2 ओम का नियम एवं प्रतिरोध को प्रभावित करने वाले कारक (Ohm's Law & Factors of Resistance)",
                  description: `<h3>ओम का नियम एवं प्रतिरोधकता</h3>
<p>ओम का नियम (V ∝ I ⇒ V = IR), V-I ग्राफ, प्रतिरोध (R) और विशिष्ट प्रतिरोध/प्रतिरोधकता (ρ) का संबंध: R = ρ(l / A)।</p>`,
                  notes: `1. ओम का नियम: नियत ताप पर किसी चालक से प्रवाहित धारा, उसके सिरों के विभवांतर के अनुक्रमानुपाती होती है:
   V = IR  =>  R = V / I (मात्रक: ओम, Ω)
2. प्रतिरोध को प्रभावित करने वाले कारक:
   - चालक की लंबाई (l) के अनुक्रमानुपाती: R ∝ l
   - चालक के अनुप्रस्थ काट क्षेत्रफल (A) के व्युत्क्रमानुपाती: R ∝ 1/A
   - सूत्र: R = ρ (l / A) जहाँ ρ = पदार्थ की प्रतिरोधकता (मात्रक: Ω·m)`,
                  videoType: "youtube",
                  videoUrl: "https://www.youtube.com/watch?v=JqaUm9BAnqo",
                  youtubeUrl: "https://www.youtube.com/watch?v=JqaUm9BAnqo",
                  duration: 40,
                  isPreviewFree: true,
                  order: 2
                }
              ]
            }
          ]
        },
        {
          title: "इकाई 2: बोर्ड परीक्षा स्पेशल लाइव क्लास (Board Exam Special Masterclass)",
          chapters: [
            {
              title: "अध्याय 2: मोस्ट रिपीटेड बोर्ड प्रश्न एवं न्यूमेरिकल ट्रिक्स (Most Repeated Questions by Akash Sir)",
              topics: [
                {
                  title: "🔴 Score 100% in Electricity! ⚡ Class 10 Most Repeated Board Questions | Akash Sir",
                  description: `<h3>🔴 Score 100% in Electricity! - Class 10 CBSE Board Masterclass</h3>
<p>Roots Classes के वरिष्ठ शिक्षक <strong>Akash Sir</strong> द्वारा प्रस्तुत इस विशेष लाइव सत्र में कक्षा 10 विज्ञान के अध्याय <strong>'Electricity'</strong> के पिछले 10 वर्षों में बार-बार पूछे गए अति महत्वपूर्ण प्रश्नों का लाइव समाधान कराया गया है।</p>
<h4>क्लास की मुख्य विशेषताएं:</h4>
<ul>
  <li><strong>श्रेणीक्रम व समांतर क्रम संयोजन:</strong> जटिल परिपथों में समतुल्य प्रतिरोध निकालने के शॉर्टकट तरीके।</li>
  <li><strong>विद्युत धारा का तापीय प्रभाव (Joule's Heating Effect):</strong> <code>H = I²Rt</code> पर आधारित प्रश्न।</li>
  <li><strong>विद्युत शक्ति व यूनिट गणना:</strong> <code>P = VI = I²R = V²/R</code> तथा 1 kWh = 3.6 × 10⁶ J पर बिजली खपत के सवाल।</li>
  <li><strong>बोर्ड परीक्षा 2026-27 के टॉप संभावित प्रश्न (PYQs)।</strong></li>
</ul>`,
                  notes: `=======================================================
ROOTS CLASSES - CLASS 10 SCIENCE (ELECTRICITY) FORMULA SHEET
BY AKASH SIR
=======================================================

1. आवेश एवं धारा:
   - Q = ne (e = 1.6 × 10⁻¹⁹ C)
   - I = Q / t

2. विभवांतर एवं ओम का नियम:
   - V = W / Q
   - V = IR  =>  R = V / I

3. प्रतिरोध के संयोजन:
   - श्रेणीक्रम (Series): R_eq = R₁ + R₂ + R₃ (धारा समान, विभवांतर बँटता है)
   - समांतर क्रम (Parallel): 1/R_eq = 1/R₁ + 1/R₂ + 1/R₃ (विभवांतर समान, धारा बँटती है)

4. विद्युत ऊर्जा एवं तापीय प्रभाव:
   - H = W = VIt = I²Rt = (V² / R) t (जूल का तापन नियम)

5. विद्युत शक्ति (Electric Power):
   - P = W / t = VI = I²R = V² / R (मात्रक: वाट, W)
   - 1 किलोवाट (kW) = 1000 W
   - व्यापारिक मात्रक: 1 यूनिट = 1 kWh = 1000 W × 3600 s = 3.6 × 10⁶ J (3.6 MJ)

6. बोर्ड परीक्षा में अंक प्राप्त करने के गोल्डन टिप्स:
   - परिपथ आरेख में तीर का निशान (धारा की दिशा: धनात्मक से ऋणात्मक) अवश्य लगाएं।
   - सभी आंकिक प्रश्नों में सूत्र, गणना तथा अंतिम उत्तर के साथ SI मात्रक जरूर लिखें।`,
                  videoType: "youtube",
                  videoUrl: "https://www.youtube.com/watch?v=JqaUm9BAnqo",
                  youtubeUrl: "https://www.youtube.com/watch?v=JqaUm9BAnqo",
                  duration: 85,
                  isPreviewFree: true,
                  order: 1,
                  resources: [
                    {
                      title: "Electricity Class 10 - Formula & PYQ Sheet (Roots Classes)",
                      fileUrl: "https://www.youtube.com/live/JqaUm9BAnqo?si=503BN2wwV2UsUteu"
                    }
                  ]
                },
                {
                  title: "2.2 सर्किट आंकिक प्रश्न एवं अभ्यास सेट (Circuit Numericals & PYQ Test)",
                  description: `<h3>सर्किट डायग्राम एवं आंकिक प्रश्नों का विशेष अभ्यास</h3>
<p>कक्षा 10 बोर्ड परीक्षा में पूछे जाने वाले 5-अंक वाले मिश्रित परिपथ प्रश्नों का अभ्यास।</p>`,
                  notes: `महत्वपूर्ण अभ्यास प्रश्न:
1. तीन प्रतिरोधक 2 Ω, 3 Ω तथा 6 Ω को किस प्रकार संयोजित करेंगे कि कुल प्रतिरोध (a) 4 Ω और (b) 1 Ω प्राप्त हो?
हल:
(a) 3 Ω और 6 Ω को समांतर क्रम में जोड़े (R_p = (3×6)/(3+6) = 2 Ω), फिर इसे 2 Ω के साथ श्रेणीक्रम में जोड़े => 2 + 2 = 4 Ω.
(b) तीनों को समांतर क्रम में जोड़े => 1/R = 1/2 + 1/3 + 1/6 = 6/6 = 1 => R = 1 Ω.`,
                  videoType: "youtube",
                  videoUrl: "https://www.youtube.com/watch?v=JqaUm9BAnqo",
                  youtubeUrl: "https://www.youtube.com/watch?v=JqaUm9BAnqo",
                  duration: 45,
                  isPreviewFree: true,
                  order: 2
                }
              ]
            }
          ]
        }
      ]
    };

    // Check if course already exists to avoid duplicate
    const existing = await Course.findOne({ title: courseData.title });
    if (existing) {
      await Course.findByIdAndUpdate(existing._id, courseData);
      console.log("Updated existing course with ID:", existing._id);
    } else {
      const created = await Course.create(courseData);
      console.log("Successfully created Electricity Course with ID:", created._id);
    }

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedElectricityCourse();
