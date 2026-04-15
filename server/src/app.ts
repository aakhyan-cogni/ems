import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter, eventRouter } from "@/routes";

const app = express();

app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);
app.use(express.json());

// Routes
app.use("/api/events", eventRouter);
app.use("/api/auth", authRouter);

export default app;
