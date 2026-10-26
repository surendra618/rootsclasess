import { Router } from "express";
import { CreateFaculty, DeleteFaculty, GetFaculty, UpdateFaculty } from "./faculty.controller.js";
import Upload from "../../../utils/upload.js";

const facultyRouter = Router();

facultyRouter.post("/create", Upload.single("image"), CreateFaculty);
facultyRouter.get("/get", GetFaculty);
facultyRouter.post("/update", Upload.single("image"), UpdateFaculty);
facultyRouter.post("/delete", DeleteFaculty);

export default facultyRouter;
