import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectdb from "./config/connectdb.js";

import studentRouter from "./modules/Student/student.routes.js";
import adminRouter from "./modules/Admin/admin.routes.js";
import classRouter from "./modules/Admin/onlinecourse/onlinecourse.routes.js";
import attendanceRouter from "./modules/Admin/Attendance/attendance.routes.js";
import blogRouter from "./modules/Admin/blogs/blog.routes.js";
import sliderRouter from "./modules/Admin/Slider/slider.routes.js";
import testimonialRouter from "./modules/Admin/Testimonial/testimonial.routes.js";
import instructorRouter from "./modules/instructor/instructor.routes.js";
import categoryRouter from "./modules/Admin/category/category.routes.js";
import createcourseRouter from "./modules/instructor/createCourse/createCourse.routes.js";
import testRouter from "./modules/Admin/CreateTest/createtest.routes.js";
import resultRouter from "./modules/Student/Result/result.routes.js";
import enrollmentRouter from "./modules/Admin/enrollment/enrollment.routes.js";
import scholarshipRouter from "./modules/Student/Scholrship/scholarship.routes.js";
import paymentRouter from "./modules/Student/enrollStudent/payment.routes.js";
import enrollRouter from "./modules/Student/enrollStudent/enrollStudent.routes.js";
import successStoryRouter from "./modules/Admin/SuccessStory/successStory.routes.js";
import callbackRouter from "./modules/Admin/Callback/callback.routes.js";
import facultyRouter from "./modules/Admin/Faculty/faculty.routes.js";
import progressRouter from "./modules/Student/progress/progress.routes.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectdb();

app.use(cors({
  origin: "*",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/student", studentRouter);
app.use("/admin", adminRouter);
app.use("/instructor", instructorRouter)
app.use("/onlineClass", classRouter)
app.use("/joinclass", attendanceRouter)
app.use("/blog", blogRouter)
app.use("/slider", sliderRouter)
app.use("/testimonial", testimonialRouter)
app.use("/category", categoryRouter)
app.use("/course", createcourseRouter)
app.use("/enroll", enrollmentRouter)
app.use("/test", testRouter)
app.use("/result", resultRouter)
app.use("/payment", paymentRouter)
app.use("/scholarship", scholarshipRouter)
app.use("/success-story", successStoryRouter);
app.use("/callback", callbackRouter);
app.use("/faculty", facultyRouter);
app.use("/progress", progressRouter)



const possiblePaths = [
  path.join(__dirname, "../Frontend/dist"),
  path.join(__dirname, "./dist"),
  path.join(__dirname, "./public"),
  path.join(process.cwd(), "Frontend/dist"),
  path.join(process.cwd(), "dist"),
  path.join(process.cwd(), "public")
];

let frontendPath = possiblePaths.find(p => fs.existsSync(path.join(p, "index.html"))) || possiblePaths[0];

app.use(express.static(frontendPath));

app.use((req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(404).send("Frontend build not found. Please build the frontend first.");
});

export default app;