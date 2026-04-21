import { Request, Response, NextFunction } from "express";
import * as ConsentService from "@/services/consent.service";

/**
 * Middleware that enforces the authenticated user has accepted the current
 * version of the Terms of Service. Must run after the `authenticate` middleware
 * so that `req.user` is populated. If the user has not accepted the terms, or
 * their accepted version does not match the active TermsConfig version, the
 * request is rejected with `403 CONSENT_REQUIRED` so the frontend can surface
 * the re-consent modal.
 * @param req Express request object (requires authenticated user)
 * @param res Express response object used to send the 403 response on failure
 * @param next Next function to pass control along when consent is valid
 */
export async function consentCheck(req: Request, res: Response, next: NextFunction) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const status = await ConsentService.getConsentStatus(req.user.userId);
		if (status.needsRenewal) {
			return res.status(403).json({
				code: "CONSENT_REQUIRED",
				message: "Consent required",
				currentVersion: status.currentVersion,
				userVersion: status.userVersion,
			});
		}

		next();
	} catch (error) {
		console.error("[consentCheck] Error in consent middleware:", error);
		res.status(500).json({ message: "Error verifying consent" });
	}
}
