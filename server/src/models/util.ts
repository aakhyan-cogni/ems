import type { ObjectId, WithId } from "mongodb";

/**
 * Utility function to convert a MongoDB document with an ObjectId to a plain object with a string id.
 * @param doc - The MongoDB document to convert.
 * @returns An object with the same properties as the input document, but with the _id field replaced by an id field of type string.
 */
export function fromDoc<T extends { _id?: ObjectId }>(
	doc: WithId<T> | T | null,
): (Omit<T, "_id"> & { id: string }) | null {
	if (!doc) return null;
	const { _id, ...rest } = doc as T & { _id: ObjectId };
	return { ...(rest as Omit<T, "_id">), id: _id.toString() };
}
