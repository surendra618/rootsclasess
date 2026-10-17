import express, { Router } from 'express'
import { createPayment, GetMyCourse, verifyPayment, GetPurchasedTests } from './payment.controller.js'

const paymentRouter = Router()

paymentRouter.post('/create-payment', createPayment)
paymentRouter.post('/verify-payment', verifyPayment)
paymentRouter.post("/get-my-course", GetMyCourse)
paymentRouter.post("/get-purchased-tests", GetPurchasedTests)

export default paymentRouter