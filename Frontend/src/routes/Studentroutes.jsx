import Home from "../components/Home/Home";
import StudentLogin from "../components/Student/StudentLogin";
import StudentRegister from "../components/Student/StudentRegister";
// import OnlineCourse from "../pages/Student/OnlineCourse";
import Scholarship from "../pages/Student/Scholarship";
import TestList from "../pages/Student/TestList";
import Blog from "../pages/Student/Blog";
import Contact from "../pages/Student/Contact";
import StudentProfile from "../components/Student/StudentProfile";
import Layout from "../Layout"
import Courses from "../pages/Student/Course/Courses";
import CourseDetails from "../pages/Student/Course/CourseDetails"
import PurchesCourses from "../components/Student/PurchesCourses";
import TermsAndConditions from "../pages/TermsAndConditions";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TopicInfo from "../pages/Student/Course/Topicinfo";
import About from "../pages/Student/About";


const StudentRoutes = [

    {
        path: "/stdlogin",
        element: <StudentLogin />,
    },
    {
        path: "/register",
        element: <StudentRegister />,
    },

    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "/course",
                element: <Courses />,
            },
            {
                path: "/coursedetails",
                element: <CourseDetails />
            },
           {
            path:"/topicinfo/:topicId",
            element:<TopicInfo/>
           },
            {
                path: "/scholarship",
                element: <Scholarship />,
            },
            {
                path: "/test",
                element: <TestList />,
            },
            {
                path: "/blog",
                element: <Blog />,
            },
            {
                path: "/contact",
                element: <Contact />,
            },
            {
                path: "/stdprofile",
                element: <StudentProfile />,
            },
            {
                path:"/purchescourse",
                element:<PurchesCourses/>
            },
            {
                path: "/termsandconditions",
                element: <TermsAndConditions />
            },
            {
                path: "/privacypolicy",
                element: <PrivacyPolicy />
            },
            {
                path: "/about",
                element: <About />
            },
            {
                path: "/about-us",
                element: <About />
            }

        ]
    }

];

export default StudentRoutes;