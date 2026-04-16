import { Request, Response } from "express";
import * as UserService from "@/services/user.service";
import { User } from "@prisma/client";
import { excludeFields } from "@/lib/util";

export async function getUserProfile(req: Request, res: Response) {
	try {
		if (!req.user) throw new Error("User not authenticated");

		const userId = req.user.userId;
		const user = await UserService.getUserById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ user: excludeFields(user, ["password", "refreshToken"]) });
	} catch (error) {
		console.error("[getUserProfile] Error in User controller:", error);
		res.status(500).json({ message: "Error fetching user profile" });
	}
}

export async function updateUser(req: Request, res: Response) {
	try {
		if (!req.user) throw new Error("User not authenticated");

		const userId = req.user.userId;
		const { data } = req.body as { data: Partial<User> };

		const updatedUser = await UserService.updateUser(userId, data);
		res.json({
			message: "User profile updated successfully",
			user: excludeFields(updatedUser, ["password", "refreshToken"]),
		});
	} catch (error) {
		console.error("[updateUser] Error in User controller:", error);
		res.status(500).json({ message: "Error updating user profile" });
	}
}
