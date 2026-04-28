import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { users } from "@/lib";
import { fromDoc, type User, type UserDoc } from "@/models";
import { getCurrentTermsVersion } from "@/services/consent.service";

/**
 * Hashes the given password using bcrypt and returns the hashed password. This function generates a salt and uses it to hash the password securely.
 * @param password Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = await bcrypt.genSalt();
	return bcrypt.hash(password, salt);
}

/**
 * Compares a plain text password with a hashed password and returns true if they match, false otherwise. This function uses bcrypt's compare method to securely check if the provided password corresponds to the stored hash.
 * @param password Plain text password to compare
 * @param hash Hashed password to compare against
 * @returns True if the password matches the hash, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

/**
 * Finds a user in the database by their email address. Returns the user object with `id` (string) if found, or null if no user with that email exists.
 * @param email Email address of the user to find
 * @returns User object if found, or null if not found
 */
export async function findUserByEmail(email: string): Promise<User | null> {
	const col = await users();
	const doc = await col.findOne({ email });
	return fromDoc<UserDoc>(doc);
}

/**
 * Updates the refresh token for a user in the database. Used when a user logs in, refreshes, or logs out.
 * @param userId ID of the user whose refresh token is being updated
 * @param refreshToken New refresh token to store for the user, or null to clear it
 * @returns Updated user object after the refresh token has been updated, or null if the user was not found
 */
export async function updateRefreshToken(userId: string, refreshToken: string | null): Promise<User | null> {
	const col = await users();
	const doc = await col.findOneAndUpdate(
		{ _id: new ObjectId(userId) },
		{ $set: { refreshToken, updatedAt: new Date() } },
		{ returnDocument: "after" },
	);
	return fromDoc<UserDoc>(doc);
}

export async function validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
	const col = await users();
	const doc = await col.findOne({ _id: new ObjectId(userId) }, { projection: { refreshToken: 1 } });
	return doc?.refreshToken === refreshToken;
}

/**
 * Creates a new user in the database with the provided email, password, and name.
 * @param data Object containing the email, hashed password, and name for the new user
 * @returns The created user's id, email, name, and role
 */
export async function createUser(data: Pick<UserDoc, "email" | "password" | "name"> & { termsAccepted: boolean }) {
	const col = await users();
	const now = new Date();
	const currentVersion = data.termsAccepted ? await getCurrentTermsVersion() : null;
	const insertDoc: UserDoc = {
		email: data.email,
		password: data.password,
		name: data.name,
		avatar: "default.png",
		role: "USER",
		tier:"FREE",
		consentAccepted: data.termsAccepted,
		consentAcceptedAt: data.termsAccepted ? now : null,
		consentVersion: currentVersion,
		createdAt: now,
		updatedAt: now,
	};
	const result = await col.insertOne(insertDoc);
	return {
		id: result.insertedId.toString(),
		email: data.email,
		name: data.name,
		role: "user",
		consentAccepted: data.termsAccepted,
		consentVersion: currentVersion,
	};
}
