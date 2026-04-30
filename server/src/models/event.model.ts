import type { ObjectId } from "mongodb";

export type EventStatus = "PENDING" | "APPROVED" | "REJECTED";

export const currencies = ["USD", "EUR", "GBP", "JPY", "INR"] as const;
export type Currency = (typeof currencies)[number];

export interface EventDoc {
	_id?: ObjectId;
	title: string;
	currency: Currency;
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

	status: EventStatus;

	createdAt: Date;
	updatedAt: Date;
}

export type Event = Omit<EventDoc, "_id" | "organizerId"> & {
	id: string;
	organizerId: string;
};

export const EVENT_COLLECTION = "Event";
