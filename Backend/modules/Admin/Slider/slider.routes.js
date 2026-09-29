import { Router } from "express"
import { CreateSlider, DeleteSlider , GetSlider, UpdateSlider } from "./slider.controller.js"
import multer from "multer";

const sliderRouter = Router()
const Upload = multer({ dest: "uploads/" });

const sliderUpload = Upload.fields([
    { name: "desktopImage", maxCount: 1 },
    { name: "tabletImage", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 }
]);

sliderRouter.post("/create_slider",sliderUpload,CreateSlider)
sliderRouter.post("/get_slider",GetSlider)
sliderRouter.post("/edit_slider",sliderUpload,UpdateSlider)
sliderRouter.post("/delete_slider",DeleteSlider)

export default sliderRouter
