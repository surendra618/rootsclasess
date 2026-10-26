import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  GetAllBatches,
  CreateBatch,
  UpdateBatch,
  DeleteBatch,
  ToggleBatchApproval,
  ApplyBatchEnrollment,
  CreateBatchPaymentOrder,
  GetAllApplications,
  UpdateApplicationStatus,
  DeleteApplication
} from "./batch.controller.js";

const batchRouter = Router();

// Configure storage for batch banner uploads
import os from "os";

const uploadsDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "uploads")
  : path.join(process.cwd(), "uploads");

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem on Vercel serverless
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ── Public Routes ──
batchRouter.get("/all", GetAllBatches);
batchRouter.get("/get_batches", GetAllBatches);
batchRouter.post("/create-order", CreateBatchPaymentOrder);
batchRouter.post("/apply", ApplyBatchEnrollment);

// ── Admin Batch Management ──
batchRouter.post("/create", upload.single("bannerImg"), CreateBatch);
batchRouter.put("/update/:id", upload.single("bannerImg"), UpdateBatch);
batchRouter.delete("/delete/:id", DeleteBatch);
batchRouter.put("/approve/:id", ToggleBatchApproval);
batchRouter.patch("/approve/:id", ToggleBatchApproval);

// ── Admin Applications / Leads Management ──
batchRouter.get("/applications", GetAllApplications);
batchRouter.put("/application/:id/status", UpdateApplicationStatus);
batchRouter.delete("/application/:id", DeleteApplication);

export default batchRouter;
