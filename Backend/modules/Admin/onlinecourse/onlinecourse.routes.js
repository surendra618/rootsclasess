import { Router } from "express";
import {
    CreateOnlineClass,
    DeleteClass,
    GatAllClasses,
    GetCreatedClass,
    UpdateClassData,
    UpdateClassStatus,
    GetAppLiveClasses,
    JoinLiveClass
} from "./onlinecourse.controller.js";

const classRouter = Router();

// Standard Admin Endpoints
classRouter.post("/create_class", CreateOnlineClass);
classRouter.post("/get_class", GetCreatedClass);
classRouter.get("/get_class", GetCreatedClass);
classRouter.post("/edit_class", UpdateClassData);
classRouter.post("/update_status", UpdateClassStatus);
classRouter.post("/delete_class", DeleteClass);
classRouter.delete("/delete_class/:id", DeleteClass);
classRouter.post("/get_all_classes", GatAllClasses);
classRouter.get("/get_all_classes", GatAllClasses);

// Android App / Student Endpoints
classRouter.get("/app/live_classes", GetAppLiveClasses);
classRouter.post("/app/live_classes", GetAppLiveClasses);
classRouter.get("/join/:id", JoinLiveClass);
classRouter.post("/join", JoinLiveClass);

export default classRouter;