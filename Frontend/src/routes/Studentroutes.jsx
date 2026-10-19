import Home from "../components/Home/Home";
import StudentLogin from "../components/Student/StudentLogin";
import StudentRegister from "../components/Student/StudentRegister";
import Scholarship from "../pages/Student/Scholarship";
import TestList from "../pages/Student/TestList";
import Blog from "../pages/Student/Blog";
import Contact from "../pages/Student/Contact";
import StudentProfile from "../components/Student/StudentProfile";
import Layout from "../Layout";
import Courses from "../pages/Student/Course/Courses";
import CourseDetails from "../pages/Student/Course/CourseDetails";
import PurchesCourses from "../components/Student/PurchesCourses";
import TermsAndConditions from "../pages/TermsAndConditions";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TopicInfo from "../pages/Student/Course/Topicinfo";
import About from "../pages/Student/About";

const StudentRoutes = [
    // Authentication Routes (Standalone / Full Page)
    {
        path: "/stdlogin",
        element: <StudentLogin />,
    },
    {
        path: "/login",
        element: <StudentLogin />,
    },
    {
        path: "/student/login",
        element: <StudentLogin />,
    },
    {
        path: "/register",
        element: <StudentRegister />,
    },
    {
        path: "/signup",
        element: <StudentRegister />,
    },
    {
        path: "/student/register",
        element: <StudentRegister />,
    },

    // Main App Shell (with Navbar & Footer Layout)
    {
        path: "/",
        element: <Layout />,
        children: [
            // Home
            {
                path: "",
                element: <Home />,
            },

            // Courses
            {
                path: "/course",
                element: <Courses />,
            },
            {
                path: "/courses",
                element: <Courses />,
            },
            {
                path: "/course/:courseId",
                element: <CourseDetails />
            },
            {
                path: "/courses/:courseId",
                element: <CourseDetails />
            },
            {
                path: "/coursedetails",
                element: <CourseDetails />
            },
            {
                path: "/coursedetails/:courseId",
                element: <CourseDetails />
            },
            {
                path: "/course-details",
                element: <CourseDetails />
            },
            {
                path: "/course-details/:courseId",
                element: <CourseDetails />
            },
            {
                path: "/course-content/:courseId",
                element: <PurchesCourses />
            },
            {
                path: "/topicinfo/:topicId",
                element: <TopicInfo />
            },
            {
                path: "/topic-info/:topicId",
                element: <TopicInfo />
            },

            // Purchased Courses (correcting typo 'purchescourse' + aliases)
            {
                path: "/purchescourse",
                element: <PurchesCourses />
            },
            {
                path: "/purchescourse/:courseId",
                element: <PurchesCourses />
            },
            {
                path: "/purchased-courses",
                element: <PurchesCourses />
            },
            {
                path: "/purchased-courses/:courseId",
                element: <PurchesCourses />
            },
            {
                path: "/purchased-course",
                element: <PurchesCourses />
            },
            {
                path: "/my-courses",
                element: <PurchesCourses />
            },
            {
                path: "/my-courses/:courseId",
                element: <PurchesCourses />
            },

            // Scholarship
            {
                path: "/scholarship",
                element: <Scholarship />,
            },
            {
                path: "/scholarships",
                element: <Scholarship />,
            },
            {
                path: "/roots-scholarship",
                element: <Scholarship />,
            },

            // Test Series
            {
                path: "/test",
                element: <TestList />,
            },
            {
                path: "/tests",
                element: <TestList />,
            },
            {
                path: "/test-series",
                element: <TestList />,
            },
            {
                path: "/mock-tests",
                element: <TestList />,
            },

            // Blog & Articles
            {
                path: "/blog",
                element: <Blog />,
            },
            {
                path: "/blogs",
                element: <Blog />,
            },

            // Contact & Support
            {
                path: "/contact",
                element: <Contact />,
            },
            {
                path: "/contact-us",
                element: <Contact />,
            },

            // Student Dashboard / Profile
            {
                path: "/stdprofile",
                element: <StudentProfile />,
            },
            {
                path: "/profile",
                element: <StudentProfile />,
            },
            {
                path: "/student/profile",
                element: <StudentProfile />,
            },
            {
                path: "/dashboard",
                element: <StudentProfile />,
            },
            {
                path: "/student/dashboard",
                element: <StudentProfile />,
            },

            // About Us
            {
                path: "/about",
                element: <About />
            },
            {
                path: "/about-us",
                element: <About />
            },

            // Legal & Policies
            {
                path: "/termsandconditions",
                element: <TermsAndConditions />
            },
            {
                path: "/terms-and-conditions",
                element: <TermsAndConditions />
            },
            {
                path: "/terms",
                element: <TermsAndConditions />
            },
            {
                path: "/privacypolicy",
                element: <PrivacyPolicy />
            },
            {
                path: "/privacy-policy",
                element: <PrivacyPolicy />
            },
            {
                path: "/privacy",
                element: <PrivacyPolicy />
            }
        ]
    }
];

export default StudentRoutes;