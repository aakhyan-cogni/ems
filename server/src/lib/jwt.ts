import type { Role, User } from "@/models";
import jwt from "jsonwebtoken";
import { assert } from "node:console";

export interface TokenPayload {
	userId: string;
	email: string;
	role: Role;
}

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = Number(process.env.ACCESS_TOKEN_EXPIRY);
const REFRESH_TOKEN_EXPIRY = Number(process.env.REFRESH_TOKEN_EXPIRY);

// Assert that the necessary environment variables are set
assert(ACCESS_SECRET, "ACCESS_TOKEN_SECRET is not set in environment variables");
assert(REFRESH_SECRET, "REFRESH_TOKEN_SECRET is not set in environment variables");
assert(ACCESS_TOKEN_EXPIRY, "ACCESS_TOKEN_EXPIRY is not set in environment variables");
assert(REFRESH_TOKEN_EXPIRY, "REFRESH_TOKEN_EXPIRY is not set in environment variables");

/**
 * Generates a refresh token for the given payload. Refresh tokens are long-lived and can be used to obtain new access tokens.
 * @param payload Token payload
 * @returns Refresh Token (long lived)
 */
export const generateRefreshToken = (payload: TokenPayload) => {
	return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

/**
 * Generates an access token for the given payload. Access tokens are short-lived and are used to authenticate API requests.
 * @param payload Token payload
 * @returns Access Token (short lived)
 */
export const generateAccessToken = (payload: TokenPayload) => {
	return jwt.sign(payload, ACCESS_SECRET, {
		expiresIn: ACCESS_TOKEN_EXPIRY,
	});
};

/**
 * Verifies the given access token and returns the decoded payload if valid. Throws an error if the token is invalid or expired.
 * @param token Access token to verify
 * @returns Decoded token payload if valid
 * @throws Error if token is invalid or expired
 */
export const verifyAccessToken = (token: string): TokenPayload => {
	return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

/**
 * Verifies the given refresh token and returns the decoded payload if valid. Throws an error if the token is invalid or expired.
 * @param token Refresh token to verify
 * @return Decoded token payload if valid
 * @throws Error if token is invalid or expired
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
	return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};

/**
 * Generates both access and refresh tokens for a given user. The access token is short-lived and used for authenticating API requests, while the refresh token is long-lived and can be used to obtain new access tokens when the old one expires.
 * @param user User object containing id, email, and optional role
 * @returns An object containing both accessToken and refreshToken
 */
export const generateTokens = (user: BasicUser & Partial<User>) => {
	const payload: TokenPayload = {
		userId: user.id,
		email: user.email,
		role: user.role || "USER" as Role,
	};

	return {
		accessToken: generateAccessToken(payload),
		refreshToken: generateRefreshToken(payload),
	};
};

interface BasicUser {
	id: string;
	email: string;
	role?: Role | null;
}
