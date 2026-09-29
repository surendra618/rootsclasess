import express, { Router } from "express"
import { AddTestimonial, DeleteTestinomial, GetTestimonial, UpdateTestimonial } from "./testimonial.controller.js"
import multer from "multer";

const testimonialRouter = Router()
const Upload = multer({ dest: "uploads/" });
testimonialRouter.post("/add_testimonial",Upload.single("image"),AddTestimonial)
testimonialRouter.post("/get_testimonial",GetTestimonial)
testimonialRouter.post("/update_testimonial",Upload.single("image"),UpdateTestimonial)
testimonialRouter.post("/delete_testinomial",DeleteTestinomial)


export default testimonialRouter