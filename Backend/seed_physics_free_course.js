import mongoose from 'mongoose';
import { Course } from './modules/instructor/createCourse/createCourse.model.js';
import { Category } from './modules/Admin/category/category.model.js';
import User from './modules/Student/student.model.js';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

async function seedPhysicsFreeCourse() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    // 1. Get or create Physics Category
    let category = await Category.findOne({ name: { $regex: /physics/i } });
    if (!category) {
      category = await Category.create({
        name: "Physics",
        description: "Class 11th & 12th Physics, Board Exams, JEE & NEET Preparation"
      });
      console.log("Created Physics Category:", category._id);
    } else {
      console.log("Found existing Physics Category:", category.name, category._id);
    }

    // 2. Find Instructor or Admin
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.findOne({ role: 'admin' });
    }

    const courseData = {
      title: "Class 12 Physics: Electrostatics & Potential Energy (Free Course)",
      description: "Complete Class 12 Physics Masterclass covering Electrostatics, Electric Charges, Fields, Dipole and in-depth Step-by-Step Derivations. Special focus on Potential Energy of a Dipole in Uniform Electric Field for Board, JEE & NEET exams by Roots Classes.",
      price: 0,
      status: "approved",
      category: category._id,
      instructor: instructor ? instructor._id : null,
      instructorName: "Roots Classes Faculty",
      duration: "4.5 Hours",
      level: "intermediate",
      modules: [
        {
          title: "इकाई 1: स्थिर वैद्युतिकी एवं विद्युत क्षेत्र (Electrostatics & Electric Field)",
          chapters: [
            {
              title: "अध्याय 1: विद्युत आवेश तथा क्षेत्र (Electric Charges & Fields)",
              topics: [
                {
                  title: "1.1 विद्युत आवेश, कूलॉम का नियम एवं विद्युत क्षेत्र की तीव्रता",
                  description: `<h3>विद्युत आवेश एवं क्षेत्र परिचय</h3>
<p>आवेश के मूल गुण (क्वाण्टीकरण, संरक्षण), कूलॉम का व्युत्क्रम वर्ग नियम तथा बिंदु आवेश के कारण विद्युत क्षेत्र की तीव्रता का संपूर्ण अध्ययन।</p>`,
                  notes: `1. विद्युत आवेश का क्वाण्टीकरण: q = ±ne (जहाँ e = 1.6 × 10⁻¹⁹ C)
2. कूलॉम का नियम: F = (1 / 4πε₀) × (|q₁q₂| / r²) जहाँ (1 / 4πε₀) = 9 × 10⁹ N·m²/C²
3. विद्युत क्षेत्र की तीव्रता: E = F / q₀`,
                  videoType: "youtube",
                  videoUrl: "https://www.youtube.com/watch?v=9ZKXScNFG_I",
                  youtubeUrl: "https://www.youtube.com/watch?v=9ZKXScNFG_I",
                  duration: 25,
                  isPreviewFree: true,
                  order: 1
                },
                {
                  title: "1.2 विद्युत द्विध्रुव एवं एकसमान विद्युत क्षेत्र में बल आघूर्ण (Torque)",
                  description: `<h3>विद्युत द्विध्रुव एवं बल आघूर्ण</h3>
<p>विद्युत द्विध्रुव आघूर्ण (p = q × 2a) तथा एकसमान विद्युत क्षेत्र में द्विध्रुव पर लगने वाले बल आघूर्ण (τ = pE sin θ) का व्यंजक।</p>`,
                  notes: `1. द्विध्रुव आघूर्ण p = q × 2a (दिशा -q से +q की ओर)
2. एकसमान विद्युत क्षेत्र में नेट बल F_net = 0
3. बल आघूर्ण τ = p × E = pE sin θ`,
                  videoType: "youtube",
                  videoUrl: "https://www.youtube.com/watch?v=9ZKXScNFG_I",
                  youtubeUrl: "https://www.youtube.com/watch?v=9ZKXScNFG_I",
                  duration: 30,
                  isPreviewFree: true,
                  order: 2
                }
              ]
            }
          ]
        },
        {
          title: "इकाई 2: स्थिर वैद्युत विभव एवं द्विध्रुव ऊर्जा (Potential Energy of Dipole)",
          chapters: [
            {
              title: "अध्याय 2: स्थितिज ऊर्जा व्युत्पत्ति (Potential Energy Derivation)",
              topics: [
                {
                  title: "#D16 Potential Energy of a Dipole in a Uniform Electric Field | Step-by-Step Derivation",
                  description: `<h3>#D16 Potential Energy of a Dipole in a Uniform Electric Field</h3>
<p>इस वीडियो में Roots Classes द्वारा कक्षा 12 भौतिक विज्ञान के महत्वपूर्ण डेरिवेशन <strong>'एकसमान विद्युत क्षेत्र में द्विध्रुव की स्थितिज ऊर्जा'</strong> को बहुत ही सरल व विस्तृत तरीके से सिद्ध किया गया है।</p>
<h4>मुख्य बिंदु:</h4>
<ul>
  <li>द्विध्रुव को अल्प कोण dθ घुमाने में किया गया कार्य: <code>dW = τ dθ = pE sin θ dθ</code></li>
  <li>कुल कार्य: <code>W = pE (cos θ₁ - cos θ₂)</code></li>
  <li>मानक स्थिति (θ₁ = 90°) से कोण θ तक स्थितिज ऊर्जा: <code>U = -pE cos θ = -(p · E)</code></li>
  <li>स्थायी साम्यावस्था (Stable Equilibrium): θ = 0° पर U = -pE (न्यूनतम ऊर्जा)</li>
  <li>अस्थायी साम्यावस्था (Unstable Equilibrium): θ = 180° पर U = +pE (अधिकतम ऊर्जा)</li>
</ul>`,
                  notes: `=======================================================
ROOTS CLASSES - CLASS 12 PHYSICS QUICK REVISION NOTES
TOPIC: POTENTIAL ENERGY OF A DIPOLE IN UNIFORM ELECTRIC FIELD
=======================================================

1. परिभाषा (Definition):
   एकसमान विद्युत क्षेत्र में विद्युत द्विध्रुव को मानक स्थिति (θ = 90°) से किसी कोण θ तक घुमाने में बाह्य स्रोत द्वारा किए गए कार्य को उस द्विध्रुव की स्थितिज ऊर्जा कहते हैं।

2. सूत्र व्युत्पत्ति (Step-by-Step Derivation):
   - बल आघूर्ण (Torque): τ = pE sin θ
   - अल्प कोण dθ घुमाने में कार्य: dW = τ dθ = pE sin θ dθ
   - कोण θ₁ से θ₂ तक कुल कार्य:
     W = ∫(θ₁ to θ₂) pE sin θ dθ
     W = pE [-cos θ](θ₁ to θ₂)
     W = pE (cos θ₁ - cos θ₂)
   - मानक स्थिति (Reference state θ₁ = 90°) से कोण θ तक:
     U = W = pE (cos 90° - cos θ)
     U = -pE cos θ
     सदिश रूप (Vector Form):
     U = -(p · E)

3. विशेष स्थितियाँ (Important Cases for Board & NEET/JEE):
   - स्थिति 1 (θ = 0°):
     U = -pE cos(0°) = -pE (न्यूनतम ऊर्जा - स्थायी साम्यावस्था / Stable Equilibrium)
   - स्थिति 2 (θ = 90°):
     U = -pE cos(90°) = 0
   - स्थिति 3 (θ = 180°):
     U = -pE cos(180°) = +pE (अधिकतम ऊर्जा - अस्थायी साम्यावस्था / Unstable Equilibrium)

4. परीक्षा उपयोगी सूत्र:
   - द्विध्रुव आघूर्ण: p = q × 2a (C·m)
   - स्थितिज ऊर्जा: U = -p·E (Joule)`,
                  videoType: "youtube",
                  videoUrl: "https://www.youtube.com/watch?v=9ZKXScNFG_I",
                  youtubeUrl: "https://www.youtube.com/watch?v=9ZKXScNFG_I",
                  duration: 15,
                  isPreviewFree: true,
                  order: 1,
                  resources: [
                    {
                      title: "Roots Classes - Dipole Potential Energy Formula Sheet",
                      fileUrl: "https://youtu.be/9ZKXScNFG_I?si=kQin8HAxT7DBH-AL"
                    }
                  ]
                },
                {
                  title: "2.2 महत्वपूर्ण संख्यात्मक प्रश्न एवं बोर्ड परीक्षा अभ्यास (Board Numericals & Practice)",
                  description: `<h3>बोर्ड परीक्षा एवं प्रतियोगी परीक्षाओं के लिए अभ्यास प्रश्न</h3>
<p>द्विध्रुव को घुमाने में किए गए कार्य तथा स्थितिज ऊर्जा पर आधारित आंकिक प्रश्नों का हल।</p>`,
                  notes: `अभ्यास प्रश्न:
1. 4 × 10⁻⁹ C·m द्विध्रुव आघूर्ण का कोई विद्युत द्विध्रुव 5 × 10⁴ N/C परिमाण के एकसमान विद्युत क्षेत्र की दिशा से 30° पर संरेखित है। द्विध्रुव पर कार्यरत बल आघूर्ण का परिमाण परिकलित कीजिए।
हल:
τ = pE sin θ = (4 × 10⁻⁹) × (5 × 10⁴) × sin 30° = 20 × 10⁻⁵ × (1/2) = 10⁻⁴ N·m.`,
                  videoType: "youtube",
                  videoUrl: "https://www.youtube.com/watch?v=9ZKXScNFG_I",
                  youtubeUrl: "https://www.youtube.com/watch?v=9ZKXScNFG_I",
                  duration: 20,
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
      console.log("Successfully created Free Course with ID:", created._id);
    }

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedPhysicsFreeCourse();
