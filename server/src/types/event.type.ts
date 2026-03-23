import { Review } from "./review.type";

export interface Event {
	id: number;
	title: string;
	price: number;
	currency: string;
	location: string;
	category: Category;
	image: string;
	description: string;
	longDescription: string;
	eventDateTime: Date;
	hostId: string;
	bookedUserIds: string[];
	venue?: string;
	tags?: string;
	attendees?: number;
	avgRating?: number;
	totalRatings?: number;
	reviews?: Review[];
}

export type Category =
	| "Conferences"
	| "Workshops"
	| "Social"
	| "Entertainment"
	| "Health & Wellness"
	| "Education"
	| "Other";
