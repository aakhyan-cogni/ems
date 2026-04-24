import { Request, Response } from "express";
import * as AuthService from "@/services/auth.service";
import { generateTokens, verifyRefreshToken } from "@/lib";
import { excludeFields } from "@/lib/util";

/**
 * Registers a new user with the provided email, password, and name. This function first checks if a user with the given email already exists in the database. If not, it hashes the provided password, creates a new user record in the database, generates access and refresh tokens for the new user, and updates the user's record with the refresh token. Finally, it returns a success response with the access token and user information. If any step fails, it returns an appropriate error response.
 * @param req Express request object containing the user's email, password, and name in the body
 * @param res Express response object used to send back the result of the registration process
 */
export async function register(req: Request, res: Response) {
	try {
		const { email, password, name } = req.body as Record<string, string>;
		const { termsAccepted } = req.body as { termsAccepted: boolean };

		if (!termsAccepted) {
			return res.status(400).json({ message: "You must accept the Terms and Conditions to register" });
		}

		// Check if user already exists
		const existingUser = await AuthService.findUserByEmail(email);
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Hash the password
		const hashedPassword = await AuthService.hashPassword(password);
		const user = await AuthService.createUser({ email, password: hashedPassword, name, termsAccepted });

		// Generate tokens
		const tokens = generateTokens(user);
		await AuthService.updateRefreshToken(user.id, tokens.refreshToken);

		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
		});

		res.status(201).json({
			message: "User registered successfully",
			accessToken: tokens.accessToken,
			user,
		});
	} catch (error) {
		console.error("[register] Error in Auth controller:", error);
		res.status(500).json({ message: "Error registering user" });
	}
}

/**
 * Logs in a user with the provided email and password. This function checks if a user with the given email exists, verifies the provided password against the stored hashed password, generates access and refresh tokens if the credentials are valid, updates the user's record with the new refresh token, and returns a success response with the access token and user information. If any step fails (e.g., user not found, invalid password), it returns an appropriate error response.
 * @param req Express request object containing the user's email and password in the body
 * @param res Express response object used to send back the result of the login process
 */
export async function login(req: Request, res: Response) {
	try {
		const { email, password } = req.body as Record<string, string>;

		const user = await AuthService.findUserByEmail(email);
		if (!user) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		const isPasswordValid = await AuthService.comparePassword(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		// Generate tokens
		const tokens = generateTokens(user);
		await AuthService.updateRefreshToken(user.id, tokens.refreshToken);

		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
		});

		res.status(200).json({
			message: "Login successful",
			accessToken: tokens.accessToken,
			user: excludeFields(user, ["password", "refreshToken"]),
		});
	} catch (error) {
		console.error("[login] Error in Auth controller:", error);
		res.status(500).json({ message: "Error logging in" });
	}
}

/**
 * Refreshes the access token using a valid refresh token. This function checks for the presence of a refresh token in the request cookies, verifies its validity, and if valid, generates a new access token and refresh token for the user. It then updates the user's record with the new refresh token and returns the new access token in the response. If the refresh token is missing, invalid, or if any other error occurs during the process, it returns an appropriate error response.
 * @param req Express request object containing the refresh token in the cookies
 * @param res Express response object used to send back the result of the token refresh process
 */
export async function refresh(req: Request, res: Response) {
	try {
		const refreshToken: string | undefined = req.cookies.refreshToken;
		if (!refreshToken) {
			return res.status(401).json({ message: "Refresh token missing" });
		}

		const decoded = verifyRefreshToken(refreshToken);
		const isValid = await AuthService.validateRefreshToken(decoded.userId, refreshToken);

		if (!isValid) {
			return res.status(403).json({ message: "Invalid refresh token" });
		}

		const user = await AuthService.findUserByEmail(decoded.email);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
		await AuthService.updateRefreshToken(user.id, tokens.refreshToken);

		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
		});

		res.status(200).json({ accessToken: tokens.accessToken });
	} catch (error) {
		res.status(403).json({ message: "Session Expired" });
	}
}

/**
 * Logs out a user by invalidating their refresh token. This function checks for the presence of a refresh token in the request cookies, verifies its validity, and if valid, updates the user's record in the database to remove the stored refresh token. It then clears the refresh token cookie from the client's browser and returns a success response. If any error occurs during this process (e.g., invalid token, database error), it returns an appropriate error response.
 * @param req Express request object containing the refresh token in the cookies
 * @param res Express response object used to send back the result of the logout process
 */
export async function logout(req: Request, res: Response) {
	try {
		const refreshToken: string | undefined = req.cookies.refreshToken;
		if (refreshToken) {
			try {
				const decoded = verifyRefreshToken(refreshToken);
				await AuthService.updateRefreshToken(decoded.userId, null);
			} catch (error) {
				console.debug("[logout] Invalid refresh token during logout:", error);
			}
		}

		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});

		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("[logout] Error in Auth controller:", error);
		res.status(500).json({ message: "Error logging out" });
	}
}
