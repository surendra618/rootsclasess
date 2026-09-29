import express, { Router } from 'express'
import { enrollCourse } from './enrollStudent.controller.js'

const enrollRouter = Router()
enrollRouter.post("/api/enroll-course",enrollCourse)

export default enrollRouter