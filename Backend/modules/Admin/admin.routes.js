import { Router } from "express";
import { AdminLogin, getAllStudent, toggleBanStudent, changeAdminPassword } from "./admin.controller.js";
import errorHandler from "../../middleware/error.js";

const adminRouter = Router()
adminRouter.post("/admin-login",AdminLogin)
adminRouter.post("/getall_student",getAllStudent)
adminRouter.post("/toggle-ban-student", toggleBanStudent)
adminRouter.post("/change-password", changeAdminPassword)
adminRouter.use(errorHandler)

export default adminRouter