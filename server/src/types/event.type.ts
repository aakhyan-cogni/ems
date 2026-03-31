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
	venue?: string;
	tags?: string;
	attendees?: number;
	avgRating?: number;
	totalRatings?: number;
	reviews?: Review[];
}

export type Category =
	| "Conference"
	| "Workshop"
	| "Social"
	| "Entertainment"
	| "Health & Wellness"
	| "Education"
	| "Other";
