import { prisma } from "@/lib";
import { DEFAULT_TERMS_VERSION } from "@/config/constants";

/**
 * Retrieves the active TermsConfig singleton. If no record exists, a default
 * record is created with the initial version. This keeps consent checks from
 * failing on a fresh database before any admin seeds the TermsConfig manually.
 * @returns The active TermsConfig record
 */
export async function getOrCreateTermsConfig() {
	const existing = await prisma.termsConfig.findFirst();
	if (existing) return existing;

	return prisma.termsConfig.create({
		data: { currentVersion: DEFAULT_TERMS_VERSION },
	});
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
 * @returns The updated user record (consent fields only)
 */
export async function acceptConsent(userId: string) {
	const currentVersion = await getCurrentTermsVersion();
	return prisma.user.update({
		where: { id: userId },
		data: {
			consentAccepted: true,
			consentAcceptedAt: new Date(),
			consentVersion: currentVersion,
		},
		select: {
			id: true,
			consentAccepted: true,
			consentAcceptedAt: true,
			consentVersion: true,
		},
	});
}

/**
 * Fetches the consent state for a given user, including whether the user's
 * accepted version matches the current active terms version.
 * @param userId ID of the user to check
 * @returns Consent status payload: { accepted, userVersion, currentVersion, needsRenewal }
 */
export async function getConsentStatus(userId: string) {
	const [user, currentVersion] = await Promise.all([
		prisma.user.findUnique({
			where: { id: userId },
			select: { consentAccepted: true, consentVersion: true },
		}),
		getCurrentTermsVersion(),
	]);

	const accepted = Boolean(user?.consentAccepted);
	const userVersion = user?.consentVersion ?? null;
	const needsRenewal = !accepted || userVersion !== currentVersion;

	return { accepted, userVersion, currentVersion, needsRenewal };
}
