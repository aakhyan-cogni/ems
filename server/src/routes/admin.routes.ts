import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import * as AdminController from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, adminOnly);

router.get("/users", AdminController.listUsers);
router.patch("/users/:id/role", AdminController.updateUserRole);

router.get("/events", AdminController.listEvents);
router.patch("/events/:id/approve", AdminController.approveEvent);
router.patch("/events/:id/reject", AdminController.rejectEvent);

router.get("/stats", AdminController.getStats);

export default router;