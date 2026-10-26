import { Zap, BrainCircuit, FlaskConical, Video, ClipboardList, FileText, Award } from 'lucide-react';

export const upcomingBatches = [
  {
    id: 1,
    slug: 'class-10-science-electricity',
    hot: true,
    badge: 'CLASS 10 SCIENCE',
    bannerImg: '/batch_banner.jpg',
    faculty: 'Surendra Sir',
    facultyRole: 'Founder & Senior Science Faculty (12+ Yrs Exp)',
    domain: 'CBSE BOARD 2026–27 • FOUNDATION',
    domainBg: 'bg-red-50',
    domainText: 'text-[#FB0500]',
    domainBorder: 'border-red-200',
    title: 'Class 10 Science — Electricity & Board Booster Batch',
    tagline: 'Master Electricity, Light, Chemical Reactions & 100% Board-Repeated Numericals',
    desc: 'Specialized 10th Board preparation covering high-weightage topics like Electricity, Light, Chemical Reactions with most repeated PYQs, numericals, and exam strategies by Surendra Sir.',
    startDate: 'Nov 10, 2026',
    timing: '5:30 PM – 7:30 PM',
    duration: '4 Months Crash + Test Series',
    mode: 'Classroom (Patna) + Live Online',
    seats: 45,
    seatsLeft: 7,
    originalPrice: 7999,
    fee: 3499,
    tokenAmount: 499,
    scholarshipUpTo: 'Up to 90%',
    accentColor: '#FB0500',
    btnClass: 'bg-[#FB0500] hover:bg-red-700',
    icon: Zap,
    features: [
      'Surendra Sir Live Masterclasses',
      'Most Repeated PYQ & Derivation Booklet',
      'Daily Practice Problems (DPP) with Video Solutions',
      '10+ Full CBSE Pattern Mock Tests with Evaluation',
      'Personal 1-on-1 Doubt Clearance with Surendra Sir',
      'Formula Handbooks & Electricity Mind Maps'
    ],
    whatYouGet: [
      {
        icon: Video,
        title: 'Surendra Sir Masterclasses',
        desc: 'In-depth conceptual lectures covering all derivations, circuit diagrams, and numerical solving tricks.'
      },
      {
        icon: ClipboardList,
        title: 'Full Board Mock Test Series',
        desc: 'CBSE pattern sample papers with step-by-step marking scheme and personalized evaluation.'
      },
      {
        icon: FileText,
        title: 'Formula Booklet & DPPs',
        desc: 'Comprehensive formula handbook, electricity quick revision chart, and daily practice problem sheets.'
      },
      {
        icon: Award,
        title: 'Up to 90% Scholarship',
        desc: 'Avail fee concession through Roots Scholarship Admission Test (RSAT) for Class 10 students.'
      },
    ],
    syllabusHighlights: [
      'Electric Current, Potential Difference & Ohm’s Law',
      'Series & Parallel Combinations & Numerical Shortcuts',
      'Heating Effects of Current, Joule’s Law & Electric Power',
      'Magnetic Effects, Fleming’s Rules & Electromagnetic Induction',
      'Chemical Reactions, Acid-Bases & Carbon Compounds',
      'Assertion-Reason, Case-Study & 5-Mark Question Mastery'
    ]
  },
  {
    id: 2,
    slug: 'jee-main-advanced-1year',
    hot: true,
    badge: 'IIT-JEE BATCH',
    bannerImg: '/batch3.png',
    faculty: 'IIT / NIT Alumni Faculty',
    facultyRole: 'Ex-Allen / Resonance Senior Mentors (15+ Yrs Exp)',
    domain: 'ENGINEERING DOMAIN • CLASS 11-12 & DROPPER',
    domainBg: 'bg-blue-50',
    domainText: 'text-[#0078FF]',
    domainBorder: 'border-blue-200',
    title: 'JEE Main + Advanced 1-Year Classroom Batch 2026–27',
    tagline: 'Complete Physics, Chemistry & Maths Mastery for Top All-India Rank',
    desc: 'Intensive 1-Year classroom program for IIT JEE aspirants covering Physics, Chemistry, and Mathematics with advanced problem solving, national test series, and mentorship.',
    startDate: 'Nov 15, 2026',
    timing: '7:00 AM – 1:00 PM',
    duration: '12 Months Comprehensive',
    mode: 'Offline Classroom + Online Access',
    seats: 40,
    seatsLeft: 9,
    originalPrice: 65000,
    fee: 38500,
    tokenAmount: 999,
    scholarshipUpTo: 'Up to 100%',
    accentColor: '#0078FF',
    btnClass: 'bg-[#FB0500] hover:bg-red-700',
    icon: BrainCircuit,
    features: [
      'Daily 5-Hour Sessions by IIT/NIT Alumni',
      '40+ All India Mock Tests on NTA Interface',
      'Level 1-3 Graded Sheets with Advanced Problem Sets',
      '1-on-1 Faculty Mentorship & Weak-Area Tracking',
      'Daily Doubt Counter (Offline + App)',
      'Revision Modules & Previous 20-Year Archive'
    ],
    whatYouGet: [
      {
        icon: Video,
        title: 'IIT/NIT Alumni Faculty',
        desc: 'Daily concept classes with real-time doubt solving and speed-accuracy improvement techniques.'
      },
      {
        icon: ClipboardList,
        title: 'JEE Advanced Pattern Tests',
        desc: 'Weekly chapter tests, monthly cumulative tests, and full-length CBT tests on actual exam interface.'
      },
      {
        icon: FileText,
        title: 'Exhaustive Study Modules',
        desc: 'Hardcopy theory modules, previous 15-year chapter-wise questions, and subjective problem sheets.'
      },
      {
        icon: Award,
        title: 'Merit-Based Scholarship',
        desc: 'Up to 100% tuition waiver for meritorious students scoring high in RSAT screening test.'
      },
    ],
    syllabusHighlights: [
      'Mechanics, Thermodynamics, Electromagnetism & Modern Physics',
      'Physical, Inorganic & Organic Chemistry (Reaction Mechanisms)',
      'Algebra, Coordinate Geometry, Calculus & Vectors',
      'High-Speed Short Tricks & Elimination Techniques for JEE Main',
      'Multi-concept Multi-correct Problems for JEE Advanced'
    ]
  },
  {
    id: 3,
    slug: 'neet-ug-2year',
    hot: false,
    badge: 'NEET (UG) BATCH',
    bannerImg: '/batch2.png',
    faculty: 'Senior Medical Faculty',
    facultyRole: 'Doctor Panel & Ex-Top Institute Biology Mentors',
    domain: 'MEDICAL DOMAIN • CLASS 11-12 & REPEATER',
    domainBg: 'bg-emerald-50',
    domainText: 'text-emerald-700',
    domainBorder: 'border-emerald-200',
    title: 'NEET (UG) 2-Year Integrated Classroom Batch 2026–28',
    tagline: 'Target 680+ Score with 100% Line-by-Line NCERT Mastery & OMR Drills',
    desc: 'Line-by-line NCERT mastery for Biology, Chemistry, and Physics with high-yield question drills, OMR test practice, and personalized doubt sessions.',
    startDate: 'Dec 01, 2026',
    timing: '8:30 AM – 2:00 PM',
    duration: '24 Months Complete Syllabus',
    mode: 'Classroom + Hybrid Portal',
    seats: 35,
    seatsLeft: 14,
    originalPrice: 75000,
    fee: 42000,
    tokenAmount: 999,
    scholarshipUpTo: 'Up to 85%',
    accentColor: '#059669',
    btnClass: 'bg-[#FB0500] hover:bg-red-700',
    icon: FlaskConical,
    features: [
      '100% NCERT Focused Biology line-by-line decoding',
      'Weekly OMR-Based Tests with Negative-Marking Analysis',
      'Bi-weekly Parent Progress Reports & Rank Benchmarking',
      'Dedicated Physics & Chemistry Numerical Doubt Faculty',
      'Diagrams, Mnemonics & Mind-Map Memory Books',
      '5000+ High-Yield Questions Test Bank'
    ],
    whatYouGet: [
      {
        icon: Video,
        title: 'Doctor & Senior Faculty Panel',
        desc: 'Concept clarity with practical diagrams, mnemonics, and NCERT-centric high-yield coverage.'
      },
      {
        icon: ClipboardList,
        title: 'OMR Pattern NEET Test Series',
        desc: 'Strictly timed 720-mark mock exams with negative marking analysis and rank benchmarking.'
      },
      {
        icon: FileText,
        title: 'Biology NCERT Extract & DPPs',
        desc: 'Line-by-line fill in blanks, assertion-reason booklets, and 5000+ chapter-wise questions.'
      },
      {
        icon: Award,
        title: 'Roots Medical Scholarship',
        desc: 'Scholarship up to 85% on tuition fees for students securing top ranks in RSAT entrance test.'
      },
    ],
    syllabusHighlights: [
      'Botany & Zoology: Complete 38 Chapters Line-by-Line',
      'Physics: Kinematics, Optics, Modern Physics & High-Yield Numerical Drills',
      'Chemistry: Inorganic NCERT Tables, Organic Mechanisms & Physical Formulae',
      'Assertion-Reasoning & Statement-Based Question Drills',
      '720-Mark Full Syllabus Mock Drills with National Percentile'
    ]
  },
];
