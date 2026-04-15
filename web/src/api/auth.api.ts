import { apiFetch } from "../lib/api";

export function login(email: string, password: string) {
	return apiFetch("/auth/login", {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});
}

export function register(name: string, email: string, password: string) {
	return apiFetch("/auth/register", {
		method: "POST",
		body: JSON.stringify({ name, email, password }),
	});
}

export function refreshToken() {
	return apiFetch("/auth/refresh", { method: "POST" });
}

export function logout() {
	return apiFetch("/auth/logout", { method: "POST" });
}
