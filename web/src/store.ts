import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
	user: User | null;
	users: User[];
	setUser: (data: User | ((obj: User) => User) | null) => void;
	addUser: (data: User) => void;
	deleteUser: (email: string) => void;
}

export interface User {
	name: string;
	email: string;
	password: string;
	avatar?: string;
	phoneNumber?: string;
	dob?: string;
	gender?: Gender;
	country?: string;
	city?: string;
	state?: string;
	zipcode?: string;
	orgName?: string;
	role?: string;
	companyWebsite?: string;
	bio?: string;
}

type Gender = "Male" | "Female" | "Others";

export const useLocalDB = create<State>()(
	persist(
		(set) => ({
			user: null,
			users: [],
			setUser(data) {
				if (typeof data !== "function") {
					set({ user: data });
				} else {
					set((state) => {
						if (!state.user) return state;
						const newUser = data(state.user);
						const updatedUsers = state.users.map((u) => {
							if (u.email === newUser.email) return newUser;
							return u;
						});
						return { user: newUser, users: updatedUsers };
					});
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
						users: state.users.filter((u) => u.email !== email),
					};
				});
			},
		}),
		{
			name: "localDB",
		},
	),
);
