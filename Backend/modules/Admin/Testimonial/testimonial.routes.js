import express, { Router } from "express"
import { AddTestimonial, DeleteTestinomial, GetTestimonial, UpdateTestimonial } from "./testimonial.controller.js"
import Upload from "../../../utils/upload.js";

const testimonialRouter = Router()
testimonialRouter.post("/add_testimonial",Upload.single("image"),AddTestimonial)
testimonialRouter.post("/get_testimonial",GetTestimonial)
testimonialRouter.post("/update_testimonial",Upload.single("image"),UpdateTestimonial)
testimonialRouter.post("/delete_testimonial", DeleteTestinomial)
testimonialRouter.post("/delete_testinomial", DeleteTestinomial)


export default testimonialRouter