import express from "express";
import { RequestExpertAdvice, SubmitContactForm } from "./callback.controller.js";

const router = express.Router();

router.post("/request", RequestExpertAdvice);
router.post("/contact", SubmitContactForm);

export default router;
