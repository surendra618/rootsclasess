import express, { Router } from "express"
import { CreateBlogs, DeleteBlog, GetBlogsData, UpdateBlog } from "./blogs.controller.js"
import multer from "multer";

const blogRouter = Router()
const Upload = multer({ dest: "uploads/" });
blogRouter.post("/create_blog",Upload.single("image"),CreateBlogs)
blogRouter.post("/get_blogs",GetBlogsData)
blogRouter.post("/update_blog",Upload.single("image"),UpdateBlog)
blogRouter.post("/delete_blog",DeleteBlog)

export default blogRouter