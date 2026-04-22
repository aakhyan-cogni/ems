import { ObjectId } from "mongodb";
import { termsConfigs, users } from "@/lib";
import { DEFAULT_TERMS_VERSION } from "@/config/constants";
import type { TermsConfigDoc } from "@/models";

/**
 * Retrieves the active TermsConfig singleton. If no record exists, a default
 * record is created with the initial version. This keeps consent checks from
 * failing on a fresh database before any admin seeds the TermsConfig manually.
 * @returns The active TermsConfig record
 */
export async function getOrCreateTermsConfig() {
	const col = await termsConfigs();
	const existing = await col.findOne({});
	if (existing) {
		return {
			id: existing._id.toString(),
			currentVersion: existing.currentVersion,
			updatedAt: existing.updatedAt,
		};
	}

	const now = new Date();
	const doc: TermsConfigDoc = {
		currentVersion: DEFAULT_TERMS_VERSION,
		updatedAt: now,
	};
	const result = await col.insertOne(doc);
	return {
		id: result.insertedId.toString(),
		currentVersion: doc.currentVersion,
		updatedAt: doc.updatedAt,
	};
}

/**
 * Returns the current active terms version string.
 * @returns The current terms version (e.g. "v1.0")
 */
export async function getCurrentTermsVersion(): Promise<string> {
	const config = await getOrCreateTermsConfig();
	return config.currentVersion;
}

/**
 * Marks the given user as having accepted the current version of the terms.
 * Sets `consentAccepted`, `consentAcceptedAt`, and `consentVersion` on the user.
 * @param userId ID of the user accepting the terms
 * @returns The updated user record (consent fields only), or null if the user was not found
 */
export async function acceptConsent(userId: string) {
	const currentVersion = await getCurrentTermsVersion();
	const col = await users();
	const now = new Date();
	const doc = await col.findOneAndUpdate(
		{ _id: new ObjectId(userId) },
		{
			$set: {
				consentAccepted: true,
				consentAcceptedAt: now,
				consentVersion: currentVersion,
				updatedAt: now,
			},
		},
		{
			returnDocument: "after",
			projection: {
				consentAccepted: 1,
				consentAcceptedAt: 1,
				consentVersion: 1,
			},
		},
	);

	if (!doc) return null;
	return {
		id: doc._id.toString(),
		consentAccepted: doc.consentAccepted,
		consentAcceptedAt: doc.consentAcceptedAt ?? null,
		consentVersion: doc.consentVersion ?? null,
	};
}

/**
 * Fetches the consent state for a given user, including whether the user's
 * accepted version matches the current active terms version.
 * @param userId ID of the user to check
 * @returns Consent status payload: { accepted, userVersion, currentVersion, needsRenewal }
 */
export async function getConsentStatus(userId: string) {
	const col = await users();
	const [user, currentVersion] = await Promise.all([
		col.findOne({ _id: new ObjectId(userId) }, { projection: { consentAccepted: 1, consentVersion: 1 } }),
		getCurrentTermsVersion(),
	]);

	const accepted = Boolean(user?.consentAccepted);
	const userVersion = user?.consentVersion ?? null;
	const needsRenewal = !accepted || userVersion !== currentVersion;

	return { accepted, userVersion, currentVersion, needsRenewal };
}
