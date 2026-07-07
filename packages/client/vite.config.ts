import * as fs from "fs";
import pluginVue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import locales from "../../locales/index.js";
import meta from "../../package.json";
import pluginJson5 from "./vite.json5";

const extensions = [
	".ts",
	".tsx",
	".js",
	".jsx",
	".mjs",
	".json",
	".json5",
	".svg",
	".sass",
	".scss",
	".css",
	".vue",
];

export default defineConfig(({ command, mode }) => {
	fs.mkdirSync(`${__dirname}/../../built`, { recursive: true });
	fs.writeFileSync(
		`${__dirname}/../../built/meta.json`,
		JSON.stringify({ version: meta.version }),
		"utf-8",
	);

	return {
		base: "/assets/",

		plugins: [
			pluginVue(),
			pluginJson5(),
		],

		resolve: {
			extensions,
			alias: {
				"@/": `${__dirname}/src/`,
				"/client-assets/": `${__dirname}/assets/`,
				"/static-assets/": `${__dirname}/../backend/assets/`,
			},
		},

		define: {
			_VERSION_: JSON.stringify(meta.version),
			_LANGS_: JSON.stringify(
				Object.entries(locales).map(([k, v]) => [k, v._lang_]),
			),
			_ENV_: JSON.stringify(process.env.NODE_ENV),
			_DEV_: process.env.NODE_ENV !== "production" || process.env.VUE_ENV === "development",
			_PERF_PREFIX_: JSON.stringify("Misskey:"),
			_DATA_TRANSFER_DRIVE_FILE_: JSON.stringify("mk_drive_file"),
			_DATA_TRANSFER_DRIVE_FOLDER_: JSON.stringify("mk_drive_folder"),
			_DATA_TRANSFER_DECK_COLUMN_: JSON.stringify("mk_deck_column"),
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: process.env.VUE_ENV === "development",
		},

		build: {
			target: "es2022",
			manifest: "manifest.json",
			rollupOptions: {
				strictDeprecations: true,
				input: {
					app: "./src/init.ts",
				},
				output: {
					manualChunks: {
						animation: ["matter-js", "gsap"],
						charts: [
							"chart.js",
							"chartjs-adapter-date-fns",
							"chartjs-chart-matrix",
							"chartjs-plugin-gradient",
							"chartjs-plugin-zoom",
						],
						media: ["photoswipe", "swiper", "cropperjs"],
						syntax: ["katex", "prismjs"],
						vue: ["vue"],
					},
				},
			},
			cssCodeSplit: true,
			assetsInlineLimit: 0,
			outDir: `${__dirname}/../../built/_client_dist_`,
			assetsDir: ".",
			emptyOutDir: false,
			sourcemap: true,
			reportCompressedSize: false,
			commonjsOptions: {
				include: [/iceshrimp-sdk/, /node_modules/],
			},
		},
		optimizeDeps: {
			auto: true,
		},

		logLevel: "warn",
	};
});
