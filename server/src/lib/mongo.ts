import "dotenv/config";
import { MongoClient, type Db, type Collection } from "mongodb";
import {
	USER_COLLECTION,
	TERMS_CONFIG_COLLECTION,
	EVENT_COLLECTION,
	type UserDoc,
	type TermsConfigDoc,
	type EventDoc,
} from "@/models";
import { assert } from "node:console";

const uri = process.env.DATABASE_URL;
assert(uri, "DATABASE_URL environment variable is required");

const client = new MongoClient(uri);
let dbPromise: Promise<Db> | null = null;

function getDb(): Promise<Db> {
	if (!dbPromise) {
		dbPromise = client.connect().then((c) => c.db());
	}
	return dbPromise;
}

async function collection<T extends object>(name: string): Promise<Collection<T>> {
	const db = await getDb();
	return db.collection<T>(name);
}

export const users = () => collection<UserDoc>(USER_COLLECTION);
export const termsConfigs = () => collection<TermsConfigDoc>(TERMS_CONFIG_COLLECTION);
export const events = () => collection<EventDoc>(EVENT_COLLECTION);

export { client as mongoClient, getDb };
