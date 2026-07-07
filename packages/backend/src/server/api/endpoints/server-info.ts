import * as os from "node:os";
import * as fs from "node:fs";
import define from "../define.js";
import { fetchMeta } from "@/misc/fetch-meta.js";

export const meta = {
	requireCredential: false,
	requireCredentialPrivateMode: true,
	allowGet: true,
	cacheSec: 30,
	tags: ["meta"],
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async () => {
	const instanceMeta = await fetchMeta();
	if (!instanceMeta.enableServerMachineStats) {
		return {
			machine: "Not specified",
			cpu: {
				model: "Not specified",
				cores: 0,
			},
			mem: {
				total: 0,
			},
			fs: {
				total: 0,
				used: 0,
			},
		};
	}

	let fsTotal = 0;
	let fsUsed = 0;
	try {
		const stats = fs.statfsSync("/");
		fsTotal = stats.blocks * stats.bsize;
		fsUsed = (stats.blocks - stats.bfree) * stats.bsize;
	} catch {}

	return {
		machine: os.hostname(),
		cpu: {
			model: os.cpus()[0].model,
			cores: os.cpus().length,
		},
		mem: {
			total: os.totalmem(),
		},
		fs: {
			total: fsTotal,
			used: fsUsed,
		},
	};
});
