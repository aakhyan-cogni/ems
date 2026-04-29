export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string;
			ACCESS_TOKEN_SECRET: string;
			REFRESH_TOKEN_SECRET: string;
			ACCESS_TOKEN_EXPIRY: string;
			REFRESH_TOKEN_EXPIRY: string;
			PORT?: string;
			ADMIN_EMAIL: string;
			ADMIN_PASSWORD: string;
			USER_EMAIL: string;
			USER_PASSWORD: string;
		}
	}
}
