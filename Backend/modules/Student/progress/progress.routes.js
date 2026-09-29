import express, { Router } from "express"
import { getAllCoursesProgress, getCourseProgress, markTopicComplete } from "./progress.controller.js"

const progressRouter = Router()
progressRouter.post("/mark-topic-complete",markTopicComplete)
progressRouter.post("/fatch-progress",getCourseProgress)
progressRouter.post("/fatch-all-progress",getAllCoursesProgress)

export default progressRouter