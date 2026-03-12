import express from "express";
import cors from "cors";
import eventRoutes from "./routes/event.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/events", eventRoutes);

export default app;
