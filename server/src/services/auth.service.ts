import bcrypt from "bcryptjs";
import { prisma } from "@/lib";
import { User } from "@prisma/client";

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
 * Finds a user in the database by their email address. This function queries the database using Prisma to locate a user record that matches the provided email. It returns the user object if found, or null if no user with that email exists.
 * @param email Email address of the user to find
 * @returns User object if found, or null if not found
 */
export async function findUserByEmail(email: string): Promise<User | null> {
	return prisma.user.findUnique({ where: { email } });
}

/**
 * Updates the refresh token for a user in the database. This function takes a user ID and a refresh token (or null) and updates the corresponding user record in the database to store the new refresh token. This is typically used when a user logs in or refreshes their tokens, allowing the server to validate future refresh requests against the stored token.
 * @param userId ID of the user whose refresh token is being updated
 * @param refreshToken New refresh token to store for the user, or null to clear it
 * @returns Updated user object after the refresh token has been updated in the database
 */
export async function updateRefreshToken(userId: string, refreshToken: string | null) {
	return prisma.user.update({
		where: { id: userId },
		data: { refreshToken },
	});
}

export async function validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
	const user = await prisma.user.findUnique({ where: { id: userId }, select: { refreshToken: true } });
	return user?.refreshToken === refreshToken;
}

/**
 * Creates a new user in the database with the provided email, password, and name. This function takes a data object containing the user's email, hashed password, and name, and uses Prisma to create a new user record in the database. It returns the created user object, including its ID, email, name, and role (if applicable).
 * @param data Object containing the email, hashed password, and name for the new user
 * @returns The created user object with its ID, email, name, and role
 */
export async function createUser(data: Pick<User, "email" | "password" | "name">) {
	return prisma.user.create({ data, select: { id: true, email: true, name: true, role: true } });
}
