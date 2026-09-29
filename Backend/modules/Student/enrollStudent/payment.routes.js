import express, { Router } from 'express'
import { createPayment, GetMyCourse, verifyPayment } from './payment.controller.js'

const paymentRouter = Router()

paymentRouter.post('/create-payment',createPayment)
paymentRouter.post('/verify-payment',verifyPayment)
paymentRouter.post("/get-my-course",GetMyCourse)

export default paymentRouter