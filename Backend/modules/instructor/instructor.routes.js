import express, { Router } from 'express'
import { InstructorLogin, RegisterInstructor } from './instructor.controller.js'

const instructorRouter = Router()
instructorRouter.post("/instructor_login", InstructorLogin)
instructorRouter.post("/register", RegisterInstructor)

export default instructorRouter