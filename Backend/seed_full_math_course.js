import mongoose from 'mongoose';
import { Course } from './modules/instructor/createCourse/createCourse.model.js';
import { Category } from './modules/Admin/category/category.model.js';
import User from './modules/Student/student.model.js';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

async function seedMathCourse() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    // 1. Get or create Mathmatics Category
    let category = await Category.findOne({ name: { $regex: /math/i } });
    if (!category) {
      category = await Category.create({
        name: "Mathmatics",
        description: "Class 10th and 12th Mathematics"
      });
    }

    // 2. Find Instructor or Admin
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.findOne({ role: 'admin' });
    }

    const modules = [
      {
        title: "इकाई 1: संख्या पद्धति एवं प्रारंभिक बीजगणित (Number Systems & Algebra - Part 1)",
        chapters: [
          {
            title: "अध्याय 1: वास्तविक संख्याएँ (Real Numbers)",
            topics: [
              {
                title: "अध्याय 1 परिचय - यूक्लिड विभाजन प्रमेयिका व अंकगणित की आधारभूत प्रमेय",
                description: `<h3>अध्याय 1: वास्तविक संख्याएँ (परिचय)</h3>
<p>इस वीडियो व्याख्यान में कक्षा 10 गणित के प्रथम अध्याय <strong>वास्तविक संख्याएँ (Real Numbers)</strong> का संपूर्ण परिचय दिया गया है।</p>
<ul>
  <li><strong>यूक्लिड विभाजन प्रमेयिका:</strong> दो धनात्मक पूर्णांक a और b दिए रहने पर a = bq + r (जहाँ 0 ≤ r &lt; b)।</li>
  <li><strong>अंकगणित की आधारभूत प्रमेय:</strong> प्रत्येक भाज्य संख्या को अभाज्य संख्याओं के एक अद्वितीय गुणनफल के रूप में व्यक्त किया जा सकता है।</li>
  <li><strong>HCF एवं LCM सूत्र:</strong> HCF(a, b) × LCM(a, b) = a × b</li>
</ul>`,
                notes: `अध्याय 1: वास्तविक संख्याएँ (Real Numbers) - संपूर्ण नोट्स
1. संख्याओं के प्रकार:
   - प्राकृत संख्याएँ (Natural Numbers, N): 1, 2, 3, 4, ...
   - पूर्ण संख्याएँ (Whole Numbers, W): 0, 1, 2, 3, ...
   - पूर्णांक (Integers, Z): ... -3, -2, -1, 0, 1, 2, 3 ...
   - परिमेय संख्याएँ (Rational Numbers, Q): जिन्हें p/q के रूप में लिखा जा सके (q ≠ 0)।
   - अपरिमेय संख्याएँ (Irrational Numbers): जिन्हें p/q के रूप में न लिखा जा सके (जैसे √2, √3, √5, π)।
   - वास्तविक संख्याएँ (Real Numbers, R): सभी परिमेय और अपरिमेय संख्याओं का संग्रह।

2. अंकगणित की आधारभूत प्रमेय:
   प्रत्येक भाज्य संख्या को अभाज्य संख्याओं के गुणनफल के रूप में गुणनखंडित किया जा सकता है।
   उदाहरण: 120 = 2³ × 3¹ × 5¹

3. HCF और LCM संबंध:
   दो संख्याओं a और b के लिए: HCF(a, b) × LCM(a, b) = a × b
   अतः LCM(a, b) = (a × b) / HCF(a, b)`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=QOfDGW_tpvE",
                youtubeUrl: "https://www.youtube.com/watch?v=QOfDGW_tpvE",
                notesUrl: "/uploads/notes/chapter_1_vastavik_sankhyaye.pdf",
                duration: 48,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 1 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh101.pdf" },
                  { title: "Chapter 1 Formula Sheet & Notes", fileUrl: "/uploads/notes/chapter_1_vastavik_sankhyaye.pdf" }
                ]
              },
              {
                title: "प्रश्नावली 1.1 एवं 1.2 - अभाज्य गुणनखंडन, HCF, LCM व अपरिमेय संख्याओं का सत्यापन",
                description: `<h3>प्रश्नावली 1.1 एवं 1.2 हल</h3>
<p>अभाज्य गुणनखंड विधि से HCF और LCM निकालने का अभ्यास तथा सिद्ध करना कि √2, √3, √5 अपरिमेय संख्याएँ हैं।</p>`,
                notes: `प्रश्नावली 1.1 एवं 1.2 महत्वपूर्ण बिंदु:
1. सिद्ध कीजिए कि √5 एक अपरिमेय संख्या है:
   - मान लेते हैं कि √5 एक परिमेय संख्या है।
   - तब √5 = a/b (जहाँ a और b सह-अभाज्य पूर्णांक हैं तथा b ≠ 0)।
   - 5b² = a² => 5, a² को विभाजित करता है => 5, a को भी विभाजित करता है।
   - a = 5c रखने पर: 5b² = 25c² => b² = 5c² => 5, b को विभाजित करता है।
   - अतः 5, a और b दोनों का उभयनिष्ठ गुणनखंड है, जो हमारी पूर्वधारणा का विरोधाभास है।
   - अतः √5 एक अपरिमेय संख्या है। सिद्ध हुआ।`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=YUscmq5Pr1Q",
                youtubeUrl: "https://www.youtube.com/watch?v=YUscmq5Pr1Q",
                notesUrl: "/uploads/notes/chapter_1_vastavik_sankhyaye.pdf",
                duration: 52,
                isPreviewFree: true,
                order: 2,
                resources: [
                  { title: "NCERT Chapter 1 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh101.pdf" }
                ]
              }
            ]
          },
          {
            title: "अध्याय 2: बहुपद (Polynomials)",
            topics: [
              {
                title: "अध्याय 2 परिचय - बहुपद की घात एवं शून्यकों का ज्यामितीय अर्थ",
                description: `<h3>अध्याय 2: बहुपद (परिचय)</h3>
<p>बहुपद की घात (रैखिक, द्विघात, त्रिघात), पद, गुणांक तथा आलेखीय रूप में शून्यकों की संख्या ज्ञात करना।</p>`,
                notes: `अध्याय 2: बहुपद (Polynomials) नोट्स
1. बहुपद की घात (Degree):
   - रैखिक बहुपद: घात 1 (उदा: 2x - 3)
   - द्विघात बहुपद: घात 2 (उदा: ax² + bx + c)
   - त्रिघात बहुपद: घात 3 (उदा: ax³ + bx² + cx + d)

2. शून्यकों का ज्यामितीय अर्थ:
   y = p(x) का ग्राफ x-अक्ष को जितनी बार प्रतिच्छेद करता है, बहुपद के उतने ही वास्तविक शून्यक होते हैं।`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=X5zFPyuAPgQ",
                youtubeUrl: "https://www.youtube.com/watch?v=X5zFPyuAPgQ",
                notesUrl: "/uploads/notes/chapter_2_bahupad.pdf",
                duration: 44,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 2 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh102.pdf" },
                  { title: "Chapter 2 Notes PDF", fileUrl: "/uploads/notes/chapter_2_bahupad.pdf" }
                ]
              },
              {
                title: "बहुपद के शून्यकों और गुणांकों में संबंध एवं प्रश्नावली अभ्यास",
                description: `<h3>शून्यकों और गुणांकों में संबंध</h3>
<p>द्विघात बहुपद ax² + bx + c के शून्यकों का योग (α + β) = -b/a तथा गुणनफल (αβ) = c/a।</p>`,
                notes: `द्विघात बहुपद के शून्यक और संबंध:
- यदि α और β द्विघात बहुपद p(x) = ax² + bx + c के शून्यक हैं, तो:
  1. शून्यकों का योग: α + β = -(x का गुणांक) / (x² का गुणांक) = -b/a
  2. शून्यकों का गुणनफल: α × β = (अचर पद) / (x² का गुणांक) = c/a

- यदि शून्यकों का योग S और गुणनफल P दिया हो, तो बहुपद:
  p(x) = k[x² - Sx + P]`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=X5zFPyuAPgQ",
                youtubeUrl: "https://www.youtube.com/watch?v=X5zFPyuAPgQ",
                notesUrl: "/uploads/notes/chapter_2_bahupad.pdf",
                duration: 40,
                isPreviewFree: true,
                order: 2,
                resources: [
                  { title: "Chapter 2 PDF", fileUrl: "/uploads/notes/chapter_2_bahupad.pdf" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "इकाई 2: बीजगणित भाग - 2 (Algebra - Equations & Progressions)",
        chapters: [
          {
            title: "अध्याय 3: दो चर वाले रैखिक समीकरण युग्म (Pair of Linear Equations)",
            topics: [
              {
                title: "अध्याय 3 परिचय - ग्राफीय विधि एवं हल की स्थितियाँ (संगत/असंगत)",
                description: `<h3>अध्याय 3: दो चर वाले रैखिक समीकरण युग्म</h3>
<p>समीकरणों a₁x + b₁y + c₁ = 0 और a₂x + b₂y + c₂ = 0 की ग्राफीय स्थितियाँ और तुलना।</p>`,
                notes: `दो चर वाले रैखिक समीकरण युग्म:
1. a₁/a₂ ≠ b₁/b₂ => रेखाएं प्रतिच्छेद करेंगी, अद्वितीय हल होगा, समीकरण युग्म संगत है।
2. a₁/a₂ = b₁/b₂ = c₁/c₂ => रेखाएं संपाती होंगी, अपरिमित रूप से अनेक हल होंगे, समीकरण युग्म आश्रित/संगत है।
3. a₁/a₂ = b₁/b₂ ≠ c₁/c₂ => रेखाएं समांतर होंगी, कोई हल नहीं होगा, समीकरण युग्म असंगत है।`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=YicoPnPe0Dk",
                youtubeUrl: "https://www.youtube.com/watch?v=YicoPnPe0Dk",
                notesUrl: "/uploads/notes/chapter_3_do_char_wale_raikhik_samikaran.pdf",
                duration: 55,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 3 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh103.pdf" },
                  { title: "Chapter 3 Notes PDF", fileUrl: "/uploads/notes/chapter_3_do_char_wale_raikhik_samikaran.pdf" }
                ]
              },
              {
                title: "बीजगणितीय विधियाँ - प्रतिस्थापन विधि एवं विलोपन विधि",
                description: `<h3>प्रतिस्थापन एवं विलोपन विधि</h3>
<p>रैखिक समीकरणों को हल करने की तेज और सटीक बीजगणितीय विधियाँ।</p>`,
                notes: `हल करने की विधियाँ:
1. प्रतिस्थापन विधि (Substitution Method): एक समीकरण से किसी एक चर का मान दूसरे चर के पदों में निकालकर दूसरे समीकरण में रखना।
2. विलोपन विधि (Elimination Method): किसी एक चर के गुणांकों को समान बनाकर जोड़ना या घटाना।`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=YicoPnPe0Dk",
                youtubeUrl: "https://www.youtube.com/watch?v=YicoPnPe0Dk",
                notesUrl: "/uploads/notes/chapter_3_do_char_wale_raikhik_samikaran.pdf",
                duration: 45,
                isPreviewFree: true,
                order: 2,
                resources: [
                  { title: "Chapter 3 Notes PDF", fileUrl: "/uploads/notes/chapter_3_do_char_wale_raikhik_samikaran.pdf" }
                ]
              }
            ]
          },
          {
            title: "अध्याय 4: द्विघात समीकरण (Quadratic Equations)",
            topics: [
              {
                title: "अध्याय 4 परिचय - मानक रूप, गुणनखंडन विधि व द्विघाती सूत्र (श्रीधराचार्य सूत्र)",
                description: `<h3>अध्याय 4: द्विघात समीकरण</h3>
<p>मानक रूप ax² + bx + c = 0, गुणनखंडन विधि और द्विघाती सूत्र x = (-b ± √(b² - 4ac))/(2a)।</p>`,
                notes: `अध्याय 4: द्विघात समीकरण नोट्स
1. मानक रूप: ax² + bx + c = 0 (जहाँ a ≠ 0)
2. द्विघाती सूत्र: x = [-b ± √(b² - 4ac)] / (2a)
3. विविक्तकर (Discriminant) D = b² - 4ac:
   - यदि D > 0 => दो भिन्न वास्तविक मूल
   - यदि D = 0 => दो बराबर वास्तविक मूल (x = -b/2a)
   - यदि D < 0 => कोई वास्तविक मूल नहीं`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=f6SUUBqv3nQ",
                youtubeUrl: "https://www.youtube.com/watch?v=f6SUUBqv3nQ",
                notesUrl: "/uploads/notes/chapter_4_dvighat_samikaran.pdf",
                duration: 50,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 4 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh104.pdf" },
                  { title: "Chapter 4 Notes PDF", fileUrl: "/uploads/notes/chapter_4_dvighat_samikaran.pdf" }
                ]
              }
            ]
          },
          {
            title: "अध्याय 5: समांतर श्रेढियाँ (Arithmetic Progressions - AP)",
            topics: [
              {
                title: "अध्याय 5 परिचय - समांतर श्रेढ़ी का n-वाँ पद एवं प्रथम n पदों का योगफल",
                description: `<h3>अध्याय 5: समांतर श्रेढियाँ</h3>
<p>प्रथम पद (a), सार्व अंतर (d), n-वाँ पद an = a + (n - 1)d एवं योग सूत्र Sn = n/2[2a + (n - 1)d] का विस्तृत अध्ययन।</p>`,
                notes: `समांतर श्रेढ़ी (AP) सूत्र एवं संक्षेप:
1. व्यापक रूप: a, a + d, a + 2d, a + 3d, ...
2. सार्व अंतर: d = a₂ - a₁ = a₃ - a₂
3. n-वाँ पद: an = a + (n - 1)d
4. प्रथम n पदों का योग:
   Sn = n/2 [2a + (n - 1)d]
   अथवा Sn = n/2 [a + l] (जहाँ l = अंतिम पद)`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=G4KqmItH6bE",
                youtubeUrl: "https://www.youtube.com/watch?v=G4KqmItH6bE",
                notesUrl: "/uploads/notes/chapter_5_samantar_shredhiya.pdf",
                duration: 56,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 5 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh105.pdf" },
                  { title: "Chapter 5 Notes PDF", fileUrl: "/uploads/notes/chapter_5_samantar_shredhiya.pdf" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "इकाई 3: ज्यामिति एवं निर्देशांक ज्यामिति (Geometry & Coordinate Geometry)",
        chapters: [
          {
            title: "अध्याय 6: त्रिभुज (Triangles)",
            topics: [
              {
                title: "अध्याय 6 परिचय - समरूपता, थेल्स प्रमेय (BPT) एवं समरूपता की कसौटियाँ",
                description: `<h3>अध्याय 6: त्रिभुज</h3>
<p>समरूप त्रिभुज, आधारभूत समानुपातिकता प्रमेय (थेल्स प्रमेय), इसका विलोम तथा AAA, SSS, SAS समरूपता कसौटियाँ।</p>`,
                notes: `अध्याय 6: त्रिभुज (Triangles) नोट्स
1. समरूपता की शर्तें:
   - संगत कोण बराबर हों।
   - संगत भुजाएँ समानुपाती हों।
2. थेल्स प्रमेय (BPT):
   यदि किसी त्रिभुज की एक भुजा के समांतर कोई रेखा खींची जाए, तो वह अन्य दो भुजाओं को समान अनुपात में विभाजित करती है।
   अर्थात AD/DB = AE/EC.
3. समरूपता की कसौटियाँ: AAA (या AA), SSS, SAS.`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=K5UFx46GUDc",
                youtubeUrl: "https://www.youtube.com/watch?v=K5UFx46GUDc",
                notesUrl: "/uploads/notes/chapter_6_tribhuj.pdf",
                duration: 58,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 6 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh106.pdf" },
                  { title: "Chapter 6 Notes PDF", fileUrl: "/uploads/notes/chapter_6_tribhuj.pdf" }
                ]
              }
            ]
          },
          {
            title: "अध्याय 7: निर्देशांक ज्यामिति (Coordinate Geometry)",
            topics: [
              {
                title: "अध्याय 7 परिचय - दूरी सूत्र (Distance Formula) एवं विभाजन सूत्र (Section Formula)",
                description: `<h3>अध्याय 7: निर्देशांक ज्यामिति</h3>
<p>दूरी सूत्र d = √[(x₂ - x₁)² + (y₂ - y₁)²], विभाजन सूत्र एवं मध्य-बिंदु सूत्र का अनुप्रयोग।</p>`,
                notes: `निर्देशांक ज्यामिति सूत्र:
1. दूरी सूत्र: PQ = √[(x₂ - x₁)² + (y₂ - y₁)²]
2. मूल बिंदु (0, 0) से दूरी = √(x² + y²)
3. विभाजन सूत्र:
   x = (m₁x₂ + m₂x₁) / (m₁ + m₂)
   y = (m₁y₂ + m₂y₁) / (m₁ + m₂)
4. मध्य बिंदु सूत्र: ((x₁ + x₂)/2, (y₁ + y₂)/2)`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=2zyFTuNuE-U",
                youtubeUrl: "https://www.youtube.com/watch?v=2zyFTuNuE-U",
                notesUrl: "/uploads/notes/chapter_7_nirdeshank_jyamiti.pdf",
                duration: 47,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 7 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh107.pdf" },
                  { title: "Chapter 7 Notes PDF", fileUrl: "/uploads/notes/chapter_7_nirdeshank_jyamiti.pdf" }
                ]
              }
            ]
          },
          {
            title: "अध्याय 10: वृत्त (Circles)",
            topics: [
              {
                title: "अध्याय 10 परिचय - वृत्त की स्पर्श रेखा, प्रमेय 10.1 व 10.2",
                description: `<h3>अध्याय 10: वृत्त</h3>
<p>वृत्त की स्पर्श रेखाएँ, स्पर्श बिंदु, प्रमेय 10.1 (त्रिज्या लंब होती है) और प्रमेय 10.2 (बाह्य बिंदु से स्पर्श रेखाओं की समानता)।</p>`,
                notes: `वृत्त (Circles) नोट्स:
1. स्पर्श रेखा (Tangent): वह रेखा जो वृत्त को केवल एक बिंदु पर स्पर्श करती है।
2. प्रमेय 10.1: वृत्त के किसी बिंदु पर स्पर्श रेखा, स्पर्श बिंदु से जाने वाली त्रिज्या पर लंब होती है (OP ⊥ AB)।
3. प्रमेय 10.2: बाह्य बिंदु से वृत्त पर खींची गई स्पर्श रेखाओं की लंबाइयाँ बराबर होती हैं (PA = PB)।`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=0h-8R8sW7j0",
                youtubeUrl: "https://www.youtube.com/watch?v=0h-8R8sW7j0",
                notesUrl: "/uploads/notes/chapter_10_vritt.pdf",
                duration: 42,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 10 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh110.pdf" },
                  { title: "Chapter 10 Notes PDF", fileUrl: "/uploads/notes/chapter_10_vritt.pdf" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "इकाई 4: त्रिकोणमिति एवं अनुप्रयोग (Trigonometry & Applications)",
        chapters: [
          {
            title: "अध्याय 8: त्रिकोणमिति का परिचय (Introduction to Trigonometry)",
            topics: [
              {
                title: "अध्याय 8 परिचय - त्रिकोणमितीय अनुपात, मान सारणी एवं सर्वसमिकाएँ",
                description: `<h3>अध्याय 8: त्रिकोणमिति का परिचय</h3>
<p>sin, cos, tan, cosec, sec, cot के सूत्र, 0° से 90° की मान सारणी और मूलभूत सर्वसमिकाएँ।</p>`,
                notes: `त्रिकोणमिति सूत्र एवं सारणी:
1. समकोण त्रिभुज में:
   - sinθ = लंब / कर्ण
   - cosθ = आधार / कर्ण
   - tanθ = लंब / आधार
2. महत्वपूर्ण सर्वसमिकाएँ:
   - sin²θ + cos²θ = 1
   - 1 + tan²θ = sec²θ
   - 1 + cot²θ = cosec²θ`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=JA2lSz5HomA",
                youtubeUrl: "https://www.youtube.com/watch?v=JA2lSz5HomA",
                notesUrl: "/uploads/notes/chapter_8_trikonmiti_ka_parichay.pdf",
                duration: 54,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 8 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh108.pdf" },
                  { title: "Chapter 8 Notes PDF", fileUrl: "/uploads/notes/chapter_8_trikonmiti_ka_parichay.pdf" }
                ]
              }
            ]
          },
          {
            title: "अध्याय 9: त्रिकोणमिति के कुछ अनुप्रयोग (Some Applications of Trigonometry)",
            topics: [
              {
                title: "अध्याय 9 परिचय - ऊँचाई और दूरी, दृष्टि रेखा, उन्नयन व अवनमन कोण",
                description: `<h3>अध्याय 9: ऊँचाई और दूरी</h3>
<p>उन्नयन कोण (Angle of Elevation) और अवनमन कोण (Angle of Depression) पर आधारित व्यावहारिक प्रश्न।</p>`,
                notes: `ऊँचाई और दूरी (Heights & Distances):
1. दृष्टि रेखा: प्रेक्षक की आँख से वस्तु तक जाने वाली रेखा।
2. उन्नयन कोण: जब वस्तु क्षैतिज रेखा से ऊपर हो।
3. अवनमन कोण: जब वस्तु क्षैतिज रेखा से नीचे हो।
4. हल करने का नियम: समकोण त्रिभुज बनाकर tanθ = लंब/आधार का प्रयोग करें।`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=iJACuAXbCPY",
                youtubeUrl: "https://www.youtube.com/watch?v=iJACuAXbCPY",
                notesUrl: "/uploads/notes/chapter_9_trikonmiti_ke_anuprayog.pdf",
                duration: 49,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 9 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh109.pdf" },
                  { title: "Chapter 9 Notes PDF", fileUrl: "/uploads/notes/chapter_9_trikonmiti_ke_anuprayog.pdf" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "इकाई 5: क्षेत्रमिति, सांख्यिकी एवं प्रायिकता (Mensuration, Statistics & Probability)",
        chapters: [
          {
            title: "अध्याय 11: वृत्तों से संबंधित क्षेत्रफल (Areas Related to Circles)",
            topics: [
              {
                title: "अध्याय 11 परिचय - त्रिज्यखंड व वृत्तखंड का क्षेत्रफल एवं चाप की लंबाई",
                description: `<h3>अध्याय 11: वृत्तों से संबंधित क्षेत्रफल</h3>
<p>त्रिज्यखंड का क्षेत्रफल (θ/360) × πr² तथा चाप की लंबाई (θ/360) × 2πr का संपूर्ण अभ्यास।</p>`,
                notes: `वृत्तों से संबंधित क्षेत्रफल सूत्र:
1. वृत्त का क्षेत्रफल = πr², परिधि = 2πr
2. त्रिज्यखंड का क्षेत्रफल = (θ / 360°) × πr²
3. चाप की लंबाई = (θ / 360°) × 2πr
4. वृत्तखंड का क्षेत्रफल = त्रिज्यखंड का क्षेत्रफल - संगत त्रिभुज का क्षेत्रफल`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=mbJUSfxnwJk",
                youtubeUrl: "https://www.youtube.com/watch?v=mbJUSfxnwJk",
                notesUrl: "/uploads/notes/chapter_11_vritto_se_sambandhit_kshetraphal.pdf",
                duration: 46,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 11 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh111.pdf" },
                  { title: "Chapter 11 Notes PDF", fileUrl: "/uploads/notes/chapter_11_vritto_se_sambandhit_kshetraphal.pdf" }
                ]
              }
            ]
          },
          {
            title: "अध्याय 12: पृष्ठीय क्षेत्रफल और आयतन (Surface Areas and Volumes)",
            topics: [
              {
                title: "अध्याय 12 परिचय - ठोसों के संयोजन का पृष्ठीय क्षेत्रफल और आयतन",
                description: `<h3>अध्याय 12: पृष्ठीय क्षेत्रफल और आयतन</h3>
<p>बेलन, शंकु, गोला, अर्धगोला एवं घनाभ के संयोजनों का कुल पृष्ठीय क्षेत्रफल और आयतन।</p>`,
                notes: `ठोसों के पृष्ठीय क्षेत्रफल और आयतन सूत्र:
1. बेलन: CSA = 2πrh, TSA = 2πr(r + h), Volume = πr²h
2. शंकु: l = √(r² + h²), CSA = πrl, TSA = πr(r + l), Volume = 1/3 πr²h
3. गोला: पृष्ठीय क्षेत्रफल = 4πr², आयतन = 4/3 πr³
4. अर्धगोला: CSA = 2πr², TSA = 3πr², आयतन = 2/3 πr³`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=D_s_YtFur2Y",
                youtubeUrl: "https://www.youtube.com/watch?v=D_s_YtFur2Y",
                notesUrl: "/uploads/notes/chapter_12_prishtheey_kshetraphal_aur_aayatan.pdf",
                duration: 53,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 12 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh112.pdf" },
                  { title: "Chapter 12 Notes PDF", fileUrl: "/uploads/notes/chapter_12_prishtheey_kshetraphal_aur_aayatan.pdf" }
                ]
              }
            ]
          },
          {
            title: "अध्याय 13: सांख्यिकी (Statistics)",
            topics: [
              {
                title: "अध्याय 13 परिचय - वर्गीकृत आँकड़ों का माध्य, बहुलक एवं माध्यक",
                description: `<h3>अध्याय 13: सांख्यिकी</h3>
<p>प्रत्यक्ष विधि से माध्य (Mean), बहुलक (Mode) एवं माध्यक (Median) तथा 3 Median = Mode + 2 Mean संबंध।</p>`,
                notes: `सांख्यिकी सूत्र:
1. प्रत्यक्ष विधि से माध्य (x̄) = Σfᵢxᵢ / Σfᵢ
2. बहुलक (Mode) = l + [(f₁ - f₀) / (2f₁ - f₀ - f₂)] × h
3. माध्यक (Median) = l + [(n/2 - cf) / f] × h
4. आनुभविक संबंध: 3 माध्यक = बहुलक + 2 माध्य`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=KFGyOgA-D8E",
                youtubeUrl: "https://www.youtube.com/watch?v=KFGyOgA-D8E",
                notesUrl: "/uploads/notes/chapter_13_sankhyiki.pdf",
                duration: 51,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 13 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh113.pdf" },
                  { title: "Chapter 13 Notes PDF", fileUrl: "/uploads/notes/chapter_13_sankhyiki.pdf" }
                ]
              }
            ]
          },
          {
            title: "अध्याय 14: प्रायिकता (Probability)",
            topics: [
              {
                title: "अध्याय 14 परिचय - प्रायिकता का सैद्धांतिक दृष्टिकोण (सिक्के, पासे व ताश)",
                description: `<h3>अध्याय 14: प्रायिकता</h3>
<p>प्रायिकता का सूत्र P(E) = n(E)/n(S), निश्चित घटना (P=1), असंभव घटना (P=0) एवं पूरक घटनाएँ।</p>`,
                notes: `प्रायिकता (Probability) नोट्स:
1. P(E) = (घटना E के अनुकूल परिणाम) / (सभी संभव परिणाम)
2. 0 ≤ P(E) ≤ 1
3. P(E) + P(not E) = 1
4. ताश की गड्डी में कुल 52 पत्ते (26 लाल, 26 काले), 12 चित्र पत्ते (Face cards)।`,
                videoType: "youtube",
                videoUrl: "https://www.youtube.com/watch?v=MBdZldnmjmY",
                youtubeUrl: "https://www.youtube.com/watch?v=MBdZldnmjmY",
                notesUrl: "/uploads/notes/chapter_14_prayikta.pdf",
                duration: 43,
                isPreviewFree: true,
                order: 1,
                resources: [
                  { title: "NCERT Chapter 14 PDF (Hindi)", fileUrl: "https://ncert.nic.in/textbook/pdf/jhmh114.pdf" },
                  { title: "Chapter 14 Notes PDF", fileUrl: "/uploads/notes/chapter_14_prayikta.pdf" }
                ]
              }
            ]
          }
        ]
      }
    ];

    const coursePayload = {
      title: "कक्षा 10 गणित (Class 10th Maths) - संपूर्ण NCERT कोर्स (हिंदी माध्यम)",
      description: "कक्षा 10वीं गणित का संपूर्ण कोर्स (हिंदी माध्यम)। इसमें NCERT के सभी 14 अध्यायों के क्रमबद्ध वीडियो व्याख्यान, अध्याय-वार विस्तृत नोट्स, महत्वपूर्ण सूत्र और डाउनलोड करने योग्य PDF शामिल हैं। यह कोर्स शत-प्रतिशत निःशुल्क (100% Free) है।",
      category: category._id,
      instructor: instructor?._id,
      instructorName: "Mandeep Sir (Green Board)",
      price: 0,
      status: "approved",
      level: "beginner",
      duration: "45+ Hours",
      modules: modules
    };

    // Update existing "6ad5df7e93223230b9d2f053" or create new
    let course = await Course.findById("6ad5df7e93223230b9d2f053");
    if (course) {
      Object.assign(course, coursePayload);
      await course.save();
      console.log("Updated existing course 6ad5df7e93223230b9d2f053 successfully!");
    } else {
      course = await Course.create(coursePayload);
      console.log("Created brand new course successfully with ID:", course._id);
    }

    console.log("Course seeded successfully!");
    console.log("Course ID:", course._id);
    console.log("Modules count:", course.modules.length);
    let totalTopics = 0;
    course.modules.forEach((m, mi) => {
      m.chapters.forEach((ch, ci) => {
        totalTopics += ch.topics.length;
        console.log(`- Module ${mi+1}, Chapter: ${ch.title} (${ch.topics.length} topics)`);
      });
    });
    console.log("Total topics/lectures seeded:", totalTopics);

  } catch (error) {
    console.error("Error seeding course:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedMathCourse();
