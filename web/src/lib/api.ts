import { logout as logoutReq } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = "http://localhost:5000/api";

type FetchOptions = RequestInit & { body?: any };

let refreshPromise: Promise<{ accessToken: string }> | null = null;

/**
 * A helper function to make API requests with automatic token handling and error management.
 * @param endpoint - The API endpoint to call (e.g., "/auth/login").
 * @param options - Optional fetch configuration, including method, headers, and body.
 * @returns The JSON response from the API if the request is successful.
 * @throws An error if the API request fails, including the error message from the response if available.
 */
export async function apiFetch(endpoint: API_PATH, options: FetchOptions = {}) {
	const { accessToken, setAccessToken, logout } = useAuthStore.getState();
	const headers: HeadersInit = new Headers(options?.headers || {});
	headers.set("Content-Type", "application/json");

	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}

	const config: RequestInit = {
		...options,
		headers,
		credentials: "include",
		body: options.body,
	};

	let response = await fetch(`${BASE_URL}${endpoint}`, config);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "API request failed");
	}

	if (response.status === 401 && endpoint !== "/auth/login") {
		try {
			if (!refreshPromise) {
				refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
					method: "POST",
					credentials: "include",
				}).then((res) => {
					if (!res.ok) throw new Error("Session expired. Please log in again.");
					return res.json();
				});
			}
			const { accessToken } = await refreshPromise;
			refreshPromise = null;
			setAccessToken(accessToken);

			headers.set("Authorization", `Bearer ${accessToken}`);
			response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers });
		} catch (error) {
			refreshPromise = null;
			logout();
			logoutReq();
			throw new Error(error instanceof Error ? error.message : "Session expired. Please log in again.");
		}
	}

	return response.json();
}

type API_PATH =
	| `/auth/login` //
	| `/auth/register` //
	| `/auth/refresh` //
	| `/auth/logout` //
	| `/user/profile` //
	| `/events`;
