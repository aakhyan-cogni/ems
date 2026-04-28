import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts","src/seed.ts"],
	format: ["esm"], // This ensures you get .js (ESM) output
	dts: true, // Generates declaration files (.d.ts)
	splitting: false,
	sourcemap: true,
	clean: true, // Cleans dist folder before every build
	minify: false, // Keep it readable for dev
	target: "esnext",
	shims: true,
	skipNodeModulesBundle: true,
});
