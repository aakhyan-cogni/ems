import { Request, Response } from "express";
import * as ConsentService from "@/services/consent.service";

/**
 * Records the authenticated user's acceptance of the current Terms of Service
 * version. Sets `consentAccepted`, `consentAcceptedAt`, and `consentVersion` on
 * the user record to the active TermsConfig version.
 * @param req Express request object (requires authenticated user)
 * @param res Express response object used to return the acceptance result
 */
export async function acceptConsent(req: Request, res: Response) {
	try {
		if (!req.user) throw new Error("User not authenticated");

		await ConsentService.acceptConsent(req.user.userId);
		res.status(200).json({ ok: true });
	} catch (error) {
		console.error("[acceptConsent] Error in Consent controller:", error);
		res.status(500).json({ message: "Error accepting consent" });
	}
}

/**
 * Returns the consent status for the authenticated user, including the current
 * active terms version and whether the user needs to re-accept the terms.
 * @param req Express request object (requires authenticated user)
 * @param res Express response object returning { accepted, userVersion, currentVersion, needsRenewal }
 */
export async function getConsentStatus(req: Request, res: Response) {
	try {
		if (!req.user) throw new Error("User not authenticated");

		const status = await ConsentService.getConsentStatus(req.user.userId);
		res.status(200).json(status);
	} catch (error) {
		console.error("[getConsentStatus] Error in Consent controller:", error);
		res.status(500).json({ message: "Error fetching consent status" });
	}
}
