  const students = [
    {
      id: 1,
      name: "Emma Watson",
      email: "emma.watson@university.edu",
      course: "Computer Science",
      year: "Senior",
      gpa: 3.8,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      achievements: ["Dean's List", "Research Assistant"],
    },
    {
      id: 2,
      name: "Liam Chen",
      email: "liam.chen@university.edu",
      course: "Data Science",
      year: "Junior",
      gpa: 3.9,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      achievements: ["AI Club President", "Hackathon Winner"],
    },
    {
      id: 3,
      name: "Sophia Rodriguez",
      email: "sophia.rodriguez@university.edu",
      course: "Software Engineering",
      year: "Sophomore",
      gpa: 3.7,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      achievements: ["Women in Tech Lead", "Scholarship Recipient"],
    },
    {
      id: 4,
      name: "Oliver Kim",
      email: "oliver.kim@university.edu",
      course: "Cybersecurity",
      year: "Senior",
      gpa: 3.95,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      achievements: ["CTF Champion", "Security Research"],
    },
    {
      id: 5,
      name: "Ava Martinez",
      email: "ava.martinez@university.edu",
      course: "Information Systems",
      year: "Freshman",
      gpa: 3.6,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      achievements: ["Future Leaders Program"],
    },
    {
      id: 6,
      name: "Noah Williams",
      email: "noah.williams@university.edu",
      course: "AI & Machine Learning",
      year: "Graduate",
      gpa: 4.0,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
      achievements: ["Research Publication", "Teaching Assistant"],
    },
  ];

   const dummyTestimonials = [
    {
      _id: "1",
      name: "Rajesh Kumar",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      achievement: "Top Performer - Batch 2024",
      Course: "Full Stack Web Development",
      review: "Excellent course structure! The instructors are very knowledgeable and supportive. I landed a job at a top tech company within 3 months of completing the course.",
      rating: 5,
      createdAt: new Date("2024-01-15")
    },
    {
      _id: "2",
      name: "Priya Sharma",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      achievement: "Gold Medalist",
      Course: "Data Science & AI",
      review: "The curriculum is up-to-date with industry standards. The projects were challenging and helped me build a strong portfolio. Highly recommended!",
      rating: 5,
      createdAt: new Date("2024-01-20")
    },
    {
      _id: "3",
      name: "Amit Patel",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      achievement: "Best Project Award",
      Course: "Digital Marketing",
      review: "Great learning experience. The practical approach and real-world examples made it easy to understand complex concepts. My business grew 200% after implementing these strategies.",
      rating: 4,
      createdAt: new Date("2024-01-25")
    }
  ];

  export {students,dummyTestimonials}
