import { ObjectId } from "mongodb";
import { users } from "@/lib";
import { fromDoc, type User, type UserDoc } from "@/models";

export async function getUserById(id: string): Promise<User | null> {
	const col = await users();
	const doc = await col.findOne({ _id: new ObjectId(id) });

	if (!doc) return null;

	if (!doc.role || !doc.tier) {
		col.updateOne(
			{ _id: new ObjectId(id) },
			{
				$set: {
					role: doc.role ?? "USER",
					tier: doc.tier ?? "FREE",
					updatedAt: new Date(),
				},
			},
		);

		doc.role = doc.role ?? "USER";
		doc.tier = doc.tier ?? "FREE";
	}

	return fromDoc<UserDoc>(doc);
}

export async function updateUser(id: string, userData: Partial<Omit<User, "id">>): Promise<User> {
	const col = await users();
	const { id: _ignored, ...rest } = userData as Partial<User>;
	const doc = await col.findOneAndUpdate(
		{ _id: new ObjectId(id) },
		{ $set: { ...rest, updatedAt: new Date() } },
		{ returnDocument: "after" },
	);
	const mapped = fromDoc<UserDoc>(doc);
	if (!mapped) throw new Error(`User not found: ${id}`);
	return mapped;
}
