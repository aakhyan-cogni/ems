import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = "http://localhost:5000/api";

type FetchOptions = RequestInit & { body?: any };

/**
 * A helper function to make API requests with automatic token handling and error management.
 * @param endpoint - The API endpoint to call (e.g., "/auth/login").
 * @param options - Optional fetch configuration, including method, headers, and body.
 * @returns The JSON response from the API if the request is successful.
 * @throws An error if the API request fails, including the error message from the response if available.
 */
export async function apiFetch(endpoint: API_PATH, options: FetchOptions = {}) {
	const { accessToken } = useAuthStore.getState();
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

	const response = await fetch(`${BASE_URL}${endpoint}`, config);

	if (!response.ok) {
		console.log(response);
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "API request failed");
	}

	if (response.status === 401 && endpoint !== "/auth/login") {
		useAuthStore.getState().logout();
	}

	return response.json();
}

type API_PATH =
	| `/auth/login` //
	| `/auth/register` //
	| `/auth/refresh` //
	| `/auth/logout` //
	| `/events`;
