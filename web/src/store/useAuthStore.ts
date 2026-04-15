import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
	id: string;
	email: string;
	name: string;
	avatar: string;
	role?: string;
	phoneNumber?: string;
	dob?: string;
	gender?: "Male" | "Female" | "Others";
	country?: string;
	city?: string;
	state?: string;
	zipcode?: string;
	orgName?: string;
	designation?: string;
	companyWebsite?: string;
	bio?: string;
}

interface AuthState {
	user: User | null;
	accessToken: string | null;
	isAuthenticated: boolean;

	setAuth: (user: User, accessToken: string) => void;
	updateUser: (userData: Partial<User>) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			isAuthenticated: false,

			// Call this after successful Login/Register/Refresh
			setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),

			// For profile updates
			updateUser: (userData) =>
				set((state) => ({
					user: state.user ? { ...state.user, ...userData } : null,
				})),

			// Clear everything on logout
			logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
			// We only want to persist user info, not necessarily the token
			// if you want higher security (forcing refresh on tab close)
			partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
		},
	),
);
