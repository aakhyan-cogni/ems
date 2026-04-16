import { prisma } from "@/lib";
import { User } from "@prisma/client";

export async function getUserById(id: string) {
	return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(id: string, userData: Partial<User>) {
	return prisma.user.update({ where: { id }, data: userData });
}
