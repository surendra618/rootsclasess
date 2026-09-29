import { useState } from "react";

const facultyMembers = [
  {
    id: 1,
    name: "Sunil Kumar Singh",
    subject: "Physics",
    expertise: "Expert in advanced physics and quantum mechanics with 10+ years of teaching experience. Specializes in making complex concepts simple and engaging.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",

    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    name: "Priya Sharma",
    subject: "Physics",
    expertise: "Physics specialist focusing on mechanics, electromagnetism, and modern physics. Known for innovative teaching methods and practical demonstrations.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    name: "Rahul Verma",
    subject: "Chemistry",
    expertise: "Specialist in organic and inorganic chemistry. Expert in reaction mechanisms, chemical bonding, and analytical techniques.",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    name: "Neha Gupta",
    subject: "Biology",
    expertise: "Focused on life sciences and environmental studies. Specializes in genetics, human physiology, and ecology with practical approach.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    color: "from-orange-500 to-red-500"
  },
  {
    id: 5,
    name: "Amit Mishra",
    subject: "English",
    expertise: "Professional in English literature and grammar. Expert in creative writing, communication skills, and literary analysis.",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: 6,
    name: "Kavita Yadav",
    subject: "Computer Science",
    expertise: "Coding mentor and software engineering trainer. Specializes in Python, Java, web development, and competitive programming.",
    image: "https://randomuser.me/api/portraits/women/89.jpg",
    color: "from-teal-500 to-cyan-500"
  }
];

const slides = [
  {
    title: "JEE Preparation",
    description: "Hi, Looking for JEE Preparation?.",
    bgImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8b25saW5lJTIwZWR1Y2F0aW9ufGVufDB8fDB8fHww",
    overlayColor: "bg-black/50"
  },
  {
    title: "7th - 12th Foundation",
    description: "Hi, Looking for Board Preparation?",
    bgImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    overlayColor: "bg-black/50"
  },

  {
    title: "NEET",
    description: "Hi, Looking for NEET Preparation?",
    bgImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    overlayColor: "bg-black/50"
  }
];

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    achievement: "Academic Excellence",
    category: "Class XII - Science Stream",
    quote: "The structured approach and dedicated mentorship helped me achieve my academic goals. The faculty's guidance and comprehensive study material made complex concepts easy to understand.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5,
    score: "98.6%",
    bgColor: "from-blue-500 to-blue-600"
  },
  {
    id: 2,
    name: "Arjun Mehta",
    achievement: "National Merit Scholar",
    category: "Engineering Entrance",
    quote: "The personalized coaching and practice tests were instrumental in my success. The mock tests simulated the actual exam environment perfectly, building my confidence.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 5,
    score: "AIR 47",
    bgColor: "from-green-500 to-green-600"
  },
  {
    id: 3,
    name: "Neha Gupta",
    achievement: "Top Scorer",
    category: "Medical Entrance",
    quote: "Daily revisions and mentor feedback gave me the edge I needed. The doubt-clearing sessions and personalized attention helped me overcome my weaknesses.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 5,
    score: "NEET Rank 156",
    bgColor: "from-purple-500 to-purple-600"
  }
];

// End of Constants

const courses = [
  {
    id: 1,
    title: "Advanced Web Development",
    instructor: "Dr. Sarah Johnson",
    duration: "8 weeks",
    level: "Advanced",
    students: 1245,
    rating: 4.8,
    image: "https://picsum.photos/id/0/400/250",
    category: "Programming",
    description: "Master modern web development with React, Node.js, and cutting-edge technologies."
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    instructor: "Prof. Michael Chen",
    duration: "10 weeks",
    level: "Intermediate",
    students: 2341,
    rating: 4.9,
    image: "https://picsum.photos/id/20/400/250",
    category: "Data Science",
    description: "Learn Python, statistics, and machine learning to become a data scientist."
  },
  {
    id: 3,
    title: "UI/UX Design Principles",
    instructor: "Emma Rodriguez",
    duration: "6 weeks",
    level: "Beginner",
    students: 892,
    rating: 4.7,
    image: "https://picsum.photos/id/1/400/250",
    category: "Design",
    description: "Create beautiful and intuitive user interfaces with modern design principles."
  },
  {
    id: 4,
    title: "Mobile App Development",
    instructor: "Alex Thompson",
    duration: "12 weeks",
    level: "Intermediate",
    students: 1567,
    rating: 4.6,
    image: "https://picsum.photos/id/15/400/250",
    category: "Mobile Development",
    description: "Build cross-platform mobile apps using React Native and Flutter."
  },
  {
    id: 5,
    title: "Cloud Computing with AWS",
    instructor: "Lisa Wang",
    duration: "8 weeks",
    level: "Advanced",
    students: 978,
    rating: 4.8,
    image: "https://picsum.photos/id/26/400/250",
    category: "Cloud",
    description: "Master AWS services, deployment strategies, and cloud architecture."
  },
  {
    id: 6,
    title: "Digital Marketing Mastery",
    instructor: "James Wilson",
    duration: "5 weeks",
    level: "Beginner",
    students: 2156,
    rating: 4.5,
    image: "https://picsum.photos/id/29/400/250",
    category: "Marketing",
    description: "Learn SEO, social media marketing, and analytics to grow businesses."
  }
];

const onlinecourses = [
  {
    id: 1,
    title: "React JS Masterclass",
    instructor: "John Doe",
    duration: "4.5 hours",
    level: "Intermediate",
    students: 12450,
    rating: 4.8,
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    category: "Web Development",
    description: "Learn React.js from scratch including hooks, context API, and Redux."
  },
  {
    id: 2,
    title: "Python Programming Bootcamp",
    instructor: "Sarah Smith",
    duration: "8 hours",
    level: "Beginner",
    students: 8920,
    rating: 4.9,
    youtubeUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
    thumbnail: "https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg",
    category: "Programming",
    description: "Master Python programming with real-world projects and exercises."
  },
  {
    id: 3,
    title: "JavaScript Advanced Concepts",
    instructor: "Mike Johnson",
    duration: "6 hours",
    level: "Advanced",
    students: 6730,
    rating: 4.7,
    youtubeUrl: "https://www.youtube.com/embed/ZVnjOPwW4ZA",
    thumbnail: "https://img.youtube.com/vi/ZVnjOPwW4ZA/maxresdefault.jpg",
    category: "Web Development",
    description: "Deep dive into closures, promises, async/await, and ES6+ features."
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    instructor: "Emily Chen",
    duration: "5 hours",
    level: "Beginner",
    students: 5430,
    rating: 4.6,
    youtubeUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU",
    thumbnail: "https://img.youtube.com/vi/c9Wg6Cb_YlU/maxresdefault.jpg",
    category: "Design",
    description: "Learn design principles, Figma, and create stunning user interfaces."
  },
  {
    id: 5,
    title: "Node.js & Express Backend",
    instructor: "David Wilson",
    duration: "7 hours",
    level: "Intermediate",
    students: 7890,
    rating: 4.8,
    youtubeUrl: "https://www.youtube.com/embed/Oe421EPjeBE",
    thumbnail: "https://img.youtube.com/vi/Oe421EPjeBE/maxresdefault.jpg",
    category: "Backend",
    description: "Build RESTful APIs, authentication, and database integration with MongoDB."
  },
  {
    id: 6,
    title: "Machine Learning Basics",
    instructor: "Dr. Alan Turing",
    duration: "10 hours",
    level: "Advanced",
    students: 3450,
    rating: 4.9,
    youtubeUrl: "https://www.youtube.com/embed/GwIo3gDZCVQ",
    thumbnail: "https://img.youtube.com/vi/GwIo3gDZCVQ/maxresdefault.jpg",
    category: "Data Science",
    description: "Introduction to ML algorithms, TensorFlow, and real-world applications."
  },
  {
    id: 7,
    title: "Tailwind CSS Crash Course",
    instructor: "Lisa Wang",
    duration: "3 hours",
    level: "Beginner",
    students: 12430,
    rating: 4.8,
    youtubeUrl: "https://www.youtube.com/embed/UBOo6qNJlec",
    thumbnail: "https://img.youtube.com/vi/UBOo6qNJlec/maxresdefault.jpg",
    category: "CSS",
    description: "Build beautiful responsive websites quickly with Tailwind CSS."
  },
  {
    id: 8,
    title: "Full Stack Development",
    instructor: "Chris Evans",
    duration: "15 hours",
    level: "Advanced",
    students: 9870,
    rating: 4.9,
    youtubeUrl: "https://www.youtube.com/embed/7CqJlxBYj-M",
    thumbnail: "https://img.youtube.com/vi/7CqJlxBYj-M/maxresdefault.jpg",
    category: "Full Stack",
    description: "Complete MERN stack course with deployment and best practices."
  }
];
const blogsData = [
  {
    id: 1,
    title: "Sardar Bhagat Singh",
    excerpt: "Sardar Bhagat Singh is one of the most iconic figures in India's fight for freedom...",
    content: `
      <p>Bhagat Singh was a charismatic Indian revolutionary whose actions and sacrifice inspired a generation. Born in 1907 in Punjab, he was drawn to the struggle for India's independence from a young age.</p>
      <p>He is best known for his protest against the British Raj, including the symbolic bombing of the Central Legislative Assembly in 1929. He willingly embraced martyrdom at the age of 23, becoming a symbol of youthful defiance and courage.</p>
      <p>His writings on atheism, socialism, and revolution continue to inspire millions. Bhagat Singh's legacy is not just of a freedom fighter, but of an intellectual who questioned authority and fought for a just society.</p>
    `,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&auto=format",
    date: "March 23, 1931",
    category: "Freedom Fighters"
  },
  {
    id: 2,
    title: "Computer Science Projects",
    excerpt: "Computer science is a popular topic of study today, with numerous applications...",
    content: `
      <p>Computer Science is at the heart of modern innovation. From artificial intelligence to web development, the field offers endless opportunities for creative and impactful projects.</p>
      <p>Whether you're building a simple portfolio website or a complex machine learning model, project-based learning is the best way to master concepts. Popular projects include weather apps, e-commerce platforms, AI chatbots, and blockchain prototypes.</p>
      <p>This blog explores how students and professionals can choose the right projects to enhance their skills and stand out in the tech industry.</p>
    `,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format",
    date: "March 15, 2025",
    category: "Technology"
  },
  {
    id: 3,
    title: "From Dreams to MBBS: The Ultimate NEET Study Strategy That Actually Works",
    excerpt: "Why Most NEET Aspirants Fail — And How You Won't Let...",
    content: `
      <p>Every year, over 1.5 million students appear for NEET, but only a fraction secure a seat. The difference between success and failure often lies in strategy, not just hard work.</p>
      <p>This comprehensive guide covers proven study techniques, time management hacks, and the psychological mindset needed to ace NEET. From creating a realistic timetable to mastering NCERT textbooks, we break down what it really takes to become a doctor.</p>
      <p>Avoid common pitfalls like passive reading and lack of mock tests. With disciplined preparation and smart resources, your MBBS dream is absolutely achievable.</p>
    `,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format",
    date: "February 28, 2025",
    category: "Education"
  },
  {
    id: 4,
    title: "Mushnipreem Chandra",
    excerpt: "Neta jii Subash Chandra Bose",
    content: `
      <p>Netaji Subhas Chandra Bose was one of India's most dynamic and influential freedom fighters. His famous slogan "Give me blood, and I shall give you freedom" ignited the nation.</p>
      <p>Bose formed the Azad Hind Fauj (Indian National Army) to fight against British rule. His leadership and daring escape from house arrest made him a legendary figure. Even today, his legacy of patriotism and resilience continues to inspire.</p>
      <p>This blog honors the contributions of Subhas Chandra Bose and his relentless pursuit of complete independence for India.</p>
    `,
    image: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=500&auto=format",
    date: "January 23, 1897",
    category: "History"
  }
];



export { facultyMembers, slides, testimonials, courses, onlinecourses, blogsData }