import express, { Router } from "express"
import {  createCourse, DeleteCourse, DeleteTopic, GetCategory, GetCreatedCourse, UpdateCourse, handleAddChapter, handleAddModule, handleAddTopic, handleDeleteChapter, handleDeleteModule, handleEditTopic, handleGetCourseById, handleUpdateChapter, handleUpdateModule, getFullCourseDetails, approvedCourse, getApprovedCourse, getInstructorById } from "./createCourse.controller.js"
import multer from "multer";

import { authMiddleware } from "../../../middleware/auth.js"
const createcourseRouter = Router()
const Upload = multer({ dest: "uploads/" });
createcourseRouter.post("/create_course", authMiddleware, createCourse)
createcourseRouter.post("/get_category",GetCategory)
createcourseRouter.post("/get_course",GetCreatedCourse)
createcourseRouter.post("/edit_course", authMiddleware, UpdateCourse)
createcourseRouter.post("/delete_course", authMiddleware, DeleteCourse)
createcourseRouter.post("/get-course-by-id" , handleGetCourseById)

createcourseRouter.post("/add-module" , handleAddModule)
createcourseRouter.post("/edit-module",handleUpdateModule)
createcourseRouter.post("/delete-module",handleDeleteModule)

createcourseRouter.post("/add-chapter",handleAddChapter)
createcourseRouter.post("/edit-chapter",handleUpdateChapter)
createcourseRouter.post("/delete-chapter",handleDeleteChapter)

createcourseRouter.post("/add-topic",Upload.fields([
    { name: "video", maxCount: 1 },
    { name: "notes", maxCount: 1 }
  ]),handleAddTopic)
  createcourseRouter.post("/edit-topic",Upload.fields([
    { name: "video", maxCount: 1 },
    { name: "notes", maxCount: 1 }
  ]),handleEditTopic)
createcourseRouter.post("/delete-topic",DeleteTopic)

createcourseRouter.get("/get-full-course",getFullCourseDetails)
createcourseRouter.post("/approved-course",approvedCourse)
createcourseRouter.get("/get-approved-course",getApprovedCourse)
createcourseRouter.post("/get-instructor",getInstructorById)

export default createcourseRouter 