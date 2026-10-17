import { Router } from "express";
import multer from "multer";
import {
  getPolicyByType,
  saveOrUpdatePolicy,
  uploadPolicyPdf,
  getAllPolicies
} from "./policy.controller.js";

const policyRouter = Router();
const upload = multer({ dest: "uploads/" });

// Public endpoints
policyRouter.get("/get/:type", getPolicyByType);
policyRouter.get("/all", getAllPolicies);

// Admin modification endpoints
policyRouter.post("/update", saveOrUpdatePolicy);
policyRouter.post("/upload-pdf", upload.single("document"), uploadPolicyPdf);

export default policyRouter;
