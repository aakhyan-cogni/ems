import { Router } from "express";
import { getEvents } from "@/controllers/event.controller";

export const eventRouter = Router();

eventRouter.get("/", getEvents);
