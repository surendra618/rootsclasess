import { Navigate } from "react-router-dom";
import AdminLayout from "../../AdminLayout";
import InstructorDashboard from "../pages/Instructor/InstructorDashboard";
import AllCourse from "../pages/Instructor/courses/AllCourse";
import CourseContentManager from "../pages/Instructor/courses/CourseContentManager";
import InstructorStudents from "../pages/Instructor/InstructorStudents";
import InstructorSettings from "../pages/Instructor/InstructorSettings";

const Instructorroutes = [
  {
    path: "/instructor",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/instructor/dashboard" replace /> },
      { path: "dashboard", element: <InstructorDashboard /> },
      { path: "courses", element: <AllCourse /> },
      { path: "courses/:id", element: <CourseContentManager /> },
      { path: "students", element: <InstructorStudents /> },
      { path: "settings", element: <InstructorSettings /> },
    ],
  },
];

export default Instructorroutes;
