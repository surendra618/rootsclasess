import mongoose from 'mongoose';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

const questionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.Mixed, required: true },
  options: [{ type: mongoose.Schema.Types.Mixed, required: true }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
  marks: { type: Number, default: 1 },
  subject: { type: String, default: "" }
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  totalMarks: { type: Number, default: 0 },
  passingPercentage: { type: Number, default: 50 },
  duration: { type: Number },
  questions: [questionSchema],
  className: { type: String, default: "All" },
  difficulty: { type: String, default: "Medium" },
  category: { type: String, default: "General" },
  year: { type: String, default: "2026" },
  description: { type: String, default: "" },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

const Test = mongoose.model("Test", testSchema);

const neetQuestions = [
  // --- PHYSICS (5 Questions) ---
  {
    subject: "Physics",
    question: "A stone is dropped from a tower of height 80 m. How much time does it take to reach the ground? (Take g = 10 m/s²)",
    options: ["2 s", "4 s", "6 s", "8 s"],
    correctAnswer: "4 s",
    marks: 4
  },
  {
    subject: "Physics",
    question: "The de Broglie wavelength of an electron accelerated through a potential difference of 100 V is approximately:",
    options: ["1.227 Å", "0.123 Å", "12.27 Å", "122.7 Å"],
    correctAnswer: "1.227 Å",
    marks: 4
  },
  {
    subject: "Physics",
    question: "A convex lens of focal length 20 cm is placed in contact with a concave lens of focal length 40 cm. The power of the combination is:",
    options: ["+2.5 D", "-2.5 D", "+5.0 D", "+1.25 D"],
    correctAnswer: "+2.5 D",
    marks: 4
  },
  {
    subject: "Physics",
    question: "The work function of a photosensitive metal is 4.0 eV. What is the minimum threshold frequency required for photoelectric emission? (h = 6.63 × 10⁻³⁴ J·s, 1 eV = 1.6 × 10⁻¹⁹ J)",
    options: ["9.65 × 10¹⁴ Hz", "5.45 × 10¹⁴ Hz", "2.12 × 10¹⁴ Hz", "1.60 × 10¹⁴ Hz"],
    correctAnswer: "9.65 × 10¹⁴ Hz",
    marks: 4
  },
  {
    subject: "Physics",
    question: "In an adiabatic process of an ideal gas, the pressure and volume are related by PV^γ = constant. If the gas expands to 8 times its initial volume and γ = 5/3, the final pressure is:",
    options: ["1/32 of initial pressure", "1/16 of initial pressure", "1/8 of initial pressure", "1/64 of initial pressure"],
    correctAnswer: "1/32 of initial pressure",
    marks: 4
  },

  // --- CHEMISTRY (5 Questions) ---
  {
    subject: "Chemistry",
    question: "Which of the following carbocations is the most stable due to hyperconjugation and inductive effect?",
    options: ["(CH₃)₃C⁺ (tert-Butyl)", "(CH₃)₂CH⁺ (Isopropyl)", "CH₃CH₂⁺ (Ethyl)", "CH₃⁺ (Methyl)"],
    correctAnswer: "(CH₃)₃C⁺ (tert-Butyl)",
    marks: 4
  },
  {
    subject: "Chemistry",
    question: "Which of the following compounds exhibits optical isomerism (chirality)?",
    options: ["2-Chlorobutane", "1-Chlorobutane", "2-Chloropropane", "Ethanol"],
    correctAnswer: "2-Chlorobutane",
    marks: 4
  },
  {
    subject: "Chemistry",
    question: "According to Le Chatelier's principle, an increase in pressure on the gaseous system N₂(g) + 3H₂(g) ⇌ 2NH₃(g) at equilibrium will:",
    options: ["Shift equilibrium in forward direction", "Shift equilibrium in backward direction", "Have no effect on equilibrium", "Completely decompose NH₃"],
    correctAnswer: "Shift equilibrium in forward direction",
    marks: 4
  },
  {
    subject: "Chemistry",
    question: "The hybridization and shape of the XeF₄ molecule are respectively:",
    options: ["sp³d², Square Planar", "sp³d, See-saw", "sp³, Tetrahedral", "sp³d², Octahedral"],
    correctAnswer: "sp³d², Square Planar",
    marks: 4
  },
  {
    subject: "Chemistry",
    question: "What is the pH of a 0.005 M H₂SO₄ aqueous solution at 25°C assuming complete dissociation?",
    options: ["2.0", "3.0", "1.0", "4.0"],
    correctAnswer: "2.0",
    marks: 4
  },

  // --- BIOLOGY - BOTANY (5 Questions) ---
  {
    subject: "Biology - Botany",
    question: "In angiospermic plants, double fertilization refers to the simultaneous fusion of:",
    options: [
      "One sperm with egg cell (syngamy) and other sperm with secondary diploid nucleus (triple fusion)",
      "Two sperms simultaneously with the single egg cell",
      "One sperm with synergid cell and one with antipodal cell",
      "Pollen tube directly fusing with the chalaza"
    ],
    correctAnswer: "One sperm with egg cell (syngamy) and other sperm with secondary diploid nucleus (triple fusion)",
    marks: 4
  },
  {
    subject: "Biology - Botany",
    question: "Which plant hormone is primarily responsible for inducing apical dominance in growing shoots?",
    options: ["Auxin (IAA)", "Gibberellic Acid (GA3)", "Cytokinin", "Abscisic Acid (ABA)"],
    correctAnswer: "Auxin (IAA)",
    marks: 4
  },
  {
    subject: "Biology - Botany",
    question: "The first stable product formed during the dark reaction (Calvin cycle) of C3 plants is:",
    options: ["3-Phosphoglyceric acid (3-PGA)", "Oxaloacetic acid (OAA)", "Phosphoenolpyruvate (PEP)", "Ribulose-1,5-bisphosphate"],
    correctAnswer: "3-Phosphoglyceric acid (3-PGA)",
    marks: 4
  },
  {
    subject: "Biology - Botany",
    question: "During which phase of meiosis do homologous chromosomes undergo crossing over (chiasma formation)?",
    options: ["Pachytene", "Leptotene", "Zygotene", "Diplotene"],
    correctAnswer: "Pachytene",
    marks: 4
  },
  {
    subject: "Biology - Botany",
    question: "Which of the following is considered the vascular tissue responsible for bidirectional translocation of organic food in plants?",
    options: ["Phloem", "Xylem Vessels", "Tracheids", "Sclerenchyma"],
    correctAnswer: "Phloem",
    marks: 4
  },

  // --- BIOLOGY - ZOOLOGY (5 Questions) ---
  {
    subject: "Biology - Zoology",
    question: "Which chamber of the human heart possesses the thickest muscular wall and pumps oxygenated blood into the aorta?",
    options: ["Left Ventricle", "Right Ventricle", "Left Atrium", "Right Atrium"],
    correctAnswer: "Left Ventricle",
    marks: 4
  },
  {
    subject: "Biology - Zoology",
    question: "Erythropoietin (EPO), a hormone that stimulates red blood cell (erythrocyte) production in bone marrow, is mainly produced by:",
    options: ["Juxtaglomerular cells of kidneys", "Hepatocytes of liver", "Follicles of thyroid gland", "Beta cells of pancreas"],
    correctAnswer: "Juxtaglomerular cells of kidneys",
    marks: 4
  },
  {
    subject: "Biology - Zoology",
    question: "Which of the following pairs of hormones regulates blood calcium levels antagonistically in humans?",
    options: ["Parathyroid hormone (PTH) and Calcitonin", "Insulin and Glucagon", "Thyroxine and Triiodothyronine", "Aldosterone and ANF"],
    correctAnswer: "Parathyroid hormone (PTH) and Calcitonin",
    marks: 4
  },
  {
    subject: "Biology - Zoology",
    question: "In the human digestive tract, the inactive enzyme Pepsinogen is converted into active Pepsin by the action of:",
    options: ["Hydrochloric acid (HCl)", "Enterokinase", "Bile salts", "Trypsin"],
    correctAnswer: "Hydrochloric acid (HCl)",
    marks: 4
  },
  {
    subject: "Biology - Zoology",
    question: "Which of the following is an example of homologous organs indicating divergent evolution?",
    options: [
      "Forelimbs of human, bat, cheetah, and whale",
      "Wings of butterfly and wings of birds",
      "Eye of octopus and eye of mammal",
      "Flippers of penguin and flippers of dolphin"
    ],
    correctAnswer: "Forelimbs of human, bat, cheetah, and whale",
    marks: 4
  }
];

const jeeQuestions = [
  // --- MATHEMATICS (5 Questions) ---
  {
    subject: "Mathematics",
    question: "If matrix A = [[2, 1], [3, 4]], then what is the value of the determinant |A|?",
    options: ["5", "8", "-5", "11"],
    correctAnswer: "5",
    marks: 4
  },
  {
    subject: "Mathematics",
    question: "Evaluate the limit: lim(x → 0) [sin(5x) / (2x)]:",
    options: ["5/2", "2/5", "1", "0"],
    correctAnswer: "5/2",
    marks: 4
  },
  {
    subject: "Mathematics",
    question: "The value of the definite integral ∫ from 0 to π/2 of [sin(x) / (sin(x) + cos(x))] dx is:",
    options: ["π/4", "π/2", "π", "0"],
    correctAnswer: "π/4",
    marks: 4
  },
  {
    subject: "Mathematics",
    question: "Find the angle between two unit vectors a and b if |a + b| = √3:",
    options: ["π/3 (60°)", "π/6 (30°)", "π/2 (90°)", "2π/3 (120°)"],
    correctAnswer: "π/3 (60°)",
    marks: 4
  },
  {
    subject: "Mathematics",
    question: "How many distinct terms are there in the binomial expansion of (x + y + z)¹⁰?",
    options: ["66", "55", "78", "121"],
    correctAnswer: "66",
    marks: 4
  },

  // --- PHYSICS (5 Questions) ---
  {
    subject: "Physics",
    question: "A block of mass 2 kg rests on a rough horizontal surface with coefficient of static friction μ_s = 0.4. What is the minimum horizontal force required to just slide the block? (g = 9.8 m/s²)",
    options: ["7.84 N", "9.8 N", "4.9 N", "19.6 N"],
    correctAnswer: "7.84 N",
    marks: 4
  },
  {
    subject: "Physics",
    question: "The time period of a simple pendulum on Earth is 2 seconds. When taken to the surface of the Moon where g_moon = g_earth / 6, its new time period is:",
    options: ["2√6 s", "2/√6 s", "12 s", "1/3 s"],
    correctAnswer: "2√6 s",
    marks: 4
  },
  {
    subject: "Physics",
    question: "In a Young's Double Slit Experiment, the slit separation is 0.5 mm and the screen distance is 1 m. For light of wavelength 500 nm, the fringe width (β) is:",
    options: ["1.0 mm", "0.5 mm", "2.0 mm", "0.25 mm"],
    correctAnswer: "1.0 mm",
    marks: 4
  },
  {
    subject: "Physics",
    question: "A parallel plate capacitor with plate area A and separation d is filled with a dielectric of constant K = 4. Its capacitance is:",
    options: ["4 ε₀A / d", "ε₀A / (4d)", "2 ε₀A / d", "16 ε₀A / d"],
    correctAnswer: "4 ε₀A / d",
    marks: 4
  },
  {
    subject: "Physics",
    question: "A uniform solid sphere of mass M and radius R rolls without slipping on a horizontal plane. The fraction of its total kinetic energy associated with rotation is:",
    options: ["2/7", "5/7", "1/2", "2/5"],
    correctAnswer: "2/7",
    marks: 4
  },

  // --- CHEMISTRY (5 Questions) ---
  {
    subject: "Chemistry",
    question: "Which of the following species has linear geometry based on VSEPR theory?",
    options: ["CO₂", "H₂O", "SO₂", "NH₃"],
    correctAnswer: "CO₂",
    marks: 4
  },
  {
    subject: "Chemistry",
    question: "The IUPAC name of the compound (CH₃)₂CH-CH₂-CHO is:",
    options: ["3-Methylbutanal", "2-Methylbutanal", "Isovaleraldehyde", "4-Methylbutanal"],
    correctAnswer: "3-Methylbutanal",
    marks: 4
  },
  {
    subject: "Chemistry",
    question: "Which of the following transition metal complexes is diamagnetic?",
    options: ["[Ni(CN)₄]²⁻", "[NiCl₄]²⁻", "[Fe(H₂O)₆]²⁺", "[CoF₆]³⁻"],
    correctAnswer: "[Ni(CN)₄]²⁻",
    marks: 4
  },
  {
    subject: "Chemistry",
    question: "For a first order reaction, the half-life t₁/₂ is 69.3 minutes. The rate constant k is:",
    options: ["0.01 min⁻¹", "0.1 min⁻¹", "0.001 min⁻¹", "1.0 min⁻¹"],
    correctAnswer: "0.01 min⁻¹",
    marks: 4
  },
  {
    subject: "Chemistry",
    question: "According to the Arrhenius equation k = A e^(-Ea / RT), a plot of ln(k) versus (1/T) yields a straight line with a slope equal to:",
    options: ["-Ea / R", "-Ea / (2.303 R)", "Ea / R", "ln(A) / R"],
    correctAnswer: "-Ea / R",
    marks: 4
  }
];

const sscQuestions = [
  // --- REASONING (4 Questions) ---
  {
    subject: "Reasoning",
    question: "Find the next number in the series: 3, 7, 15, 31, 63, ?",
    options: ["127", "125", "128", "129"],
    correctAnswer: "127",
    marks: 2
  },
  {
    subject: "Reasoning",
    question: "If 'DOCTOR' is coded as 'EQEVQT', then how will 'NURSE' be coded in that same language?",
    options: ["OWTUG", "OVSTF", "PWUUG", "OWSTG"],
    correctAnswer: "OWTUG",
    marks: 2
  },
  {
    subject: "Reasoning",
    question: "Select the related word pair: 'Book : Pages :: Car : ?'",
    options: ["Wheels", "Road", "Driver", "Speed"],
    correctAnswer: "Wheels",
    marks: 2
  },
  {
    subject: "Reasoning",
    question: "Pointing to a man, a woman says: 'His mother is the only daughter of my mother.' How is the woman related to the man?",
    options: ["Mother", "Aunt", "Sister", "Grandmother"],
    correctAnswer: "Mother",
    marks: 2
  },

  // --- QUANTITATIVE APTITUDE (4 Questions) ---
  {
    subject: "Quantitative Aptitude",
    question: "A shopkeeper marks an article 20% above its cost price and allows a 10% discount on marked price. What is his net profit percent?",
    options: ["8%", "10%", "12%", "6%"],
    correctAnswer: "8%",
    marks: 2
  },
  {
    subject: "Quantitative Aptitude",
    question: "If 15 men can complete a construction work in 20 days, how many days will 25 men take to complete the same work?",
    options: ["12 days", "10 days", "14 days", "16 days"],
    correctAnswer: "12 days",
    marks: 2
  },
  {
    subject: "Quantitative Aptitude",
    question: "What is the compound interest on ₹10,000 for 2 years at 10% per annum compounded annually?",
    options: ["₹2,100", "₹2,000", "₹2,200", "₹1,800"],
    correctAnswer: "₹2,100",
    marks: 2
  },
  {
    subject: "Quantitative Aptitude",
    question: "If sin(θ) = 3/5, then what is the value of tan(θ) + sec(θ)?",
    options: ["2", "1/2", "4/3", "3/4"],
    correctAnswer: "2",
    marks: 2
  },

  // --- ENGLISH COMPREHENSION (4 Questions) ---
  {
    subject: "English",
    question: "Choose the exact synonym of the word 'CANDID':",
    options: ["Frank & Honest", "Deceptive", "Secretive", "Hesitant"],
    correctAnswer: "Frank & Honest",
    marks: 2
  },
  {
    subject: "English",
    question: "Select the antonym of the word 'METICULOUS':",
    options: ["Careless", "Thorough", "Detailed", "Scrupulous"],
    correctAnswer: "Careless",
    marks: 2
  },
  {
    subject: "English",
    question: "What is the meaning of the idiom 'To bite the bullet'?",
    options: ["To face a grim situation with fortitude", "To get angry quickly", "To make a foolish error", "To act dishonestly"],
    correctAnswer: "To face a grim situation with fortitude",
    marks: 2
  },
  {
    subject: "English",
    question: "Choose the correctly spelt word:",
    options: ["Accommodate", "Acommodate", "Accomodate", "Acomodate"],
    correctAnswer: "Accommodate",
    marks: 2
  },

  // --- GENERAL AWARENESS (4 Questions) ---
  {
    subject: "General Awareness",
    question: "Which Article of the Indian Constitution ensures the Right to Equality before Law?",
    options: ["Article 14", "Article 19", "Article 21", "Article 32"],
    correctAnswer: "Article 14",
    marks: 2
  },
  {
    subject: "General Awareness",
    question: "Who was the founder of the Maurya Empire in ancient India?",
    options: ["Chandragupta Maurya", "Ashoka", "Bindusara", "Harshavardhana"],
    correctAnswer: "Chandragupta Maurya",
    marks: 2
  },
  {
    subject: "General Awareness",
    question: "Which gland in the human body is referred to as the 'Master Gland' of the endocrine system?",
    options: ["Pituitary Gland", "Thyroid Gland", "Adrenal Gland", "Pancreas"],
    correctAnswer: "Pituitary Gland",
    marks: 2
  },
  {
    subject: "General Awareness",
    question: "What is the capital city of Australia?",
    options: ["Canberra", "Sydney", "Melbourne", "Brisbane"],
    correctAnswer: "Canberra",
    marks: 2
  }
];

async function seedExamTests() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    // 1. NEET UG Test
    const neetCalcMarks = neetQuestions.reduce((sum, q) => sum + (q.marks || 4), 0);
    const existingNeet = await Test.findOne({ category: "NEET" });
    if (existingNeet) {
      existingNeet.title = "NEET UG Grand Mock Test 2026 (Physics, Chemistry, Botany & Zoology)";
      existingNeet.description = "Complete authentic NEET pattern test with Physics, Chemistry, and Biology (Botany + Zoology) sections.";
      existingNeet.questions = neetQuestions;
      existingNeet.totalMarks = neetCalcMarks;
      existingNeet.duration = 180;
      existingNeet.className = "All";
      existingNeet.difficulty = "Medium";
      existingNeet.isPublished = true;
      existingNeet.year = "2026";
      await existingNeet.save();
      console.log("UPDATED_NEET_TEST_WITH_20_QS:", existingNeet.title);
    } else {
      const newNeet = await Test.create({
        title: "NEET UG Grand Mock Test 2026 (Physics, Chemistry, Botany & Zoology)",
        description: "Complete authentic NEET pattern test with Physics, Chemistry, and Biology (Botany + Zoology) sections.",
        questions: neetQuestions,
        totalMarks: neetCalcMarks,
        duration: 180,
        className: "All",
        category: "NEET",
        difficulty: "Medium",
        isPublished: true,
        year: "2026"
      });
      console.log("CREATED_NEW_NEET_TEST:", newNeet.title);
    }

    // 2. JEE Mains Test
    const jeeCalcMarks = jeeQuestions.reduce((sum, q) => sum + (q.marks || 4), 0);
    const existingJee = await Test.findOne({ category: "JEE Mains" });
    if (existingJee) {
      existingJee.title = "JEE Main All India Mock Test 2026 (Mathematics, Physics & Chemistry)";
      existingJee.description = "Full authentic JEE Mains test covering Mathematics, Physics, and Chemistry conceptual problems.";
      existingJee.questions = jeeQuestions;
      existingJee.totalMarks = jeeCalcMarks;
      existingJee.duration = 180;
      existingJee.className = "All";
      existingJee.difficulty = "Medium";
      existingJee.isPublished = true;
      existingJee.year = "2026";
      await existingJee.save();
      console.log("UPDATED_JEE_TEST_WITH_15_QS:", existingJee.title);
    } else {
      const newJee = await Test.create({
        title: "JEE Main All India Mock Test 2026 (Mathematics, Physics & Chemistry)",
        description: "Full authentic JEE Mains test covering Mathematics, Physics, and Chemistry conceptual problems.",
        questions: jeeQuestions,
        totalMarks: jeeCalcMarks,
        duration: 180,
        className: "All",
        category: "JEE Mains",
        difficulty: "Medium",
        isPublished: true,
        year: "2026"
      });
      console.log("CREATED_NEW_JEE_TEST:", newJee.title);
    }

    // 3. SSC Test
    const sscCalcMarks = sscQuestions.reduce((sum, q) => sum + (q.marks || 2), 0);
    const existingSsc = await Test.findOne({ category: "SSC" });
    if (existingSsc) {
      existingSsc.title = "SSC CGL & CHSL Tier-1 Full Mock Test 2026";
      existingSsc.description = "Complete Tier-1 pattern test covering General Intelligence & Reasoning, Quantitative Aptitude, English, and General Awareness.";
      existingSsc.questions = sscQuestions;
      existingSsc.totalMarks = sscCalcMarks;
      existingSsc.duration = 60;
      existingSsc.className = "All";
      existingSsc.difficulty = "Medium";
      existingSsc.isPublished = true;
      existingSsc.year = "2026";
      await existingSsc.save();
      console.log("UPDATED_SSC_TEST_WITH_16_QS:", existingSsc.title);
    } else {
      const newSsc = await Test.create({
        title: "SSC CGL & CHSL Tier-1 Full Mock Test 2026",
        description: "Complete Tier-1 pattern test covering General Intelligence & Reasoning, Quantitative Aptitude, English, and General Awareness.",
        questions: sscQuestions,
        totalMarks: sscCalcMarks,
        duration: 60,
        className: "All",
        category: "SSC",
        difficulty: "Medium",
        isPublished: true,
        year: "2026"
      });
      console.log("CREATED_NEW_SSC_TEST:", newSsc.title);
    }

    console.log("ALL_TESTS_SEEDED_SUCCESSFULLY!");
  } catch (err) {
    console.error("Error seeding tests:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedExamTests();
