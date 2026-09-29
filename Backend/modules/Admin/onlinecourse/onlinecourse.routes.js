import express, { Router } from "express"
import { CreateOnlineClass, DeleteClass, GatAllClasses, GetCreatedClass, UpdateClassData } from "./onlinecourse.controller.js";


const classRouter = Router();
classRouter.post("/create_class",CreateOnlineClass)
classRouter.post("/get_class",GetCreatedClass)
classRouter.post("/edit_class",UpdateClassData)
classRouter.post("/delete_class",DeleteClass)
classRouter.post("/get_all_classes",GatAllClasses)
export default classRouter