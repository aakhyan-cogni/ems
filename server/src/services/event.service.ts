import { Event } from "../types/event.type";

export const getAllEvents = async (): Promise<Event[]> => {
	return [
		{
			id: 1,
			title: "Tech Conference 2026",
			price: 25,
		},
		{
			id: 2,
			title: "React Workshop",
			price: 50,
		},
	];
};
