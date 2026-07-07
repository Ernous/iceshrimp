import { defineConfig } from "tsup";
import fs from "node:fs";
import locales from "../../locales/index.js";

const isProduction = process.env.NODE_ENV === "production";
const meta = JSON.parse(fs.readFileSync("../../package.json", "utf8"));

export default defineConfig({
	entry: ["src/sw.ts"],
	splitting: false,
	sourcemap: true,
	clean: true,
	outDir: "../../built/_sw_dist_",
	minify: isProduction,
	define: {
		_VERSION_: JSON.stringify(meta.version),
		_LANGS_: JSON.stringify(
			Object.entries(locales).map(([k, v]) => [k, v._lang_]),
		),
		_ENV_: JSON.stringify(process.env.NODE_ENV ?? "development"),
		_DEV_: isProduction ? "false" : "true",
		_PERF_PREFIX_: JSON.stringify("IceShrimp:"),
	},
});
