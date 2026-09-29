import express from "express";
import {
  AddSuccessStory,
  GetSuccessStories,
  GetAllSuccessStoriesAdmin,
  UpdateSuccessStory,
  DeleteSuccessStory,
} from "./successStory.controller.js";

const router = express.Router();

router.post("/add", AddSuccessStory);
router.get("/get", GetSuccessStories); // Public
router.get("/admin/get-all", GetAllSuccessStoriesAdmin); // Admin
router.post("/update", UpdateSuccessStory);
router.post("/delete", DeleteSuccessStory);

export default router;
