import express, { Router } from 'express'
import { getAllPurchasedCourses, getAllPurchasedTests } from "../enrollment/enrollment.controller.js"
const enrollmentRouter = Router()
enrollmentRouter.get("/get-purches-course", getAllPurchasedCourses)
enrollmentRouter.get("/get-purches-test", getAllPurchasedTests)
enrollmentRouter.get("/get-all-test-purchases", getAllPurchasedTests)

export default enrollmentRouter