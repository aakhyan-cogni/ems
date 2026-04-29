import { Request, Response } from "express";
import * as AdminService from "@/services/admin.service";
import type { EventStatus, Role } from "@/models";

export async function listUsers(req: Request, res: Response) {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;

		const roleParam = req.query.role as string | undefined;
		const role: Role | undefined = roleParam === "USER" || roleParam === "ADMIN" ? roleParam : undefined;

		const result = await AdminService.getPaginatedUsers(page, limit, role);
		res.json(result);
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function updateUserRole(req: Request, res: Response) {
	try {
		const id = req.params.id as string;
		const { role } = req.body as { role: Role };

		if (role !== "USER" && role !== "ADMIN") {
			res.status(400).json({ message: "Invalid role. Must be USER or ADMIN." });
			return;
		}

		const updated = await AdminService.updateUserRole(id, role);
		if (!updated) {
			res.status(404).json({ message: "User not found" });
			return;
		}
		res.json({ message: "Role updated" });
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function listEvents(req: Request, res: Response) {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;
		const status = req.query.status as EventStatus | undefined;

		const result = await AdminService.getPaginatedEvents(page, limit, status);
		res.json(result);
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function approveEvent(req: Request<{ id: string }>, res: Response) {
	try {
		const updated = await AdminService.approveEvent(req.params.id);
		if (!updated) {
			res.status(404).json({ message: "Event not found" });
			return;
		}
		// TODO: trigger notification (S2-022)
		res.json({ message: "Event approved" });
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function rejectEvent(req: Request<{ id: string }>, res: Response) {
	try {
		const { reason } = req.body as { reason: string };
		if (!reason?.trim()) {
			res.status(400).json({ message: "Rejection reason is required" });
			return;
		}

		const updated = await AdminService.rejectEvent(req.params.id, reason);
		if (!updated) {
			res.status(404).json({ message: "Event not found" });
			return;
		}
		// TODO: trigger notification (S2-022)
		res.json({ message: "Event rejected" });
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function getStats(_req: Request, res: Response) {
	try {
		const stats = await AdminService.getStats();
		res.json(stats);
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}
