import { Router } from "express";
import { 
    approveScholarship, 
    getApprovedRejectedScholarships, 
    getAllScholarshipApplications,
    deleteScholarship,
    getStudentScholarship, 
    handleApplyScholarship, 
    rejectScholarship,
    getScholarshipTest,
    grantTestAccess,
    revokeTestAccess,
    getAvailableScholarshipTests
} from "./scholarship.controller.js";
import { isAdmin } from "../../../middleware/admin.js";
import { authMiddleware } from "../../../middleware/auth.js";

const scholarshipRouter = Router();

scholarshipRouter.post("/apply", handleApplyScholarship);
scholarshipRouter.get("/all", authMiddleware, isAdmin, getAllScholarshipApplications);
scholarshipRouter.post("/approve", authMiddleware, isAdmin, approveScholarship);
scholarshipRouter.post("/reject", authMiddleware, isAdmin, rejectScholarship);
scholarshipRouter.post("/delete", authMiddleware, isAdmin, deleteScholarship);
scholarshipRouter.get("/approved-rejected", authMiddleware, isAdmin, getApprovedRejectedScholarships);
scholarshipRouter.post("/grant-test-access", authMiddleware, isAdmin, grantTestAccess);
scholarshipRouter.post("/revoke-test-access", authMiddleware, isAdmin, revokeTestAccess);
scholarshipRouter.get("/available-tests", authMiddleware, isAdmin, getAvailableScholarshipTests);
scholarshipRouter.post("/student-scholarship", getStudentScholarship);
scholarshipRouter.post("/student-schollership", getStudentScholarship);
scholarshipRouter.post("/get-scholarship-test", authMiddleware, getScholarshipTest);

export default scholarshipRouter;