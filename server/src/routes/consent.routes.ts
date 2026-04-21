import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import * as ConsentController from "@/controllers/consent.controller";

export const consentRouter = Router();

consentRouter.get("/status", authenticate, ConsentController.getConsentStatus);
consentRouter.post("/accept", authenticate, ConsentController.acceptConsent);
