import type { ObjectId } from "mongodb";

export interface EventDoc {
	_id?: ObjectId;
	title: string;
	category: string;
	description: string;
	tags: string[];
	imgUrls: string[];
	date: Date;
	location: string;
	price: number;
	capacity: number;

	organizerId: ObjectId;
	organizerEmail: string;

	createdAt: Date;
	updatedAt: Date;
}

export type Event = Omit<EventDoc, "_id" | "organizerId"> & {
	id: string;
	organizerId: string;
};

export const EVENT_COLLECTION = "Event";
