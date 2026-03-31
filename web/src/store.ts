import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
	user: User | null;
	users: User[];
	setUser: (data: User | ((obj: User) => User) | null) => void;
	addUser: (data: User) => void;
	deleteUser: (email: string) => void;
	saveBasicProfile: (data: PersonalData & User) => void;
	saveAddress: (data: PersonalData & User) => void;
	saveOrganizationalInfo: (data:PersonalData & User) => void;
}

export interface User {
	name?: string;
	email?: string;
	password?: string;
	avatar?: string;
	personalData?: PersonalData;
}


export interface PersonalData{
	firstName?:string;
	lastName?:string;
	phoneNumber?:string;
	dob?:string;
	gender?:"Male" | "Female" | "Other" | string;
	country?:string;
	state?:string;
	city?:string;
	zipcode?:string;
	orgName?:string;
	role?:string;
	companyWebsite?:string;
	bio?:string;
}

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
			saveBasicProfile: (data) => set(state => ({
				...state,
				user:{
					...state.user,
					personalData:{...state.user?.personalData,
						firstName:(data.firstName)?data.firstName:state.user?.personalData?.firstName,
						lastName:(data.lastName)?data.lastName:state.user?.personalData?.lastName,
						email:(data.email)?data.email:state.user?.email,
						phoneNumber:(data.phoneNumber)?data.phoneNumber:state.user?.personalData?.phoneNumber,
						dob:(data.dob)?data.dob:state.user?.personalData?.dob,
						gender:(data.gender)?data.gender:state.user?.personalData?.gender
					}
				}
			})),
			saveAddress: (data) => set(state => ({
				...state,
				user:{
					...state.user,
					personalData:{...state.user?.personalData,
						country:(data.country)?data.country:state.user?.personalData?.country,
						state:(data.state)?data.state:state.user?.personalData?.state,
						city:(data.city)?data.city:state.user?.personalData?.city,
						zipcode:(data.zipcode)?data.zipcode:state.user?.personalData?.zipcode,
					}
				}
			})),
			saveOrganizationalInfo: (data) => set(state => ({
				...state,
				user:{
					...state.user,
					personalData:{...state.user?.personalData,
						orgName:(data.orgName)?data.orgName:state.user?.personalData?.orgName,
						role:(data.role)?data.role:state.user?.personalData?.role,
						companyWebsite:(data.companyWebsite)?data.city:state.user?.personalData?.companyWebsite,
						bio:(data.bio)?data.zipcode:state.user?.personalData?.bio,
					}
				}
			}))
		}),
		{
			name: "localDB",
		},
	),
);
