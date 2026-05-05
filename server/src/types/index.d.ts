import type { TokenPayload } from "@/lib";

declare global {
	namespace Express {
		export interface Request {
			user?: TokenPayload;
			id: string;      // Used in event.organizerId comparison
                email: string;   // Used for organizerEmail
                tier: "FREE" | "PRO" | "ENTERPRISE"; // Used for tierCheck
                role: "user" | "admin";             // Used for admin overrides
                isAdmin: boolean;
		}
	}
}
