import type { TokenPayload } from "@/lib";

declare global {
	namespace Express {
		export interface Request {
			user?: TokenPayload;
		}
	}
}
