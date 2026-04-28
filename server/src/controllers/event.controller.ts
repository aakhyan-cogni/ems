import { Request, Response } from "express";
import * as EventService from "@/services/event.service";

export const getEvents = async (req: Request, res: Response) => {
	try {
		const events = await EventService.getAllEvents();
		res.status(200).json(events);
	} catch (error) {
		res.status(500).json({ message: "Error fetching events" });
	}
};
