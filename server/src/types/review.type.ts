import { User } from "./user.type";

export interface Review {
	id: string;
	review: string;
	author: User;
	createdAt: Date;
	updatedAt: Date;
}
