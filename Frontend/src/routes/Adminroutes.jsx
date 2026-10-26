import Dashboard from "../pages/Admin/Dashboard";
import AllStudents from "../pages/Admin/StudentManagement/AllStudents";
import Enrollment from "../pages/Admin/Courses/Enrollment";
import TestPurchases from "../pages/Admin/TestPurchases";
import AdminLayout from "../../AdminLayout";
import AllBlogs from "../pages/Admin/BlogManagement/AllBlogs";
import ManageSlider from "../pages/Admin/ManageSlider";
import Testimonials from "../pages/Admin/Testimonials";
import CourseCategory from "../pages/Admin/Courses/CourseCategory";
import AllCourses from "../pages/Admin/Courses/AllCourses";
import TestManagement from "../pages/Admin/TestManagement";
import CreateTest from "../pages/Admin/CreateTest";
import SuccessStoriesManagement from "../pages/Admin/SuccessStoriesManagement";
import FacultyManagement from "../pages/Admin/FacultyManagement";
import Settings from "../pages/Admin/Settings";
import SchollershipResult from "../pages/Admin/SchollershipResult";
import ManagePolicies from "../pages/Admin/ManagePolicies";
import ManageBatches from "../pages/Admin/Batches/ManageBatches";
import BatchApplications from "../pages/Admin/Batches/BatchApplications";

const Adminroutes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },

      // Student Management
      {
        path: "students",
        element: <AllStudents />,
      },
      {
        path: "all-students",
        element: <AllStudents />,
      },
      {
        path: "allstudent",
        element: <AllStudents />,
      },

      // Course Manager
      {
        path: "courses",
        element: <AllCourses />,
      },
      {
        path: "all-courses",
        element: <AllCourses />,
      },
      {
        path: "allcourses",
        element: <AllCourses />,
      },
      {
        path: "categories",
        element: <CourseCategory />,
      },
      {
        path: "course-categories",
        element: <CourseCategory />,
      },
      {
        path: "coursecategory",
        element: <CourseCategory />,
      },
      {
        path: "enrollments",
        element: <Enrollment />,
      },
      {
        path: "enrollment",
        element: <Enrollment />,
      },
      {
        path: "test-purchases",
        element: <TestPurchases />,
      },
      {
        path: "test-enrollments",
        element: <TestPurchases />,
      },

      // Test Management
      {
        path: "test-management",
        element: <TestManagement />,
      },
      {
        path: "manage-tests",
        element: <TestManagement />,
      },
      {
        path: "tests",
        element: <TestManagement />,
      },
      {
        path: "create-test",
        element: <CreateTest />,
      },
      {
        path: "createtest",
        element: <CreateTest />,
      },

      // Scholarship Applications & Results (correcting 'schollershipresult' typo)
      {
        path: "scholarships",
        element: <SchollershipResult />,
      },
      {
        path: "scholarship-results",
        element: <SchollershipResult />,
      },
      {
        path: "scholarship-result",
        element: <SchollershipResult />,
      },
      {
        path: "schollershipresult",
        element: <SchollershipResult />,
      },

      // Testimonials
      {
        path: "testimonials",
        element: <Testimonials />,
      },
      {
        path: "testimonial",
        element: <Testimonials />,
      },

      // Sliders / UI Controls
      {
        path: "manage-slider",
        element: <ManageSlider />,
      },
      {
        path: "sliders",
        element: <ManageSlider />,
      },
      {
        path: "slider",
        element: <ManageSlider />,
      },

      // Blogs
      {
        path: "blogs",
        element: <AllBlogs />,
      },
      {
        path: "blog",
        element: <AllBlogs />,
      },

      // Success Stories
      {
        path: "success-stories",
        element: <SuccessStoriesManagement />,
      },

      // Faculty Team
      {
        path: "faculty",
        element: <FacultyManagement />,
      },

      // Batches & Admissions Management
      {
        path: "batches",
        element: <ManageBatches />,
      },
      {
        path: "manage-batches",
        element: <ManageBatches />,
      },
      {
        path: "batch-applications",
        element: <BatchApplications />,
      },
      {
        path: "batch-leads",
        element: <BatchApplications />,
      },

      // Terms & Privacy Policies Management
      {
        path: "policies",
        element: <ManagePolicies />,
      },
      {
        path: "manage-policies",
        element: <ManagePolicies />,
      },
      {
        path: "policy",
        element: <ManagePolicies />,
      },

      // Settings
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
];

export default Adminroutes;