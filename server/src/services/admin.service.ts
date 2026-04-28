import { ObjectId, Filter } from "mongodb";
import { users, events } from "@/lib";
import { fromDoc, type Role, UserDoc, EventDoc } from "@/models";

export async function getPaginatedUsers(page: number, limit: number, role?: Role) {
	const col = await users();
	const filter: Filter<UserDoc> = role ? { role } : {};

	const docs = await col
		.find(filter)
		.project({ password: 0, refreshToken: 0 })
		.skip((page - 1) * limit)
		.limit(limit)
		.toArray();

	const total = await col.countDocuments(filter);

	return {
		users: docs.map(fromDoc),
		total,
		page,
		totalPages: Math.ceil(total / limit),
	};
}

export async function updateUserRole(userId: string, role: Role) {
	const col = await users();
	const result = await col.updateOne({ _id: new ObjectId(userId) }, { $set: { role, updatedAt: new Date() } });
	return result.matchedCount > 0;
}

export async function getPaginatedEvents(page: number, limit: number, status?: string) {
	const col = await events();
	const filter: Filter<EventDoc> = status ? { status } : {};

	const docs = await col
		.find(filter)
		.skip((page - 1) * limit)
		.limit(limit)
		.toArray();

	const total = await col.countDocuments(filter);

	return {
		events: docs.map(fromDoc),
		total,
		page,
		totalPages: Math.ceil(total / limit),
	};
}

export async function approveEvent(eventId: string) {
	const col = await events();
	const result = await col.updateOne(
		{ _id: new ObjectId(eventId) },
		{ $set: { status: "APPROVED", updatedAt: new Date() } },
	);
	return result.matchedCount > 0;
}

export async function rejectEvent(eventId: string, reason: string) {
	const col = await events();
	const result = await col.updateOne(
		{ _id: new ObjectId(eventId) },
		{ $set: { status: "REJECTED", rejectionReason: reason, updatedAt: new Date() } },
	);
	return result.matchedCount > 0;
}

export async function getStats() {
	const usersCol = await users();
	const eventsCol = await events();

	const [totalUsers, totalEvents, pendingApprovals] = await Promise.all([
		usersCol.countDocuments(),
		eventsCol.countDocuments(),
		eventsCol.countDocuments({ status: "PENDING_REVIEW" }),
	]);

	return { totalUsers, totalEvents, pendingApprovals, totalRegistrations: 0 };
}
