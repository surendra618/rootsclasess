import express, { Router } from 'express'
import { checkTestAttempt, getAllResults, getStudentResults, startTest, submitTest } from './result.controller.js'

const resultRouter = Router()

resultRouter.post('/submit_test', submitTest)
resultRouter.post("/check-existing-test", checkTestAttempt)
resultRouter.post("/get-student-results", getStudentResults)
resultRouter.get("/get-all-results", getAllResults)
resultRouter.post("/start-test",startTest)


export default resultRouter