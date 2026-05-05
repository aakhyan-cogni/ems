import type { ObjectId } from "mongodb";

export type EventStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export const currencies = ["USD", "EUR", "GBP", "JPY", "INR"] as const;
export type Currency = (typeof currencies)[number];

export type EventVisibility  = "PUBLIC" | "PRIVATE" | "UNLISTED";
export type TeamCapacityMode = "PER_TEAM" | "PER_MEMBER";


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

    rejectionReason?: string | null;
    visibility: EventVisibility;       // default "PUBLIC" on insert
    isTeamEvent?: boolean ;              // default false on insert
    minTeamSize?: number | null;
    maxTeamSize?: number | null;
    teamCapacityMode?: TeamCapacityMode | null;
    formSchemaId?: ObjectId | null;    // ref to FormSchema._id

	createdAt: Date;
	updatedAt: Date;
}

export type Event = Omit<EventDoc, "_id" | "organizerId"> & {
	id: string;
	organizerId: string;
};

export const EVENT_COLLECTION = "Event";
