import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/lib";

/**
 * Middleware function to authenticate incoming requests using JWT access tokens. This function checks for the presence of an Authorization header with a Bearer token, verifies the token's validity, and if valid, attaches the decoded token payload to the request object for use in subsequent middleware or route handlers. If the token is missing, invalid, or expired, it returns a 401 Unauthorized response with an appropriate error message.
 * @param req Express request object containing the Authorization header
 * @param res Express response object used to send back the result of the authentication process
 * @param next Next function to pass control to the next middleware or route handler if authentication is successful
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const token = authHeader.split(" ")[1];
		const decoded = verifyAccessToken(token);

		req.user = decoded;
		next();
	} catch (error) {
		console.error("[authenticate] Error in auth middleware:", error);
		res.status(401).json({ message: "Invalid or expired token" });
	}
}

/**
 * Middleware function to authorize users based on their roles. This function checks if the authenticated user has the necessary permissions to access a particular route or resource. It takes an array of allowed roles as an argument and compares it against the user's role stored in the request object (set by the authenticate middleware). If the user does not have the required role, it returns a 403 Forbidden response with an appropriate error message. If the user is authorized, it passes control to the next middleware or route handler.
 * @param roles Array of allowed roles that can access the route or resource
 * @returns Middleware function that checks the user's role against the allowed roles and either authorizes the user or returns a 403 Forbidden response
 */
export async function authorize(roles: string[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ message: "Forbidden: You do not have permission" });
		}
		next();
	};
}
