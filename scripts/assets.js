import { mkdir, writeFile, cp } from "node:fs/promises";
import locales from "../locales/index.js";
import meta from "../package.json" with { type: "json" };
import { build } from "esbuild";

const customDir = process.env.ICESHRIMP_CUSTOM_DIR ?? "./custom";

Promise.all([
	// copy:client:locales
	(async () => {
		await mkdir("./built/_client_dist_/locales", { recursive: true });

		const v = { _version_: meta.version };

		for (const [lang, locale] of Object.entries(locales)) {
			await writeFile(
				`./built/_client_dist_/locales/${lang}.${meta.version}.json`,
				JSON.stringify({ ...locale, ...v }),
				"utf-8",
			);
		}
	})(),
	// copy:backend:views
	cp(
		"./packages/backend/src/server/web/views",
		"./packages/backend/built/server/web/views",
		{ recursive: true },
	),
	// copy:backend:custom
	cp(`${customDir}/assets`, "./packages/backend/assets", {
		recursive: true,
	}),
	// build:backend:script
	build({
		entryPoints: [
			"./packages/backend/src/server/web/boot.js",
			"./packages/backend/src/server/web/bios.js",
			"./packages/backend/src/server/web/cli.js",
		],
		outdir: "./packages/backend/built/server/web/",
		define: {
			LANGS: JSON.stringify(Object.keys(locales)),
		},
		minify: true,
	}),
	// build:backend:style
	build({
		entryPoints: [
			"./packages/backend/src/server/web/style.css",
			"./packages/backend/src/server/web/bios.css",
			"./packages/backend/src/server/web/cli.css",
		],
		outdir: "./packages/backend/built/server/web/",
		minify: true,
	}),
]);
