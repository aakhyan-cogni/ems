import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
	user: User | null;
	users: User[];
	setUser: (data: User | ((obj: User) => User)) => void;
	addUser: (data: User) => void;
	deleteUser: (email: string) => void;
}

export interface User {
	name: string;
	email: string;
	password: string;
	avatar?: string;
}

export const useLocalDB = create<State>()(
	persist(
		(set) => ({
			user: null,
			users: [],
			setUser(data) {
				if (typeof data !== "function") {
					set({ user: data });
				} else if (this.user) {
					const newUser = data(this.user);
					set({ user: newUser });
				}
			},
			addUser(data) {
				set((curr) => {
					return { users: [...curr.users, data] };
				});
			},
			deleteUser(email) {
				set((state) => {
					return {
						users: state.users.filter(u => u.email !== email)
					}
				})
			},
		}),
		{
			name: "localDB",
		},
	),
);
