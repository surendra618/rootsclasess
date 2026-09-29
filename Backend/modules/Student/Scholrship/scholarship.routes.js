import { Router } from "express";
import { approveScholarship, getApprovedRejectedScholarships, getStudentScholarship, handleApplyScholarship, rejectScholarship } from "./scholarship.controller.js";
import { isAdmin } from "../../../middleware/admin.js";
import { authMiddleware } from "../../../middleware/auth.js";


const scholarshipRouter = Router()

scholarshipRouter.post("/apply" ,handleApplyScholarship)
scholarshipRouter.post("/approve",authMiddleware,isAdmin,approveScholarship)
scholarshipRouter.post("/reject",authMiddleware,isAdmin,rejectScholarship)
scholarshipRouter.get("/approved-rejected",authMiddleware,isAdmin,getApprovedRejectedScholarships)
scholarshipRouter.post("/student-schollership",getStudentScholarship)


export default scholarshipRouter