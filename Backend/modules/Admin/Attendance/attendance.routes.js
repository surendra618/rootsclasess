import express, { Router } from 'express'
import { GetStudentCount, JoinClass } from './attendance.controller.js'

const attendanceRouter = Router()
attendanceRouter.post("/join_class",JoinClass)
attendanceRouter.post("/get_stdcount",GetStudentCount)

export default attendanceRouter