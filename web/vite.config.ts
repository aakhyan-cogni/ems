import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		{
			name: "ignore-devtools-json",
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					if (req.url?.includes(".well-known/appspecific/com.chrome.devtools.json")) {
						res.statusCode = 404;
						return res.end();
					}
					next();
				});
			},
		},
		reactRouter(),
		tsconfigPaths(),
	],
	css: {
		preprocessorOptions: {
			scss: {
				silenceDeprecations: ["import", "mixed-decls", "color-functions", "global-builtin", "if-function"],
			},
		},
	},
});
