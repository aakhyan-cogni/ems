import type { ObjectId } from "mongodb";

export interface TermsConfigDoc {
	_id?: ObjectId;
	currentVersion: string;
	updatedAt: Date;
}

export type TermsConfig = Omit<TermsConfigDoc, "_id"> & { id: string };

export const TERMS_CONFIG_COLLECTION = "TermsConfig";
