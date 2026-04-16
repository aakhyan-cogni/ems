import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import * as UserController from "@/controllers/user.controller";
export const userRouter = Router();

userRouter.get("/profile", authenticate, UserController.getUserProfile);
userRouter.patch("/profile", authenticate, UserController.updateUser);
