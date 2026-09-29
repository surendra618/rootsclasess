import { Router } from "express";
import { CreateFaculty, DeleteFaculty, GetFaculty, UpdateFaculty } from "./faculty.controller.js";
import multer from "multer";

const facultyRouter = Router();
const Upload = multer({ dest: "uploads/" });

facultyRouter.post("/create", Upload.single("image"), CreateFaculty);
facultyRouter.get("/get", GetFaculty);
facultyRouter.post("/update", Upload.single("image"), UpdateFaculty);
facultyRouter.post("/delete", DeleteFaculty);

export default facultyRouter;
