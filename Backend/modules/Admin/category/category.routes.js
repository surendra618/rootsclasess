import express, { Router } from 'express'
import { addCategory, DeleteCategory, getCategories, UpdateCategory } from './category.controller.js'

const categoryRouter = Router()

categoryRouter.post("/create_category",addCategory)
categoryRouter.get("/get_category",getCategories)
categoryRouter.post("/edit_category",UpdateCategory)
categoryRouter.post("/delete_category",DeleteCategory)

export default categoryRouter