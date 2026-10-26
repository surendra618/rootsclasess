import { Router } from "express";
import upload from "../../../utils/upload.js";
import {
  getPolicyByType,
  saveOrUpdatePolicy,
  uploadPolicyPdf,
  getAllPolicies
} from "./policy.controller.js";

const policyRouter = Router();

// Public endpoints
policyRouter.get("/get/:type", getPolicyByType);
policyRouter.get("/all", getAllPolicies);

// Admin modification endpoints
policyRouter.post("/update", saveOrUpdatePolicy);
policyRouter.post("/upload-pdf", upload.single("document"), uploadPolicyPdf);

export default policyRouter;
