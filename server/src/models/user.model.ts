import type { ObjectId } from "mongodb";

export type Gender = "Male" | "Female" | "Others";

export type Role = "USER" | "ADMIN";

export type Tier = "FREE" | "PRO" | "ULTIMATE";

export interface UserDoc {
	_id?: ObjectId;
	email: string;
	password: string;
	name: string;
	avatar: string;
	phoneNumber?: string | null;
	dob?: string | null;
	gender?: Gender | null;
	country?: string | null;
	city?: string | null;
	state?: string | null;
	zipcode?: string | null;
	orgName?: string | null;
	designation?: string | null;
	companyWebsite?: string | null;
	bio?: string | null;

	refreshToken?: string | null;
	role: Role;

	tier: Tier;

	consentAccepted: boolean;
	consentAcceptedAt?: Date | null;
	consentVersion?: string | null;

	createdAt: Date;
	updatedAt: Date;
}

export type User = Omit<UserDoc, "_id"> & { id: string };

export const USER_COLLECTION = "User";
